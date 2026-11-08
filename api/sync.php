<?php
require_once __DIR__ . '/../config/database.php';

setCorsHeaders();

$db = Database::getInstance()->getConnection();

try {
    // Load all data
    $data = [];
    
    $tables = ['accounts', 'members', 'collections', 'advances', 'cash_returns', 'expenses', 'transactions', 'users', 'settings', 'audit_trail'];
    foreach ($tables as $table) {
        $stmt = $db->query("SELECT * FROM $table");
        $data[$table] = $stmt->fetchAll();
    }
    
    echo json_encode(['success' => true, 'data' => $data]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
