<?php
require_once '../config/database.php';

setCorsHeaders();

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$input = getJsonInput();

try {
    switch ($method) {
        case 'GET':
            $stmt = $db->query("SELECT * FROM expenses ORDER BY date DESC");
            $expenses = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $expenses]);
            break;
            
        case 'POST':
            $id = $input['id'] ?? uniqid('exp-');
            $stmt = $db->prepare("INSERT INTO expenses (id, description, category, date, amount, responsible, reference, advance_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['description'],
                $input['category'],
                $input['date'],
                $input['amount'],
                $input['responsible'],
                $input['reference'] ?? null,
                $input['advanceId'] ?: null,
                $input['notes'] ?? null
            ]);
            echo json_encode(['success' => true, 'id' => $id]);
            break;
            
        case 'PUT':
            $id = $input['id'];
            $stmt = $db->prepare("UPDATE expenses SET description=?, category=?, date=?, amount=?, responsible=?, reference=?, advance_id=?, notes=? WHERE id=?");
            $stmt->execute([
                $input['description'],
                $input['category'],
                $input['date'],
                $input['amount'],
                $input['responsible'],
                $input['reference'] ?? null,
                $input['advanceId'] ?: null,
                $input['notes'] ?? null,
                $id
            ]);
            echo json_encode(['success' => true]);
            break;
            
        case 'DELETE':
            $id = $input['id'];
            $stmt = $db->prepare("DELETE FROM expenses WHERE id=?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
