<?php
require_once '../config/database.php';

setCorsHeaders();

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$input = getJsonInput();

try {
    switch ($method) {
        case 'GET':
            $stmt = $db->query("SELECT * FROM members ORDER BY name");
            $members = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $members]);
            break;
            
        case 'POST':
            $id = $input['id'] ?? uniqid('mem-');
            $memberId = $input['memberId'] ?? 'ORG-' . date('y') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
            
            $stmt = $db->prepare("INSERT INTO members (id, member_id, name, course, year, email, phone, fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $memberId,
                $input['name'],
                $input['course'],
                $input['year'],
                $input['email'] ?? null,
                $input['phone'] ?? null,
                $input['fee'] ?? 0
            ]);
            echo json_encode(['success' => true, 'id' => $id, 'memberId' => $memberId]);
            break;
            
        case 'PUT':
            $id = $input['id'];
            $stmt = $db->prepare("UPDATE members SET name=?, course=?, year=?, email=?, phone=?, fee=? WHERE id=?");
            $stmt->execute([
                $input['name'],
                $input['course'],
                $input['year'],
                $input['email'] ?? null,
                $input['phone'] ?? null,
                $input['fee'] ?? 0,
                $id
            ]);
            echo json_encode(['success' => true]);
            break;
            
        case 'DELETE':
            $id = $input['id'];
            $stmt = $db->prepare("DELETE FROM members WHERE id=?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
