<?php
require_once '../config/database.php';

setCorsHeaders();

function respond($status, $payload)
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function createCheckoutUrl($checkoutUrl)
{
    $url = filter_var($checkoutUrl, FILTER_VALIDATE_URL) ? parse_url($checkoutUrl) : false;
    if (!$url || ($url['scheme'] ?? '') !== 'https' || ($url['host'] ?? '') !== 'checkout.paymongo.com') {
        throw new RuntimeException('PayMongo returned an invalid checkout URL.');
    }
    return $checkoutUrl;
}

function validAppUrl($appUrl)
{
    $app = $appUrl ? parse_url($appUrl) : false;
    $isLocalHttp = $app && ($app['scheme'] ?? '') === 'http' && in_array($app['host'] ?? '', ['localhost', '127.0.0.1'], true);
    if (!$app || !in_array($app['scheme'] ?? '', ['https', 'http'], true) || (!$isLocalHttp && ($app['scheme'] ?? '') !== 'https') || empty($app['host']) || empty($app['path'])) {
        return false;
    }
    return $app;
}

function appPageUrl($appUrl, $page, $params)
{
    $app = validAppUrl($appUrl);
    if (!$app) {
        throw new RuntimeException('The configured app URL is invalid.');
    }
    $directory = rtrim(str_replace('\\', '/', dirname($app['path'])), '/');
    $path = ($directory === '' ? '' : $directory) . '/' . $page;
    $url = $app['scheme'] . '://' . $app['host'];
    if (!empty($app['port'])) {
        $url .= ':' . $app['port'];
    }
    return $url . $path . '?' . http_build_query($params, '', '&', PHP_QUERY_RFC3986);
}

function memberByPaymentToken($db, $token, $forUpdate = false)
{
    if (!is_string($token) || !preg_match('/^[a-f0-9]{64}$/', $token)) {
        return false;
    }
    $sql = 'SELECT m.id, m.name, m.fee FROM member_payment_links l JOIN members m ON m.id = l.member_id WHERE l.token_hash = ?';
    if ($forUpdate) {
        $sql .= ' FOR UPDATE';
    }
    $stmt = $db->prepare($sql);
    $stmt->execute([hash('sha256', $token)]);
    return $stmt->fetch();
}

function memberOutstandingCents($db, $member)
{
    $paidStmt = $db->prepare('SELECT COALESCE(SUM(amount), 0) FROM collections WHERE member_id = ?');
    $paidStmt->execute([$member['id']]);
    $paidCents = (int) round((float) $paidStmt->fetchColumn() * 100);
    $reservedStmt = $db->prepare("SELECT COALESCE(SUM(amount), 0) FROM online_payments WHERE member_id = ? AND status = 'pending'");
    $reservedStmt->execute([$member['id']]);
    $reservedCents = (int) round((float) $reservedStmt->fetchColumn() * 100);
    return max(0, (int) round((float) $member['fee'] * 100) - $paidCents - $reservedCents);
}

function memberPaymentDetails($db)
{
    $token = $_GET['token'] ?? '';
    $member = memberByPaymentToken($db, $token);
    if (!$member) {
        respond(404, ['success' => false, 'error' => 'This payment link is invalid or has been replaced. Ask the treasurer for a current link.']);
    }
    respond(200, ['success' => true, 'data' => [
        'name' => $member['name'],
        'balance' => number_format(memberOutstandingCents($db, $member) / 100, 2, '.', ''),
    ]]);
}

