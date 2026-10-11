# Expense Voucher Management System (EVMS)

An enterprise web application developed for **Prachay Securities Private Limited** to automate, govern, and digitize the corporate expense reimbursement lifecycle—from employee claim submission and digital canvas signatures to executive Director approval and Accounts Department disbursement.

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19.0-blue.svg)](https://react.dev/)
[![Tests](https://img.shields.io/badge/tests-105%20passed-brightgreen.svg)](TEST_EXECUTION_REPORT.md)

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Technology Stack](#3-technology-stack)
4. [Getting Started & Setup](#4-getting-started--setup)
5. [Database Schema](#5-database-schema)
6. [API Reference](#6-api-reference)
7. [Business Rules & Assumptions](#7-business-rules--assumptions)
8. [Testing & Quality Assurance](#8-testing--quality-assurance)

---

## 1. Project Overview

### Purpose
The **Expense Voucher Management System (EVMS)** digitizes the internal reimbursement process for Prachay Securities Private Limited. It eliminates manual paper vouchers, physical signature collection, and untracked receipts by providing an auditable, role-governed digital pipeline.

### Problem Statement
In traditional manual workflows:
- **Zero Real-Time Visibility**: Employees cannot track the approval status of submitted claims.
- **Lost Paperwork & Compliance Risks**: Paper vouchers and receipts get lost or lack verifiable audit timestamps.
- **Approval Bottlenecks**: Approvers lack summarized expense analytics, and rejection feedback is rarely documented.
- **Insecure Role Boundaries**: Physical vouchers lack automated controls to prevent tampering after submission.

The EVMS resolves these challenges with server-enforced role separation, sequential auto-numbering, dual digital signatures, and instant audit trails.

---

## 2. Key Features

- **Role-Based Access Control (RBAC)**:
  - **Employee**: Create, save drafts, edit/delete personal drafts, digitally sign, submit claims, and view personal vouchers with tenant isolation.
  - **Director**: Organization-wide visibility, pending approval queue, approve with digital signature, reject with mandatory written remarks.
  - **Accounts**: Organization-wide read-only financial audit, view dual signatures, export CSV ledgers, and print official A4 voucher slips.
- **Dual-Mode Digital Signatures**:
  - Interactive HTML5 Canvas signature pad (mouse, touch, stylus pen) with stroke smoothing.
  - Image upload support (`PNG`, `JPEG`, `WEBP`, `SVG` up to 5MB).
  - Profile-level default signature saving for 1-click signing.
- **Sequential Voucher Numbering Engine**:
  - Auto-generated, collision-free numbers formatted as `EV-YYYY-XXXX` (e.g., `EV-2026-0001`).
- **Strict Voucher Lifecycle State Machine**:
  - `Draft`: Editable and deletable by the claimant only.
  - `Pending Approval`: Locked and immutable for employees once submitted with signature.
  - `Approved`: Authorized by Director with digital signature; forwarded to Accounts.
  - `Rejected`: Declined by Director with mandatory written feedback visible to the claimant.
- **7-Dimension Search & Filter**:
  - Search by voucher number, claimant name, title, or description.
  - Filters by department, category, status, date range, and amount range.
- **Corporate A4 Print Engine & CSV Export**:
  - Dedicated `@media print` A4 voucher slip with letterhead, amount in words, dual signature boxes, and Accounts clearance stamp.
  - 1-click CSV export of approved voucher ledgers.

---

## 3. Technology Stack

| Layer | Technologies | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 5, React Router v7, Lucide React | Single-page application with responsive routing and low-latency canvas rendering. |
| **Styling** | Vanilla CSS, Design Tokens, Responsive Media Queries | Bespoke corporate slate & navy design system with print stylesheets. |
| **Backend** | Node.js (v20+), Express.js (v5), Multer | RESTful API service with multipart file handling and centralized error handling. |
| **Security** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, CORS | Stateless Bearer token authentication, 10-round salted password hashing, and role guards. |
| **Database** | SQLite3 (Active Local Default) / PostgreSQL 14+ (Enterprise Production) | Embedded SQLite for zero-config local evaluation; full PostgreSQL schema and migrations for production. |
| **Testing** | Node.js Native Test Assertions, HTTP Test Harness | 105 automated unit, integration, RBAC security, and functional tests. |

---

## 4. Getting Started & Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher (Recommended: `v20.x` LTS or `v22.x`)
- **npm**: `v9.0.0` or higher
- **Git**
- **PostgreSQL** *(Optional)*: Required only if running against external PostgreSQL instead of the default SQLite.

```bash
node -v
npm -v
```

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jayfinaviya/Expense-Voucher-Management-System.git
   cd "Expense Voucher Management System"
   ```

2. **Install root and backend dependencies**:
   ```bash
   npm install
   ```

3. **Install client frontend dependencies**:
   ```bash
   cd client
   npm install
   cd ..
   ```

### Environment Configuration

Create `.env` from the provided template:

```bash
# Linux / macOS / Git Bash
cp .env.example .env

# Windows (Command Prompt / PowerShell)
copy .env.example .env
```

The default `.env` configuration requires **zero changes** for local development:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

JWT_SECRET=replace_with_a_secure_random_secret
JWT_EXPIRES_IN=7d

DB_TYPE=sqlite
DB_PATH=./server/data/expense_vouchers.db

UPLOAD_DIR=./server/uploads
MAX_FILE_SIZE_MB=5
```

### Database Setup

#### Option A: SQLite (Default — Zero Setup)
The backend automatically creates `server/data/expense_vouchers.db`, initializes tables and indexes, and seeds test accounts and vouchers on first launch.

#### Option B: PostgreSQL (Optional Production Setup)
1. Create the database in PostgreSQL:
   ```sql
   CREATE DATABASE expense_voucher_db;
   ```
2. Initialize schema and seed data using the provided script:
   ```bash
   psql -U postgres -d expense_voucher_db -f database/schema_postgres.sql
   ```
3. Update `.env`:
   ```env
   DB_TYPE=postgres
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/expense_voucher_db
   ```

### Running the Application

Start backend and frontend concurrently:

```bash
npm run dev
```

Alternatively, run in separate terminals:
- **Backend API**: `npm run server` (runs on `http://localhost:5000`)
- **Frontend Client**: `npm run client` (runs on `http://localhost:3000`)

### Local Endpoints
- **Frontend Web App**: `http://localhost:3000`
- **Backend API Server**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

### Pre-Configured Test Accounts

| Role | Name | Email | Password | Department |
| :--- | :--- | :--- | :--- | :--- |
| **Employee** | Alex Turner | `employee@prachay.com` | `password123` | Engineering |
| **Employee 2** | Priya Patel | `priya.patel@prachay.com` | `password123` | Marketing |
| **Director** | Sarah Jenkins | `director@prachay.com` | `password123` | Executive Management |
| **Accounts** | Rohit Verma | `accounts@prachay.com` | `password123` | Finance & Accounts |

*(1-Click Demo Account buttons are available on the Login page for quick persona switching).*

### Troubleshooting

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| `EADDRINUSE: port 5000` | Port 5000 is occupied. | Terminate the process using port 5000 or change `PORT=5001` in `.env`. |
| `EADDRINUSE: port 3000` | Port 3000 is occupied. | Vite will offer port 3001 automatically. |
| `File too large` | Signature image exceeds 5MB. | Upload an image under 5MB (`PNG`, `JPG`, `WEBP`, `SVG`). |
| `Token is invalid` | JWT token expired. | Click **Logout** and log in again to generate a fresh token. |

---

## 5. Database Schema

### `users` Table
Stores user accounts, credentials, roles, and default digital signatures.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` / `SERIAL` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier. |
| `email` | `VARCHAR(255)` | `UNIQUE NOT NULL` | Login email address. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Bcrypt salted hash (10 rounds). |
| `name` | `VARCHAR(255)` | `NOT NULL` | Full user name. |
| `role` | `VARCHAR(50)` | `NOT NULL CHECK (role IN ('employee', 'director', 'accounts'))` | Access control role. |
| `department` | `VARCHAR(100)` | Nullable | User department. |
| `employee_id` | `VARCHAR(50)` | Nullable | Employee badge ID (e.g., `EMP-0412`). |
| `default_signature` | `TEXT` | Nullable | Saved base64 data URI or file path. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Account creation timestamp. |

### `vouchers` Table
Stores expense records, status, amounts, signatures, and approval audit trails.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` / `SERIAL` | `PRIMARY KEY AUTOINCREMENT` | Unique voucher ID. |
| `voucher_number` | `VARCHAR(50)` | `UNIQUE NOT NULL` | Sequential identifier (`EV-YYYY-XXXX`). |
| `voucher_date` | `DATE` | `NOT NULL` | System registration date. |
| `expense_date` | `DATE` | `NOT NULL` | Date expense occurred. |
| `department` | `VARCHAR(100)` | `NOT NULL` | Department charged. |
| `expense_title` | `VARCHAR(255)` | `NOT NULL` | Concise title of expenditure. |
| `expense_category` | `VARCHAR(100)` | `NOT NULL` | Expense category. |
| `expense_description`| `TEXT` | Nullable | Detailed narrative / justification. |
| `amount` | `DECIMAL(12,2)` | `NOT NULL CHECK (amount > 0)` | Amount in INR (`₹`). |
| `status` | `VARCHAR(50)` | `NOT NULL CHECK (status IN ('Draft', 'Pending Approval', 'Approved', 'Rejected'))` | Current lifecycle state. |
| `created_by_user_id`| `INTEGER` | `NOT NULL REFERENCES users(id)` | Foreign key linking claimant. |
| `employee_name` | `VARCHAR(255)` | `NOT NULL` | Claimant name snapshot. |
| `employee_id` | `VARCHAR(50)` | Nullable | Claimant employee ID snapshot. |
| `employee_signature`| `TEXT` | Nullable | Employee digital signature. |
| `employee_signature_date`| `TIMESTAMP` | Nullable | Submission timestamp. |
| `approved_by_user_id`| `INTEGER` | `REFERENCES users(id)` | Approving Director foreign key. |
| `director_name` | `VARCHAR(255)` | Nullable | Approving Director name. |
| `director_signature`| `TEXT` | Nullable | Director digital signature. |
| `approval_date` | `TIMESTAMP` | Nullable | Approval timestamp. |
| `rejection_reason` | `TEXT` | Nullable | Mandatory written rejection feedback. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp. |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Last updated timestamp. |

### Indexes
- `idx_vouchers_user`: `vouchers(created_by_user_id)`
- `idx_vouchers_status`: `vouchers(status)`
- `idx_vouchers_department`: `vouchers(department)`
- `idx_vouchers_category`: `vouchers(expense_category)`
- `idx_vouchers_expense_date`: `vouchers(expense_date)`
- `idx_vouchers_created_at`: `vouchers(created_at)`

---

## 6. API Reference

Base URL: `http://localhost:5000/api`  
Authentication: HTTP Header `Authorization: Bearer <token>` for protected endpoints.

### Authentication Endpoints

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user; returns JWT token and profile. |
| `GET` | `/api/auth/me` | Bearer | Returns currently authenticated user session. |
| `GET` | `/api/auth/demo-users` | Public | Returns pre-seeded test accounts for 1-click login. |
| `POST` | `/api/auth/signature` | Bearer | Saves or updates default profile signature. |

#### Login Request & Response
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "employee@prachay.com", "password": "password123" }
```
```json
{
  "success": true,
  "message": "Authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "employee@prachay.com",
    "name": "Alex Turner",
    "role": "employee",
    "department": "Engineering",
    "employee_id": "EMP-0412"
  }
}
```

### Signature File Upload Endpoint

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/upload/signature` | Bearer | Uploads signature image file (`multipart/form-data`, field: `signatureFile`, max 5MB). Returns static file URL. |

### Voucher Management Endpoints

| Method | Endpoint | Access / Roles | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/vouchers` | All Roles | Lists vouchers. Employees see personal vouchers; Director & Accounts see all company vouchers. Supports search, filters, pagination, and sorting. |
| `GET` | `/api/vouchers/:id` | All Roles | Retrieves voucher details by ID. Enforces ownership for employees. |
| `POST` | `/api/vouchers` | `employee` | Creates a new voucher (saved as `Draft` or submitted if signed). |
| `PUT` | `/api/vouchers/:id` | `employee` | Updates an existing voucher (`Draft` status only, owner only). |
| `DELETE` | `/api/vouchers/:id` | `employee` | Deletes an existing voucher (`Draft` status only, owner only). |
| `POST` | `/api/vouchers/:id/submit` | `employee` | Submits draft voucher with signature; transitions to `Pending Approval`. |
| `POST` | `/api/vouchers/:id/approve` | `director` | Approves voucher with Director signature; transitions to `Approved`. |
| `POST` | `/api/vouchers/:id/reject` | `director` | Rejects voucher with mandatory remarks; transitions to `Rejected`. |

#### Query Parameters for `GET /api/vouchers`:
- `search`: Universal text search (number, employee, title, description).
- `voucherNumber`, `employeeName`, `department`, `category`, `status`.
- `startDate`, `endDate`: Date range filter.
- `minAmount`, `maxAmount`: Amount range filter.
- `sortBy` (default: `created_at`), `sortOrder` (`ASC` or `DESC`).
- `page` (default: 1), `limit` (default: 25).

#### Create Voucher Payload
```json
{
  "expense_date": "2026-10-10",
  "department": "Engineering",
  "expense_title": "Docker Hub Subscription",
  "expense_category": "Software & Subscriptions",
  "expense_description": "Annual dev container license",
  "amount": 25000.00,
  "signature": "data:image/png;base64,...",
  "action": "submit"
}
```

### Dashboard & System Endpoints

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Bearer | Returns role-tailored metrics and recent activity. |
| `GET` | `/api/health` | Public | Liveness probe and database status. |
| `GET` | `/api` | Public | JSON catalog of all REST endpoints. |

---

## 7. Business Rules & Assumptions

1. **Role Privileges**:
   - `employee`: Strictly isolated to personal claims; cannot approve, reject, or view other employees' records.
   - `director`: Organization-wide review; cannot modify employee claim data; must provide digital signature to approve and written feedback to reject.
   - `accounts`: Read-only financial audit; cannot create, edit, approve, or reject vouchers.
2. **Identity Derivation**:
   - Claimant identity is derived strictly from the verified JWT session on the server. The backend discards any client-supplied `employee_id` or `created_by_user_id`.
3. **Sequential Voucher Numbering**:
   - Automatically generated on creation following `EV-YYYY-XXXX` using calendar year and database sequence.
4. **Draft Protection & Immutability**:
   - Vouchers can only be edited or deleted while in `Draft` status. Once submitted (`Pending Approval`), the record becomes permanently immutable for employees.
5. **Mandatory Signatures**:
   - An employee signature is required before submitting for approval.
   - A Director signature is required before approving.
6. **Mandatory Rejection Remarks**:
   - Rejecting a voucher requires non-empty written feedback.

---

## 8. Testing & Quality Assurance

The application includes an automated test suite verifying functional requirements, business rules, RBAC boundaries, and data isolation.

```bash
# Run complete test suite (105 tests)
npm test

# Build client production bundle
npm --prefix client run build
```

- **Test Suite Pass Rate**: **105 / 105 Passed (100%)**
- Detailed test cases: [TEST_CASES.md](TEST_CASES.md)
- Execution logs: [TEST_EXECUTION_REPORT.md](TEST_EXECUTION_REPORT.md)
- Submission audit checklist: [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md)

---

*Prachay Securities Private Limited — Expense Voucher Management System © 2026*
