-- ============================================================================
-- Expense Voucher Management System - Database Schema
-- Compatible with PostgreSQL, MySQL, and SQLite
-- ============================================================================

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('employee', 'director', 'accounts')),
    department VARCHAR(100),
    employee_id VARCHAR(50),
    default_signature TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: vouchers
CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_number VARCHAR(50) UNIQUE NOT NULL,
    voucher_date DATE NOT NULL,
    expense_date DATE NOT NULL,
    department VARCHAR(100) NOT NULL,
    expense_title VARCHAR(255) NOT NULL,
    expense_category VARCHAR(100) NOT NULL,
    expense_description TEXT,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Pending Approval', 'Approved', 'Rejected')),
    
    -- Employee Information
    created_by_user_id INTEGER NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50),
    employee_signature TEXT,
    employee_signature_date TIMESTAMP,
    
    -- Approval Information
    approved_by_user_id INTEGER,
    director_name VARCHAR(255),
    director_signature TEXT,
    approval_date TIMESTAMP,
    rejection_reason TEXT,
    
    -- Audit Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by_user_id) REFERENCES users(id),
    FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
);

-- Indexes for high-performance searching and filtering
CREATE INDEX IF NOT EXISTS idx_vouchers_user ON vouchers(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_department ON vouchers(department);
CREATE INDEX IF NOT EXISTS idx_vouchers_category ON vouchers(expense_category);
CREATE INDEX IF NOT EXISTS idx_vouchers_expense_date ON vouchers(expense_date);
CREATE INDEX IF NOT EXISTS idx_vouchers_created_at ON vouchers(created_at);
