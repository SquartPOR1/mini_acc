<?php
require_once '../config/database.php';

setCorsHeaders();

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$input = getJsonInput();

try {
    switch ($method) {
        case 'GET':
            $stmt = $db->query("SELECT * FROM collections ORDER BY date DESC");
            $collections = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $collections]);
            break;
            
        case 'POST':
            $id = $input['id'] ?? uniqid('col-');
            $ref = $input['reference'] ?? 'OR-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            
            $stmt = $db->prepare("INSERT INTO collections (id, reference, member_id, member_name, date, amount, method, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $ref,
                $input['memberId'],
                $input['memberName'],
                $input['date'],
                $input['amount'],
                $input['method'],
                $input['notes'] ?? null
            ]);
            echo json_encode(['success' => true, 'id' => $id, 'reference' => $ref]);
            break;
            
        case 'DELETE':
            $id = $input['id'];
            $stmt = $db->prepare("DELETE FROM collections WHERE id=?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