function createMemberPaymentLink($db)
{
    $appUrl = getenv('PAYMONGO_APP_URL');
    if (!validAppUrl($appUrl)) {
        respond(503, ['success' => false, 'error' => 'Configure PAYMONGO_APP_URL as the full HTTPS URL of index.html (HTTP localhost is allowed for local testing).']);
    }
    $input = getJsonInput();
    $memberId = $input['memberId'] ?? '';
    if (!is_string($memberId) || $memberId === '') {
        respond(400, ['success' => false, 'error' => 'Choose a member before creating a payment link.']);
    }
    $stmt = $db->prepare('SELECT id FROM members WHERE id = ?');
    $stmt->execute([$memberId]);
    if (!$stmt->fetch()) {
        respond(404, ['success' => false, 'error' => 'Member not found in the connected database.']);
    }
    $token = bin2hex(random_bytes(32));
    $stmt = $db->prepare('INSERT INTO member_payment_links (member_id, token_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE token_hash = VALUES(token_hash)');
    $stmt->execute([$memberId, hash('sha256', $token)]);
    respond(200, ['success' => true, 'data' => [
        'url' => appPageUrl($appUrl, 'payment.html', ['token' => $token]),
    ]]);
}

function paymentNotifications($db)
{
    $stmt = $db->query("SELECT n.id, n.reference, n.member_name, n.amount, n.method, n.created_at, n.is_read, c.id AS collection_id, c.member_id, c.date AS collection_date, c.notes AS collection_notes FROM payment_notifications n LEFT JOIN collections c ON c.id = CONCAT('col-', n.online_payment_id) WHERE n.is_read = 0 ORDER BY n.created_at DESC LIMIT 50");
    respond(200, ['success' => true, 'data' => $stmt->fetchAll()]);
}

function markPaymentNotificationRead($db)
{
    $input = getJsonInput();
    $id = $input['id'] ?? '';
    if (!is_string($id) || !preg_match('/^[a-f0-9]{32}$/', $id)) {
        respond(400, ['success' => false, 'error' => 'Invalid notification reference.']);
    }
    $stmt = $db->prepare('UPDATE payment_notifications SET is_read = 1 WHERE id = ?');
    $stmt->execute([$id]);
    respond(200, ['success' => true]);
}

