<?php
require_once '../config/database.php';

setCorsHeaders();

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$input = getJsonInput();

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['table'])) {
                $table = $_GET['table'];
                if (in_array($table, ['accounts', 'advances', 'cash_returns', 'transactions', 'users', 'settings', 'audit_trail'])) {
                    $stmt = $db->query("SELECT * FROM $table");
                    $data = $stmt->fetchAll();
                    echo json_encode(['success' => true, 'data' => $data]);
                    exit;
                }
            }
            echo json_encode(['success' => true, 'data' => []]);
            break;
            
        case 'POST':
            if ($input['table'] === 'advances') {
                $id = $input['id'] ?? uniqid('adv-');
                $ref = $input['reference'] ?? 'CA-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
                $stmt = $db->prepare("INSERT INTO advances (id, reference, activity, responsible, date, amount) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$id, $ref, $input['activity'], $input['responsible'], $input['date'], $input['amount']]);
                echo json_encode(['success' => true, 'id' => $id, 'reference' => $ref]);
                exit;
            }
            if ($input['table'] === 'cash_returns') {
                $id = $input['id'] ?? uniqid('return-');
                $ref = $input['reference'] ?? 'CR-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
                $stmt = $db->prepare("INSERT INTO cash_returns (id, advance_id, reference, amount, date) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$id, $input['advanceId'], $ref, $input['amount'], $input['date']]);
                echo json_encode(['success' => true, 'id' => $id, 'reference' => $ref]);
                exit;
            }
            if ($input['table'] === 'transactions') {
                $id = $input['id'] ?? uniqid('tx-');
                $stmt = $db->prepare("INSERT INTO transactions (id, type, description, category, account, amount, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$id, $input['type'], $input['description'], $input['category'], $input['account'], $input['amount'], $input['date'], $input['notes'] ?? null]);
                echo json_encode(['success' => true, 'id' => $id]);
                exit;
            }
            if ($input['table'] === 'users') {
                $id = $input['id'] ?? uniqid('user-');
                $stmt = $db->prepare("INSERT INTO users (id, name, email, role, status) VALUES (?, ?, ?, ?, 'Active')");
                $stmt->execute([$id, $input['name'], $input['email'], $input['role']]);
                echo json_encode(['success' => true, 'id' => $id]);
                exit;
            }
            if ($input['table'] === 'accounts') {
                $id = $input['id'] ?? uniqid('acct-');
                $code = $input['code'] ?? rand(6000, 6999);
                $stmt = $db->prepare("INSERT INTO accounts (id, code, name, type, description) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$id, $code, $input['name'], $input['type'], $input['description'] ?? null]);
                echo json_encode(['success' => true, 'id' => $id, 'code' => $code]);
                exit;
            }
            if ($input['table'] === 'settings') {
                $stmt = $db->prepare("UPDATE settings SET organization_name=?, default_fee=?, receipt_prefix=? WHERE id=1");
                $stmt->execute([$input['organizationName'], $input['defaultFee'], $input['receiptPrefix']]);
                echo json_encode(['success' => true]);
                exit;
            }
            break;
            
        case 'PUT':
            if ($input['table'] === 'transactions') {
                $id = $input['id'];
                $stmt = $db->prepare("UPDATE transactions SET type=?, description=?, category=?, account=?, amount=?, date=?, notes=? WHERE id=?");
                $stmt->execute([$input['type'], $input['description'], $input['category'], $input['account'], $input['amount'], $input['date'], $input['notes'] ?? null, $id]);
                echo json_encode(['success' => true]);
                exit;
            }
            if ($input['table'] === 'users') {
                $id = $input['id'];
                $stmt = $db->prepare("UPDATE users SET name=?, email=?, role=? WHERE id=?");
                $stmt->execute([$input['name'], $input['email'], $input['role'], $id]);
                echo json_encode(['success' => true]);
                exit;
            }
            if ($input['table'] === 'accounts') {
                $id = $input['id'];
                $stmt = $db->prepare("UPDATE accounts SET name=?, type=?, description=? WHERE id=?");
                $stmt->execute([$input['name'], $input['type'], $input['description'] ?? null, $id]);
                echo json_encode(['success' => true]);
                exit;
            }
            break;
            
        case 'DELETE':
            if ($input['table'] === 'advances') {
                $id = $input['id'];
                $stmt = $db->prepare("DELETE FROM advances WHERE id=?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true]);
                exit;
            }
            if ($input['table'] === 'transactions') {
                $id = $input['id'];
                $stmt = $db->prepare("DELETE FROM transactions WHERE id=?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true]);
                exit;
            }
            if ($input['table'] === 'users') {
                $id = $input['id'];
                $stmt = $db->prepare("DELETE FROM users WHERE id=?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true]);
                exit;
            }
            if ($input['table'] === 'accounts') {
                $id = $input['id'];
                $stmt = $db->prepare("DELETE FROM accounts WHERE id=?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true]);
                exit;
            }
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
