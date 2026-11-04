-- Ledgerly Database Schema
-- MySQL/MariaDB schema for mini_acc

CREATE DATABASE IF NOT EXISTS ledgerly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ledgerly;

-- Accounts (Chart of Accounts)
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('Income', 'Expense', 'Asset', 'Liability', 'Equity') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Members
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(50) PRIMARY KEY,
    member_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    course VARCHAR(60) NOT NULL,
    year VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(24),
    fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Collections (Fee payments)
CREATE TABLE IF NOT EXISTS collections (
    id VARCHAR(50) PRIMARY KEY,
    reference VARCHAR(50) UNIQUE NOT NULL,
    member_id VARCHAR(50) NOT NULL,
    member_name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(30) NOT NULL,
    notes VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Advances (Cash advances)
CREATE TABLE IF NOT EXISTS advances (
    id VARCHAR(50) PRIMARY KEY,
    reference VARCHAR(50) UNIQUE NOT NULL,
    activity VARCHAR(100) NOT NULL,
    responsible VARCHAR(80) NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cash returns
CREATE TABLE IF NOT EXISTS cash_returns (
    id VARCHAR(50) PRIMARY KEY,
    advance_id VARCHAR(50) NOT NULL,
    reference VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (advance_id) REFERENCES advances(id) ON DELETE CASCADE
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(50) PRIMARY KEY,
    description VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    responsible VARCHAR(80) NOT NULL,
    reference VARCHAR(60),
    advance_id VARCHAR(50),
    notes VARCHAR(160),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (advance_id) REFERENCES advances(id) ON DELETE SET NULL
);

-- Transactions (manual income/expense entries)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    type ENUM('income', 'expense') NOT NULL,
    description VARCHAR(80) NOT NULL,
    category VARCHAR(50) NOT NULL,
    account VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    is_current TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    organization_name VARCHAR(80) NOT NULL,
    default_fee DECIMAL(10,2) NOT NULL DEFAULT 1000,
    receipt_prefix VARCHAR(8) NOT NULL DEFAULT 'OR',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Audit trail
CREATE TABLE IF NOT EXISTS audit_trail (
    id VARCHAR(50) PRIMARY KEY,
    reference VARCHAR(50),
    source_reference VARCHAR(50),
    activity VARCHAR(50) NOT NULL,
    entity_type VARCHAR(30) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) DEFAULT 0,
    date DATE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default accounts
INSERT IGNORE INTO accounts (id, code, name, type, description) VALUES
('acct-income-dues', '4001', 'Membership dues', 'Income', 'Regular member contributions'),
('acct-income-donation', '4002', 'Donations', 'Income', 'Donations and sponsorships'),
('acct-income-event', '4003', 'Event income', 'Income', 'Income from organization events'),
('acct-expense-supplies', '5001', 'Office supplies', 'Expense', 'Stationery and office materials'),
('acct-expense-travel', '5002', 'Travel & transportation', 'Expense', 'Local travel and transportation'),
('acct-expense-event', '5003', 'Event expenses', 'Expense', 'Costs for organization events'),
('acct-expense-utilities', '5004', 'Utilities', 'Expense', 'Internet, electricity, and utilities'),
('acct-asset-cash', '1001', 'Cash on hand', 'Asset', 'Organization cash fund'),
('acct-asset-bank', '1002', 'Bank account', 'Asset', 'Organization checking account'),
('acct-equity-fund', '3001', 'Organization fund', 'Equity', 'Accumulated organization funds');

-- Insert default settings
INSERT IGNORE INTO settings (id, organization_name, default_fee, receipt_prefix) VALUES (1, 'School Organization', 1000, 'OR');

-- Insert default users
INSERT IGNORE INTO users (id, name, email, role, status, is_current) VALUES
('user-admin', 'Organization Admin', 'admin@schoolorg.demo', 'Administrator', 'Active', 1),
('user-finance', 'Finance Officer', 'finance@schoolorg.demo', 'Finance officer', 'Active', 0);