function createCheckout($db)
{
    $secretKey = getenv('PAYMONGO_SECRET_KEY');
    $appUrl = getenv('PAYMONGO_APP_URL');
    if (!$secretKey || strpos($secretKey, 'sk_test_') !== 0) {
        respond(503, ['success' => false, 'error' => 'Configure a PayMongo test secret key on the server first.']);
    }
    if (!validAppUrl($appUrl)) {
        respond(503, ['success' => false, 'error' => 'Configure PAYMONGO_APP_URL as the full HTTPS URL of index.html (HTTP localhost is allowed for local testing).']);
    }

    $input = getJsonInput();
    $memberId = $input['memberId'] ?? '';
    $token = $input['token'] ?? '';
    $paymentMethod = $input['paymentMethod'] ?? '';
    $allowedMethods = ['gcash', 'paymaya', 'card', 'qrph'];
    if ($token !== '' && (!is_string($token) || !preg_match('/^[a-f0-9]{64}$/', $token))) {
        respond(400, ['success' => false, 'error' => 'This payment link is invalid. Ask the treasurer for a current link.']);
    }
    if ($paymentMethod !== '' && (!is_string($paymentMethod) || !in_array($paymentMethod, $allowedMethods, true))) {
        respond(400, ['success' => false, 'error' => 'Choose a supported online payment method.']);
    }
    $amount = filter_var($input['amount'] ?? null, FILTER_VALIDATE_FLOAT);
    if (($token === '' && (!is_string($memberId) || $memberId === '')) || $amount === false || !is_finite((float) $amount) || $amount <= 0) {
        respond(400, ['success' => false, 'error' => 'Choose a valid member payment amount.']);
    }
    $amountCents = (int) round($amount * 100);
    if (abs(($amount * 100) - $amountCents) > 0.001) {
        respond(400, ['success' => false, 'error' => 'Payment amount must have no more than two decimal places.']);
    }

    $db->beginTransaction();
    try {
        if ($token !== '') {
            $member = memberByPaymentToken($db, $token, true);
        } else {
            $memberStmt = $db->prepare('SELECT id, name, fee FROM members WHERE id = ? FOR UPDATE');
            $memberStmt->execute([$memberId]);
            $member = $memberStmt->fetch();
        }
        if (!$member) {
            $db->rollBack();
            respond(404, ['success' => false, 'error' => 'Member not found in the connected database.']);
        }

        $memberId = $member['id'];
        $paidStmt = $db->prepare('SELECT COALESCE(SUM(amount), 0) FROM collections WHERE member_id = ?');
        $paidStmt->execute([$memberId]);
        $paidCents = (int) round((float) $paidStmt->fetchColumn() * 100);
        $pendingStmt = $db->prepare("SELECT id, amount, checkout_url FROM online_payments WHERE member_id = ? AND status = 'pending' ORDER BY created_at DESC FOR UPDATE");
        $pendingStmt->execute([$memberId]);
        $pendingPayments = $pendingStmt->fetchAll();
        foreach ($pendingPayments as $pending) {
            if ((int) round((float) $pending['amount'] * 100) === $amountCents) {
                $db->commit();
                if (!$pending['checkout_url']) {
                    respond(409, ['success' => false, 'error' => 'The checkout is still being prepared. Please try again shortly.']);
                }
                respond(200, ['success' => true, 'data' => ['checkoutUrl' => createCheckoutUrl($pending['checkout_url'])]]);
            }
        }
        $reservedStmt = $db->prepare("SELECT COALESCE(SUM(amount), 0) FROM online_payments WHERE member_id = ? AND status = 'pending'");
        $reservedStmt->execute([$memberId]);
        $reservedCents = (int) round((float) $reservedStmt->fetchColumn() * 100);
        $balanceCents = max(0, (int) round((float) $member['fee'] * 100) - $paidCents - $reservedCents);
        if ($amountCents > $balanceCents) {
            $db->rollBack();
            respond(400, ['success' => false, 'error' => 'This amount exceeds the available membership balance after pending checkouts.']);
        }

        $id = bin2hex(random_bytes(16));
        $reference = 'OR-' . date('Y') . '-' . strtoupper($id);
        $insert = $db->prepare("INSERT INTO online_payments (id, reference, member_id, member_name, amount) VALUES (?, ?, ?, ?, ?)");
        $insert->execute([$id, $reference, $memberId, $member['name'], number_format($amountCents / 100, 2, '.', '')]);
        $db->commit();
    } catch (Throwable $error) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        throw $error;
    }

    if ($token !== '') {
        $successUrl = appPageUrl($appUrl, 'payment.html', ['token' => $token, 'payment' => $id, 'return' => 'success']);
        $cancelUrl = appPageUrl($appUrl, 'payment.html', ['token' => $token, 'payment' => $id, 'return' => 'cancelled']);
    } else {
        $baseUrl = rtrim($appUrl, '/');
        $separator = strpos($baseUrl, '?') === false ? '?' : '&';
        $successUrl = $baseUrl . $separator . 'payment=' . rawurlencode($id) . '&return=success';
        $cancelUrl = $baseUrl . $separator . 'payment=' . rawurlencode($id) . '&return=cancelled';
    }
    $selectedMethods = $paymentMethod === '' ? $allowedMethods : [$paymentMethod];
    $body = json_encode([
        'data' => [
            'attributes' => [
                'line_items' => [[
                    'name' => 'Membership fee - ' . $member['name'],
                    'amount' => $amountCents,
                    'currency' => 'PHP',
                    'quantity' => 1,
                ]],
                'payment_method_types' => $selectedMethods,
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'reference_number' => $id,
            ],
        ],
    ]);

    $context = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\nAuthorization: Basic " . base64_encode($secretKey . ':') . "\r\n",
        'content' => $body,
        'timeout' => 20,
        'ignore_errors' => true,
    ]]);
    $response = @file_get_contents('https://api.paymongo.com/v2/checkout_sessions', false, $context);
    $requestError = $response === false ? (error_get_last()['message'] ?? 'HTTP request failed') : '';
    $responseHeaders = $http_response_header ?? [];
    $httpStatus = 0;
    if ($responseHeaders && preg_match('/\s(\d{3})\s/', $responseHeaders[0], $matches)) {
        $httpStatus = (int) $matches[1];
    }
    $payload = is_string($response) ? json_decode($response, true) : null;
    $sessionId = $payload['data']['id'] ?? '';
    $checkoutUrl = $payload['data']['attributes']['checkout_url'] ?? '';
    if ($requestError || $httpStatus < 200 || $httpStatus >= 300 || !$sessionId || !$checkoutUrl) {
        error_log('PayMongo checkout creation failed: ' . ($requestError ?: 'HTTP ' . $httpStatus));
        $failed = $db->prepare("UPDATE online_payments SET status = 'failed' WHERE id = ? AND status = 'pending'");
        $failed->execute([$id]);
        respond(502, ['success' => false, 'error' => 'Could not create a PayMongo checkout. Check the server log and test account configuration.']);
    }

    try {
        $checkoutUrl = createCheckoutUrl($checkoutUrl);
        $update = $db->prepare('UPDATE online_payments SET checkout_session_id = ?, checkout_url = ? WHERE id = ?');
        $update->execute([$sessionId, $checkoutUrl, $id]);
    } catch (Throwable $error) {
        $failed = $db->prepare("UPDATE online_payments SET status = 'failed' WHERE id = ? AND status = 'pending'");
        $failed->execute([$id]);
        error_log('Could not save PayMongo checkout session: ' . $error->getMessage());
        respond(502, ['success' => false, 'error' => 'The checkout was created but could not be saved. Contact the administrator before retrying.']);
    }

    respond(200, ['success' => true, 'data' => ['checkoutUrl' => $checkoutUrl]]);
}

