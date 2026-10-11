-- ============================================================================
-- Expense Voucher Management System - PostgreSQL Database Schema & Seed Data
-- ============================================================================
-- Client: Prachay Securities Private Limited (ABC Company)
-- DBMS: PostgreSQL 14+
-- Execution: psql -U postgres -d expense_voucher_db -f database/schema_postgres.sql
-- ============================================================================

-- Create database if not exists (execute separately if needed):
-- CREATE DATABASE expense_voucher_db;

-- 1. Table: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('employee', 'director', 'accounts')),
    department VARCHAR(100),
    employee_id VARCHAR(50),
    default_signature TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: vouchers
CREATE TABLE IF NOT EXISTS vouchers (
    id SERIAL PRIMARY KEY,
    voucher_number VARCHAR(50) UNIQUE NOT NULL,
    voucher_date DATE NOT NULL,
    expense_date DATE NOT NULL,
    department VARCHAR(100) NOT NULL,
    expense_title VARCHAR(255) NOT NULL,
    expense_category VARCHAR(100) NOT NULL,
    expense_description TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Pending Approval', 'Approved', 'Rejected')),
    
    -- Employee Information
    created_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    employee_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50),
    employee_signature TEXT,
    employee_signature_date TIMESTAMPTZ,
    
    -- Approval Information
    approved_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    director_name VARCHAR(255),
    director_signature TEXT,
    approval_date TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Audit Timestamps
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_pg_vouchers_user ON vouchers(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_pg_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_pg_vouchers_department ON vouchers(department);
CREATE INDEX IF NOT EXISTS idx_pg_vouchers_category ON vouchers(expense_category);
CREATE INDEX IF NOT EXISTS idx_pg_vouchers_expense_date ON vouchers(expense_date);
CREATE INDEX IF NOT EXISTS idx_pg_vouchers_created_at ON vouchers(created_at);

-- 4. Initial Seed Data (Realistic Test Personas with bcrypt password "password123")
-- Password hash for 'password123' generated with bcrypt 10 rounds:
-- $2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa
INSERT INTO users (email, password_hash, name, role, department, employee_id, default_signature)
VALUES 
    ('employee@prachay.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Alex Turner', 'employee', 'Engineering', 'EMP-0412', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="90"><text x="30" y="78" font-family="Brush Script MT" font-size="22" fill="#1e3a8a">Alex Turner</text></svg>'),
    ('priya.patel@prachay.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Priya Patel', 'employee', 'Marketing', 'EMP-0883', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="90"><text x="30" y="78" font-family="Brush Script MT" font-size="22" fill="#1e3a8a">Priya Patel</text></svg>'),
    ('director@prachay.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Sarah Jenkins', 'director', 'Executive Management', 'DIR-0001', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="90"><text x="30" y="78" font-family="Brush Script MT" font-size="22" fill="#1e3a8a">Sarah Jenkins</text></svg>'),
    ('accounts@prachay.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Rohit Verma', 'accounts', 'Finance & Accounts', 'ACC-0024', NULL)
ON CONFLICT (email) DO NOTHING;

-- 5. Initial Seed Vouchers
INSERT INTO vouchers (
    voucher_number, voucher_date, expense_date, department, expense_title, expense_category,
    expense_description, amount, status, created_by_user_id, employee_name, employee_id,
    employee_signature, employee_signature_date, approved_by_user_id, director_name, director_signature, approval_date, created_at, updated_at
)
VALUES 
    (
        'EV-2026-0001', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '7 days', 'Engineering',
        'AWS Cloud Hosting & Server Migration Fees', 'Software & Subscriptions',
        'Monthly production cluster scale-out and database instance reservation for Q2 platform launch.',
        34500.00, 'Approved', 1, 'Alex Turner', 'EMP-0412',
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="90"><text x="30" y="78" font-family="Brush Script MT" font-size="22" fill="#1e3a8a">Alex Turner</text></svg>',
        CURRENT_TIMESTAMP - INTERVAL '5 days', 3, 'Sarah Jenkins',
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="90"><text x="30" y="78" font-family="Brush Script MT" font-size="22" fill="#1e3a8a">Sarah Jenkins</text></svg>',
        CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '4 days'
    ),
    (
        'EV-2026-0002', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '3 days', 'Engineering',
        'Ergonomic Mechanical Keyboards for DevOps Engineers', 'Office Supplies',
        'Replacement input equipment for high-throughput site reliability engineering workstations.',
        12499.00, 'Pending Approval', 1, 'Alex Turner', 'EMP-0412',
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="90"><text x="30" y="78" font-family="Brush Script MT" font-size="22" fill="#1e3a8a">Alex Turner</text></svg>',
        CURRENT_TIMESTAMP - INTERVAL '2 days', NULL, NULL, NULL, NULL,
        CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        'EV-2026-0003', CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day', 'Engineering',
        'Team Innovation Lunch & Hackathon Catering', 'Meals & Entertainment',
        'Catering arrangements for 14 engineers during the semi-annual FinTech Architecture sprint.',
        8750.00, 'Draft', 1, 'Alex Turner', 'EMP-0412',
        NULL, NULL, NULL, NULL, NULL, NULL,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
ON CONFLICT (voucher_number) DO NOTHING;