function paymentStatus($db)
{
    $id = $_GET['id'] ?? '';
    if (!is_string($id) || !preg_match('/^[a-f0-9]{32}$/', $id)) {
        respond(400, ['success' => false, 'error' => 'Invalid payment reference.']);
    }
    $stmt = $db->prepare('SELECT id, reference, member_id, amount, status FROM online_payments WHERE id = ?');
    $stmt->execute([$id]);
    $payment = $stmt->fetch();
    if (!$payment) {
        respond(404, ['success' => false, 'error' => 'Payment was not found.']);
    }
    if (isset($_GET['token'])) {
        $member = memberByPaymentToken($db, $_GET['token']);
        if (!$member || $member['id'] !== $payment['member_id']) {
            respond(404, ['success' => false, 'error' => 'Payment was not found for this payment link.']);
        }
    }
    $collection = null;
    if ($payment['status'] === 'paid') {
        $collectionStmt = $db->prepare('SELECT id, reference, member_id, member_name, date, amount, method, notes FROM collections WHERE id = ?');
        $collectionStmt->execute(['col-' . $id]);
        $collection = $collectionStmt->fetch() ?: null;
    }
    respond(200, ['success' => true, 'data' => [
        'status' => $payment['status'],
        'reference' => $payment['reference'],
        'collection' => $collection,
    ]]);
}

function processWebhook($db)
{
    $secret = getenv('PAYMONGO_WEBHOOK_SECRET');
    $header = $_SERVER['HTTP_PAYMONGO_SIGNATURE'] ?? '';
    if (!$secret || !$header) {
        respond(401, ['success' => false, 'error' => 'Webhook signature is not configured.']);
    }
    $parts = [];
    foreach (explode(',', $header) as $part) {
        $pair = explode('=', trim($part), 2);
        if (count($pair) === 2) {
            $parts[$pair[0]] = $pair[1];
        }
    }
    $timestamp = $parts['t'] ?? '';
    $signature = $parts['te'] ?? '';
    $rawBody = file_get_contents('php://input');
    if (!ctype_digit($timestamp) || abs(time() - (int) $timestamp) > 300 ||
        !$signature || !hash_equals(hash_hmac('sha256', $timestamp . '.' . $rawBody, $secret), $signature)) {
        respond(401, ['success' => false, 'error' => 'Webhook signature is invalid or expired.']);
    }
    $event = json_decode($rawBody, true);
    if (!is_array($event) || ($event['data']['type'] ?? '') !== 'checkout_session.payment.paid' ||
        ($event['data']['livemode'] ?? true) !== false) {
        respond(200, ['success' => true]);
    }

    $session = $event['data']['data'] ?? [];
    $attributes = $session['attributes'] ?? [];
    $id = $attributes['reference_number'] ?? '';
    $sessionId = $session['id'] ?? '';
    $paid = null;
    foreach (($attributes['payments'] ?? []) as $candidate) {
        if (($candidate['attributes']['status'] ?? '') === 'paid') {
            $paid = $candidate['attributes'];
            break;
        }
    }
    if (!is_string($id) || !preg_match('/^[a-f0-9]{32}$/', $id) || !$sessionId ||
        !$paid || ($paid['currency'] ?? '') !== 'PHP') {
        respond(400, ['success' => false, 'error' => 'Paid checkout payload is incomplete.']);
    }

    $db->beginTransaction();
    try {
        $stmt = $db->prepare('SELECT * FROM online_payments WHERE id = ? AND checkout_session_id = ? FOR UPDATE');
        $stmt->execute([$id, $sessionId]);
        $payment = $stmt->fetch();
        if (!$payment) {
            $db->rollBack();
            respond(404, ['success' => false, 'error' => 'Checkout session was not found.']);
        }
        if ($payment['status'] === 'paid') {
            $db->commit();
            respond(200, ['success' => true]);
        }
        if ((int) ($paid['amount'] ?? 0) !== (int) round((float) $payment['amount'] * 100)) {
            $db->rollBack();
            respond(400, ['success' => false, 'error' => 'Paid amount does not match the checkout.']);
        }

        $collectionId = 'col-' . $id;
        $collection = $db->prepare('INSERT INTO collections (id, reference, member_id, member_name, date, amount, method, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $collection->execute([
            $collectionId,
            $payment['reference'],
            $payment['member_id'],
            $payment['member_name'],
            date('Y-m-d'),
            $payment['amount'],
            'PayMongo (test)',
            'Confirmed by PayMongo hosted checkout',
        ]);
        $update = $db->prepare("UPDATE online_payments SET status = 'paid', paid_at = CURRENT_TIMESTAMP WHERE id = ?");
        $update->execute([$id]);
        $notification = $db->prepare('INSERT INTO payment_notifications (id, online_payment_id, reference, member_name, amount, method) VALUES (?, ?, ?, ?, ?, ?)');
        $notification->execute([
            $id,
            $id,
            $payment['reference'],
            $payment['member_name'],
            $payment['amount'],
            'PayMongo (test)',
        ]);
        $db->commit();
    } catch (Throwable $error) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        throw $error;
    }
    respond(200, ['success' => true]);
}

try {
    $db = Database::getInstance()->getConnection();
    if (($_GET['action'] ?? '') === 'webhook' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        processWebhook($db);
    }
    if (($_GET['action'] ?? '') === 'member' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        memberPaymentDetails($db);
    }
    if (($_GET['action'] ?? '') === 'link' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        createMemberPaymentLink($db);
    }
    if (($_GET['action'] ?? '') === 'notifications' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        paymentNotifications($db);
    }
    if (($_GET['action'] ?? '') === 'notification-read' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        markPaymentNotificationRead($db);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        paymentStatus($db);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        createCheckout($db);
    }
    respond(405, ['success' => false, 'error' => 'Method not allowed.']);
} catch (Throwable $error) {
    error_log('PayMongo API error: ' . $error->getMessage());
    respond(500, ['success' => false, 'error' => 'The payment service is temporarily unavailable.']);
}
