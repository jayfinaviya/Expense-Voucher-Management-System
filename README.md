# Expense Voucher Management System (EVMS)

> **PSPL Full Stack Developer Internship Assignment Submission**  
> **Client / Organization**: Prachay Securities Private Limited (ABC Company)  
> **Author**: Full Stack Developer Candidate  
> **Repository**: [https://github.com/jayfinaviya/Expense-Voucher-Management-System](https://github.com/jayfinaviya/Expense-Voucher-Management-System)  
> **Verification Status**: 105/105 Automated Tests Passing (100% Pass Rate) | Client Build Clean (0 Errors)

---

## Table of Contents
1. [Section A: Project Overview](#section-a-project-overview)
   - [Project Name & Purpose](#project-name--purpose)
   - [Problem Statement](#problem-statement)
   - [Key Features](#key-features)
   - [Technology Stack](#technology-stack)
2. [Section B: Project Setup Instructions](#section-b-project-setup-instructions)
   - [Prerequisites](#prerequisites)
   - [Clone or Download](#clone-or-download)
   - [Install Dependencies](#install-dependencies)
   - [Environment Variables Configuration](#environment-variables-configuration)
   - [Database Setup (PostgreSQL & SQLite)](#database-setup-postgresql--sqlite)
   - [Starting Frontend and Backend](#starting-frontend-and-backend)
   - [Local Development URLs](#local-development-urls)
   - [Troubleshooting Common Errors](#troubleshooting-common-errors)
3. [Section C: Database Schema Explanation](#section-c-database-schema-explanation)
   - [Entity Relationship Diagram](#entity-relationship-diagram)
   - [Users Table](#users-table)
   - [Vouchers Table](#vouchers-table)
   - [Primary Keys, Foreign Keys & Relationships](#primary-keys-foreign-keys--relationships)
   - [Voucher Status Lifecycle & Transitions](#voucher-status-lifecycle--transitions)
   - [Database Migrations & Initialization](#database-migrations--initialization)
4. [Section D: Comprehensive API Documentation](#section-d-comprehensive-api-documentation)
   - [Authentication APIs (`/api/auth`)](#authentication-apis-apiauth)
   - [File Upload API (`/api/upload`)](#file-upload-api-apiupload)
   - [Voucher Management APIs (`/api/vouchers`)](#voucher-management-apis-apivouchers)
   - [Dashboard Analytics API (`/api/dashboard`)](#dashboard-analytics-api-apidashboard)
   - [System Health & Discovery APIs](#system-health--discovery-apis)
5. [Section E: Assumptions Made During Development](#section-e-assumptions-made-during-development)
   - [User Roles & Permissions](#user-roles--permissions)
   - [Voucher Status Transitions](#voucher-status-transitions)
   - [Voucher Number Generation](#voucher-number-generation)
   - [Signature Upload & Storage](#signature-upload--storage)
   - [Authentication & Authorization](#authentication--authorization)
   - [Draft Editing & Deletion Rules](#draft-editing--deletion-rules)
   - [Approval & Rejection Behavior](#approval--rejection-behavior)
   - [Implemented Features vs. Planned Extensions](#implemented-features-vs-planned-extensions)
6. [Section F: Automated Test Suite & Quality Assurance](#section-f-automated-test-suite--quality-assurance)
7. [Section G: Visual Demonstration & Screenshot Guide](#section-g-visual-demonstration--screenshot-guide)

---

## Section A: Project Overview

### Project Name & Purpose
The **Expense Voucher Management System (EVMS)** is an enterprise-grade web application created for **Prachay Securities Private Limited (ABC Company)**. The platform digitizes, automates, and governs the internal corporate expense voucher lifecycle—from initial employee expenditure submission and digital canvas signature signing, through executive Director authorization, to financial disbursement and printable audit record keeping by the Accounts Department.

### Problem Statement
In traditional business environments, employees manually fill physical paper expense vouchers, attach paper receipts, walk between executive offices for manual Director signatures, and deliver physical claim slips to Accounts. This legacy process introduces significant friction:
- **Zero Real-Time Visibility**: Employees cannot track whether their reimbursement claim is pending, under review, or approved.
- **Audit Deficiencies & Lost Paperwork**: Paper vouchers get misplaced, lack tamper-resistant timestamps, and cannot be searched or cross-referenced quickly.
- **Compliance & Approval Bottlenecks**: Approvers lack summarized expense analytics, and rejection feedback is frequently lost or unrecorded.
- **Insecure Role Boundaries**: Physical workflows lack automated verification to prevent unauthorized modifications after submission.

The EVMS solves these bottlenecks by providing a unified, secure, role-governed web application with real-time audit trails, automated numbering, dual digital signatures, and instant reporting.

### Key Features
1. **Role-Based Access Control (RBAC)**:
   - **Employee Persona**: Self-service portal to create, save as Draft, update, delete, sign, submit, and track personal vouchers. Strict tenant isolation ensures employees cannot view or tamper with claims filed by other employees.
   - **Director Persona**: Executive portal providing organization-wide visibility, pending approval queues, 1-click batch filtering, approval with mandatory digital signature, and rejection with mandatory written feedback.
   - **Accounts Persona**: Finance audit portal with read-only visibility into all approved company vouchers, total reimbursement metrics, faceted search and multi-range filters, CSV ledger export, and printable A4 voucher slips.
2. **Dual-Mode Digital Signatures**:
   - Interactive HTML5 Canvas signature pad supporting mouse, touch, and stylus pen input.
   - File upload mode supporting scanned signature images (`PNG`, `JPEG`, `WEBP`, `SVG` up to 5MB).
   - Profile-level default signature saving for streamlined 1-click document signing.
3. **Sequential Voucher Numbering Engine**:
   - Automated, collision-free numbering following the enterprise standard: `EV-YYYY-XXXX` (e.g., `EV-2026-0001`).
4. **Strict Draft Lifecycle & State Machine**:
   - Vouchers can be modified or deleted **only** while in `Draft` status.
   - Once signed and submitted (`Pending Approval`), the record becomes strictly immutable for employees.
5. **Faceted Search & Multi-Dimensional Filtering**:
   - Real-time search across voucher numbers, employee names, titles, and descriptions.
   - Dimensional filters by Department, Expense Category, Voucher Status, Date Range, and Min/Max Amount.
   - Whitelisted multi-column sorting (date, amount, status, voucher number).
6. **Enterprise Print Engine & CSV Export**:
   - Dedicated `@media print` A4 corporate voucher slip complete with official letterhead, itemized particulars, amount in words, dual signature boxes, and Accounts clearance stamp.
   - 1-click CSV report export for downstream enterprise accounting systems.

### Technology Stack

| Layer | Technologies | Rationale & Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 5, React Router v7, Lucide React, HTML5 Canvas | Ultra-fast single-page application with modern hooks, declarative routing, and zero-latency canvas rendering. |
| **Styling & UI** | Vanilla CSS Design System, Responsive Media Queries, Inter & JetBrains Mono Fonts | Tailored corporate slate & navy aesthetic with dark/light harmony, tabular numeric styling, responsive mobile drawer navigation, and dedicated print stylesheets. |
| **Backend** | Node.js (v20+), Express.js (v5), Multer | RESTful API microservice with strict middleware pipelines, multipart file parsing, and centralized error handling. |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, CORS | Stateless Bearer token authentication, 10-round salted password hashing, HTTP header authorization guards, and strict role validation. |
| **Database** | SQLite3 (Active Local Default) / PostgreSQL 14+ (Enterprise Production) | Instant, zero-config local evaluation via embedded SQLite; full PostgreSQL schema and migration scripts provided for production deployments. |
| **Testing** | Node.js Native Test Assertions, HTTP Test Harness | 105 automated unit, integration, RBAC security, and PDF specification compliance tests. |

---

## Section B: Project Setup Instructions

### Prerequisites
Before running the project, ensure your workstation has the following installed:
- **Node.js**: Version `18.0.0` or higher (Recommended: `v20.x` LTS or `v22.x`)
- **npm**: Version `9.0.0` or higher (bundled with Node.js)
- **Git**: For version control cloning
- **PostgreSQL** *(Optional)*: Version 14 or higher if configuring external PostgreSQL database instead of the built-in SQLite engine.

Verify your environment:
```bash
node -v
npm -v
```

### Clone or Download
Clone the repository using Git or extract the project archive:
```bash
git clone <repository_url>
cd "Expense Voucher Management System"
```

### Install Dependencies
The repository consists of a root backend package and an independent client frontend package. Install both:

```bash
# 1. Install root and backend dependencies
npm install

# 2. Install client frontend dependencies
cd client
npm install
cd ..
```

### Environment Variables Configuration
The project includes a documented template file named `.env.example`. Create your active `.env` file:

**On Linux / macOS / Git Bash:**
```bash
cp .env.example .env
```

**On Windows (PowerShell / Command Prompt):**
```powershell
copy .env.example .env
```

Open `.env` in your text editor. The default configuration is tuned for **zero-configuration local development**:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JSON Web Token Secret (Replace with secure random key in production)
JWT_SECRET=replace_with_a_secure_random_secret
JWT_EXPIRES_IN=7d

# Database Configuration
# Default: SQLite (Requires zero setup, automatically initialized)
DB_TYPE=sqlite
DB_PATH=./server/data/expense_vouchers.db

# File Upload Configuration
UPLOAD_DIR=./server/uploads
MAX_FILE_SIZE_MB=5
```

### Database Setup (PostgreSQL & SQLite)

#### Option 1: SQLite (Recommended for Instant Evaluation - Zero Setup)
- **No external database installation required.**
- On backend startup (`npm run dev` or `npm run server`), the server checks `server/data/expense_vouchers.db`.
- If missing or empty, the backend automatically creates all tables, indexes, and pre-seeds realistic test users and initial vouchers.
- SQLite database binaries are ignored by Git via `.gitignore`.

#### Option 2: PostgreSQL (Enterprise Production Setup)
To run against a PostgreSQL server:
1. Ensure your PostgreSQL service is running.
2. Open your terminal or `psql` console and create the database:
   ```sql
   CREATE DATABASE expense_voucher_db;
   ```
3. Initialize the schema, constraints, indexes, and seed accounts using the provided PostgreSQL schema file:
   ```bash
   # From the project root directory:
   psql -U postgres -d expense_voucher_db -f database/schema_postgres.sql
   ```
4. Update `.env` with your PostgreSQL connection URL:
   ```env
   DB_TYPE=postgres
   DATABASE_URL=postgresql://postgres:your_secure_password@localhost:5432/expense_voucher_db
   ```

### Starting Frontend and Backend

You can start both tiers simultaneously with a single command from the project root:

```bash
npm run dev
```

*(This runs `concurrently "npm run server" "npm run client"`)*

Alternatively, you can run the backend and frontend in separate terminal windows:

**Terminal 1 (Backend API Server):**
```bash
npm run server
```
*Expected Output: `Expense Voucher Management Server running on port 5000`*

**Terminal 2 (Frontend React Client):**
```bash
npm run client
```
*Expected Output: `Local: http://localhost:3000/`*

### Local Development URLs
- **Frontend Web Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API Service**: [http://localhost:5000](http://localhost:5000)
- **Backend API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Backend REST Directory**: [http://localhost:5000/api](http://localhost:5000/api)

### Pre-Configured Test Credentials
The database comes pre-seeded with 4 test user accounts:

| Role | User Name | Email Address | Password | Department | Permissions & Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Employee** | Alex Turner | `employee@prachay.com` | `password123` | Engineering | Create vouchers, edit/delete drafts, sign, submit, view own claims. |
| **Employee 2** | Priya Patel | `priya.patel@prachay.com` | `password123` | Marketing | Verify multi-tenant isolation (Alex cannot view Priya's claims). |
| **Director** | Sarah Jenkins | `director@prachay.com` | `password123` | Executive | View all organization vouchers, pending approval queue, approve with signature, reject with remarks. |
| **Accounts** | Rohit Verma | `accounts@prachay.com` | `password123` | Finance & Accounts | View all company vouchers, multi-dimensional search & filter, export CSV, print official A4 voucher slips. |

> 💡 **Quick Login Tip**: The login page (`/login`) includes **1-Click Demo Account Buttons** that instantly fill credentials and sign in as any of the 4 personas!

### Troubleshooting Common Errors

| Issue / Error | Likely Cause | Solution |
| :--- | :--- | :--- |
| `Error: listen EADDRINUSE :::5000` | Port 5000 is already in use by another service. | Terminate the process using port 5000 (e.g., `netstat -ano \| findstr :5000` on Windows, or specify a different `PORT=5001` in `.env`). |
| `Error: listen EADDRINUSE :::3000` | Port 3000 is already in use by Vite or another app. | Close the conflicting process, or Vite will automatically prompt to use port 3001. |
| `Cannot find module 'express'` | Dependencies were not installed in the root directory. | Run `npm install` in the project root. |
| `Cannot find module 'react'` | Dependencies were not installed in the client directory. | Run `cd client && npm install && cd ..`. |
| `File too large. Maximum signature image size is 5MB.` | Uploaded signature image exceeds Multer limit. | Upload an image smaller than 5MB (`PNG`, `JPEG`, `WEBP`, or `SVG`). |
| `Unauthorized: Token is invalid or expired` | JWT token expired (7-day default) or `JWT_SECRET` changed. | Click **Logout** in the navigation bar and log in again to receive a fresh token. |
| `Forbidden: Only employees can create expense vouchers` | Authenticated user is logged in as Director or Accounts. | Log out and sign in as `employee@prachay.com`. |

---

## Section C: Database Schema Explanation

### Entity Relationship Diagram

```
┌─────────────────────────────────────────┐
│                 USERS                   │
├─────────────────────────────────────────┤
│ PK  id                 INTEGER / SERIAL │
│     email              VARCHAR(255)     │◄───┐
│     password_hash      VARCHAR(255)     │    │
│     name               VARCHAR(255)     │    │
│     role               VARCHAR(50)      │    │
│     department         VARCHAR(100)     │    │
│     employee_id        VARCHAR(50)      │    │
│     default_signature  TEXT             │    │
│     created_at         TIMESTAMP        │    │
└─────────────────────────────────────────┘    │
                   ▲                           │
                   │                           │
          1        │                           │ 1
          ─────────┴─────────────────┐         │
          │ created_by_user_id       │ approved_by_user_id
          ▼                          ▼         │
┌──────────────────────────────────────────────┴──────────┐
│                        VOUCHERS                         │
├─────────────────────────────────────────────────────────┤
│ PK  id                      INTEGER / SERIAL            │
│     voucher_number          VARCHAR(50)  [UNIQUE]       │
│     voucher_date            DATE                        │
│     expense_date            DATE                        │
│     department              VARCHAR(100)                │
│     expense_title           VARCHAR(255)                │
│     expense_category        VARCHAR(100)                │
│     expense_description     TEXT                        │
│     amount                  DECIMAL(12,2) [> 0]         │
│     status                  VARCHAR(50)  ['Draft', etc] │
│ FK  created_by_user_id      INTEGER                     │
│     employee_name           VARCHAR(255)                │
│     employee_id             VARCHAR(50)                 │
│     employee_signature      TEXT                        │
│     employee_signature_date TIMESTAMP                   │
│ FK  approved_by_user_id      INTEGER                     │
│     director_name           VARCHAR(255)                │
│     director_signature      TEXT                        │
│     approval_date           TIMESTAMP                   │
│     rejection_reason        TEXT                        │
│     created_at              TIMESTAMP                   │
│     updated_at              TIMESTAMP                   │
└─────────────────────────────────────────────────────────┘
```

### Users Table
Stores employee and administrative credentials, permissions, and default signature preferences.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` / `SERIAL` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for each user account. |
| `email` | `VARCHAR(255)` | `UNIQUE NOT NULL` | Login email address (case-insensitive lookup). |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Bcrypt salted hash (10 rounds) of user password. |
| `name` | `VARCHAR(255)` | `NOT NULL` | Full name of the user (e.g., Alex Turner). |
| `role` | `VARCHAR(50)` | `NOT NULL CHECK (role IN ('employee', 'director', 'accounts'))` | System role governing UI portals and backend route authorization. |
| `department` | `VARCHAR(100)` | Nullable | Primary business division (e.g., Engineering, Executive). |
| `employee_id` | `VARCHAR(50)` | Nullable | Corporate badge/personnel number (e.g., `EMP-0412`). |
| `default_signature` | `TEXT` | Nullable | Base64 data URI or file path of user's saved digital signature. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Account provisioning timestamp. |

### Vouchers Table
Stores financial voucher particulars, workflow state, employee and director digital signatures, and audit logs.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` / `SERIAL` | `PRIMARY KEY AUTOINCREMENT` | Internal synthetic primary key. |
| `voucher_number` | `VARCHAR(50)` | `UNIQUE NOT NULL` | Sequential identifier formatted as `EV-YYYY-XXXX`. |
| `voucher_date` | `DATE` | `NOT NULL` | Date when the voucher was created in the system. |
| `expense_date` | `DATE` | `NOT NULL` | Date when the expenditure actually occurred. |
| `department` | `VARCHAR(100)` | `NOT NULL` | Department to which the expense is charged. |
| `expense_title` | `VARCHAR(255)` | `NOT NULL` | Concise title summarizing the expense claim. |
| `expense_category` | `VARCHAR(100)` | `NOT NULL` | Categorization (e.g., Software, Travel, Office Supplies). |
| `expense_description`| `TEXT` | Nullable | Detailed narrative justification or line-item breakdown. |
| `amount` | `DECIMAL(12, 2)` | `NOT NULL CHECK (amount > 0)` | Claimed monetary amount in INR (`₹`). Must be positive. |
| `status` | `VARCHAR(50)` | `NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Pending Approval', 'Approved', 'Rejected'))` | Current lifecycle state. |
| `created_by_user_id` | `INTEGER` | `NOT NULL REFERENCES users(id)` | Foreign key linking claim to creator user. |
| `employee_name` | `VARCHAR(255)` | `NOT NULL` | Snapshot of employee's name at submission time. |
| `employee_id` | `VARCHAR(50)` | Nullable | Snapshot of employee's badge ID at submission time. |
| `employee_signature` | `TEXT` | Nullable | Base64 data URI or file path of employee's signature. |
| `employee_signature_date`| `TIMESTAMP` | Nullable | Timestamp when employee signed and submitted claim. |
| `approved_by_user_id`| `INTEGER` | `REFERENCES users(id)` | Foreign key linking voucher to reviewing Director. |
| `director_name` | `VARCHAR(255)` | Nullable | Name of Director who executed the decision. |
| `director_signature` | `TEXT` | Nullable | Digital signature of the approving Director. |
| `approval_date` | `TIMESTAMP` | Nullable | Timestamp when Director approval was granted. |
| `rejection_reason` | `TEXT` | Nullable | Mandatory written feedback explaining why claim was rejected. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Initial database row insertion timestamp. |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Last modification timestamp. |

### Performance Indexes
Six database indexes ensure sub-millisecond query execution across large ledger volumes:
1. `idx_vouchers_user`: Index on `vouchers(created_by_user_id)` for employee isolation.
2. `idx_vouchers_status`: Index on `vouchers(status)` for Director pending queues.
3. `idx_vouchers_department`: Index on `vouchers(department)` for departmental filtering.
4. `idx_vouchers_category`: Index on `vouchers(expense_category)` for expense breakdowns.
5. `idx_vouchers_expense_date`: Index on `vouchers(expense_date)` for financial date range queries.
6. `idx_vouchers_created_at`: Index on `vouchers(created_at)` for chronology sorting.

### Voucher Status Lifecycle & Transitions

```
                    ┌────────────────────────┐
                    │    1. Employee Form    │
                    └───────────┬────────────┘
                                │
                                ▼
                        ┌──────────────┐
                        │    Draft     │ ◄─── (Employee may Edit or Delete)
                        └───────┬──────┘
                                │
                    [Employee Signs & Submits]
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Pending Approval    │ ◄─── (Immutable / Read-Only for Employee)
                    └───────────┬───────────┘
                                │
            ┌───────────────────┴───────────────────┐
            │                                       │
    [Director Approves]                     [Director Rejects]
  (Mandatory Director Sig)                (Mandatory Audit Remarks)
            │                                       │
            ▼                                       ▼
     ┌──────────────┐                       ┌──────────────┐
     │   Approved   │                       │   Rejected   │
     └──────┬───────┘                       └──────────────┘
            │                                (Employee views feedback)
            ▼
┌────────────────────────┐
│  Accounts Department   │
│  - Official A4 Print   │
│  - Bank Reimbursement  │
└────────────────────────┘
```

- **Draft**: Voucher is in progress. The employee may update any field, change the amount, or delete the voucher. No approval can occur on a Draft.
- **Pending Approval**: The voucher has been signed by the employee and submitted. The voucher is now locked against employee modifications. It appears in the Director's queue.
- **Approved**: The Director verified the expense, affixed their digital signature, and confirmed authorization. Forwarded to Accounts for disbursement.
- **Rejected**: The Director declined the expense and provided required feedback. The voucher is permanently archived with remarks for employee inspection.

### Database Migrations & Initialization
- **SQLite Initialization**: Run automatically on server startup via `server/config/db.js`.
- **Clean DDL Script**: Available at `database/schema.sql` (universal) and `database/schema_postgres.sql` (PostgreSQL-optimized).
- **Sequential Migration Asset**: Located at `database/migrations/001_initial_schema.sql`.

---

## Section D: Comprehensive API Documentation

All API routes are served under the base URL: `http://localhost:5000/api`.  
All protected endpoints require the HTTP Authorization header:
```http
Authorization: Bearer <jwt_token>
```

### Authentication APIs (`/api/auth`)

#### 1. User Login
- **Method & Endpoint**: `POST /api/auth/login`
- **Purpose**: Authenticates a user by email and password, returning a JWT token and user profile.
- **Authentication**: Public (None required)
- **Allowed Roles**: Any registered user (`employee`, `director`, `accounts`)
- **Request Body**:
  ```json
  {
    "email": "employee@prachay.com",
    "password": "password123"
  }
  ```
- **Example Response (200 OK)**:
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
      "employee_id": "EMP-0412",
      "default_signature": "data:image/svg+xml;utf8,..."
    }
  }
  ```
- **HTTP Status Codes**:
  - `200 OK`: Successful authentication.
  - `400 Bad Request`: Email or password missing in request body.
  - `401 Unauthorized`: Invalid credentials (email not found or incorrect password).

#### 2. Get Current Authenticated Profile
- **Method & Endpoint**: `GET /api/auth/me`
- **Purpose**: Validates active JWT session and retrieves current user profile.
- **Authentication**: Bearer Token required
- **Allowed Roles**: Any authenticated role
- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "email": "employee@prachay.com",
      "name": "Alex Turner",
      "role": "employee",
      "department": "Engineering",
      "employee_id": "EMP-0412",
      "default_signature": "data:image/svg+xml;utf8,..."
    }
  }
  ```
- **HTTP Status Codes**:
  - `200 OK`: Valid session.
  - `401 Unauthorized`: Missing, expired, or invalid token.

#### 3. Get Pre-Seeded Demo Accounts
- **Method & Endpoint**: `GET /api/auth/demo-users`
- **Purpose**: Returns pre-seeded test accounts for 1-click evaluation sign-in on the login page.
- **Authentication**: Public (None required)
- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "demoUsers": [
      {
        "id": 1,
        "email": "employee@prachay.com",
        "name": "Alex Turner",
        "role": "employee",
        "department": "Engineering",
        "employee_id": "EMP-0412",
        "defaultPassword": "password123"
      },
      {
        "id": 3,
        "email": "director@prachay.com",
        "name": "Sarah Jenkins",
        "role": "director",
        "department": "Executive Management",
        "employee_id": "DIR-0001",
        "defaultPassword": "password123"
      }
    ]
  }
  ```
- **HTTP Status Codes**: `200 OK`.

#### 4. Update Profile Signature
- **Method & Endpoint**: `POST /api/auth/signature`
- **Purpose**: Saves or updates the user's default saved digital signature.
- **Authentication**: Bearer Token required
- **Request Body (JSON Mode)**:
  ```json
  {
    "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
  ```
- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Signature updated successfully.",
    "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
  ```
- **HTTP Status Codes**:
  - `200 OK`: Signature saved.
  - `400 Bad Request`: No signature data provided.
  - `401 Unauthorized`: Not authenticated.

---

### File Upload API (`/api/upload`)

#### 5. Standalone Signature File Upload
- **Method & Endpoint**: `POST /api/upload/signature`
- **Purpose**: Uploads a scanned physical signature image file to the server storage directory (`/uploads`).
- **Authentication**: Bearer Token required
- **Allowed Roles**: Any authenticated role
- **Request Type**: `multipart/form-data`
- **Form Field**: `signatureFile` (Binary file: `PNG`, `JPG`, `WEBP`, or `SVG`, maximum 5MB)
- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Signature uploaded successfully",
    "url": "/uploads/sig-1791699050.png",
    "filename": "sig-1791699050.png"
  }
  ```
- **HTTP Status Codes**:
  - `200 OK`: File uploaded successfully.
  - `400 Bad Request`: File missing, invalid MIME type, or exceeds 5MB size limit.
  - `401 Unauthorized`: Not authenticated.

---

### Voucher Management APIs (`/api/vouchers`)

#### 6. List Vouchers (With Faceted Search & Filtering)
- **Method & Endpoint**: `GET /api/vouchers`
- **Purpose**: Retrieves a paginated list of vouchers with multifaceted query filters and strict role isolation.
- **Authentication**: Bearer Token required
- **Role Scoping Rules**:
  - `employee`: Strictly scoped to records where `created_by_user_id = user.id`.
  - `director` / `accounts`: Organization-wide visibility across all employees.
- **Query Parameters**:
  - `search` *(string)*: Universal search in voucher number, employee name, title, or description.
  - `voucherNumber` *(string)*: Exact or partial voucher number (e.g., `EV-2026`).
  - `employeeName` *(string)*: Filter by claimant name.
  - `department` *(string)*: Department filter or `'All'`.
  - `category` *(string)*: Expense category filter or `'All'`.
  - `status` *(string)*: Status filter (`'Draft'`, `'Pending Approval'`, `'Approved'`, `'Rejected'`, or `'All'`).
  - `startDate` *(YYYY-MM-DD)*: Filter `expense_date >= startDate`.
  - `endDate` *(YYYY-MM-DD)*: Filter `expense_date <= endDate`.
  - `minAmount` *(number)*: Filter `amount >= minAmount`.
  - `maxAmount` *(number)*: Filter `amount <= maxAmount`.
  - `sortBy` *(string)*: Column (`created_at`, `expense_date`, `amount`, `voucher_number`, `status`).
  - `sortOrder` *(string)*: `'ASC'` or `'DESC'` (default: `'DESC'`).
  - `page` *(integer)*: 1-indexed page number (default: `1`).
  - `limit` *(integer)*: Items per page (default: `25`, max: `100`).
- **Example Request**:
  ```http
  GET /api/vouchers?status=Approved&department=Engineering&limit=10 HTTP/1.1
  Authorization: Bearer <token>
  ```
- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "vouchers": [
      {
        "id": 1,
        "voucher_number": "EV-2026-0001",
        "voucher_date": "2026-10-06",
        "expense_date": "2026-10-04",
        "department": "Engineering",
        "expense_title": "AWS Cloud Hosting & Server Migration Fees",
        "expense_category": "Software & Subscriptions",
        "expense_description": "Monthly production cluster scale-out.",
        "amount": 34500.0,
        "status": "Approved",
        "created_by_user_id": 1,
        "employee_name": "Alex Turner",
        "employee_id": "EMP-0412",
        "employee_signature": "data:image/svg+xml;utf8,...",
        "employee_signature_date": "2026-10-06T10:00:00.000Z",
        "approved_by_user_id": 3,
        "director_name": "Sarah Jenkins",
        "director_signature": "data:image/svg+xml;utf8,...",
        "approval_date": "2026-10-07T14:30:00.000Z",
        "rejection_reason": null,
        "created_at": "2026-10-06T10:00:00.000Z",
        "updated_at": "2026-10-07T14:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```
- **HTTP Status Codes**:
  - `200 OK`: Success.
  - `401 Unauthorized`: Missing or invalid token.
  - `403 Forbidden`: Unauthorized role.

#### 7. Get Single Voucher Details
- **Method & Endpoint**: `GET /api/vouchers/:id`
- **Purpose**: Retrieves full details of a specific voucher by ID.
- **Authentication**: Bearer Token required
- **Allowed Roles**:
  - `employee`: Allowed **only** if the voucher belongs to them (`created_by_user_id = user.id`).
  - `director` / `accounts`: Allowed for all vouchers.
- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "voucher": {
      "id": 1,
      "voucher_number": "EV-2026-0001",
      "amount": 34500.0,
      "status": "Approved",
      "employee_name": "Alex Turner",
      "director_name": "Sarah Jenkins"
    }
  }
  ```
- **HTTP Status Codes**:
  - `200 OK`: Success.
  - `401 Unauthorized`: Not authenticated.
  - `403 Forbidden`: Employee attempting to view another employee's voucher.
  - `404 Not Found`: Voucher ID does not exist.

#### 8. Create Voucher (Draft or Submit)
- **Method & Endpoint**: `POST /api/vouchers`
- **Purpose**: Creates a new expense voucher. Can be saved as `Draft` or directly submitted as `Pending Approval`.
- **Authentication**: Bearer Token required
- **Allowed Roles**: `employee` only (Director/Accounts return 403 Forbidden).
- **Request Body**:
  ```json
  {
    "expense_date": "2026-10-10",
    "department": "Engineering",
    "expense_title": "Docker Hub Team License",
    "expense_category": "Software & Subscriptions",
    "expense_description": "Annual renewal for engineering container registry",
    "amount": 18500.0,
    "signature": "data:image/png;base64,...",
    "action": "submit"
  }
  ```
  *(Note: If `action: "draft"`, `signature` is optional. If `action: "submit"`, `signature` is mandatory).*
- **Example Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Voucher EV-2026-0004 submitted successfully for Director approval!",
    "voucher": {
      "id": 4,
      "voucher_number": "EV-2026-0004",
      "status": "Pending Approval",
      "amount": 18500.0
    }
  }
  ```
- **HTTP Status Codes**:
  - `201 Created`: Voucher created successfully.
  - `400 Bad Request`: Validation failure (missing title, department, date, non-positive amount, or missing signature on submission).
  - `401 Unauthorized`: Not authenticated.
  - `403 Forbidden`: Non-employee role.

#### 9. Update Voucher (Draft Only)
- **Method & Endpoint**: `PUT /api/vouchers/:id`
- **Purpose**: Modifies an existing voucher. Permitted **only** while in `Draft` status and owned by the calling employee.
- **Authentication**: Bearer Token required
- **Allowed Roles**: `employee` only.
- **Request Body**: Same schema as `POST /api/vouchers`.
- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Voucher EV-2026-0003 updated as Draft.",
    "voucher": {
      "id": 3,
      "voucher_number": "EV-2026-0003",
      "amount": 9200.0,
      "status": "Draft"
    }
  }
  ```
- **HTTP Status Codes**:
  - `200 OK`: Updated successfully.
  - `400 Bad Request`: Validation failure or attempting to edit a non-Draft voucher.
  - `403 Forbidden`: Employee attempting to edit someone else's voucher.
  - `404 Not Found`: Voucher does not exist.

#### 10. Delete Voucher (Draft Only)
- **Method & Endpoint**: `DELETE /api/vouchers/:id`
- **Purpose**: Permanently deletes an existing voucher. Permitted **only** while in `Draft` status and owned by the calling employee.
- **Authentication**: Bearer Token required
- **Allowed Roles**: `employee` only.
- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Voucher EV-2026-0003 has been deleted successfully."
  }
  ```
- **HTTP Status Codes**:
  - `200 OK`: Deleted successfully.
  - `400 Bad Request`: Business rule violation (attempting to delete `Pending Approval`, `Approved`, or `Rejected` voucher).
  - `403 Forbidden`: Calling user is not the owner.
  - `404 Not Found`: Voucher does not exist.

#### 11. Submit Draft Voucher for Approval
- **Method & Endpoint**: `POST /api/vouchers/:id/submit`
- **Purpose**: Transitions a `Draft` voucher to `Pending Approval`. Requires employee signature. Locks record from further employee edits.
- **Authentication**: Bearer Token required
- **Allowed Roles**: `employee` only (owner only).
- **Request Body**:
  ```json
  {
    "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
  ```
  *(Note: If the voucher already has a saved signature, body can be empty).*
- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Voucher EV-2026-0003 submitted to Director for review!",
    "voucher": {
      "id": 3,
      "status": "Pending Approval"
    }
  }
  ```
- **HTTP Status Codes**:
  - `200 OK`: Submitted successfully.
  - `400 Bad Request`: Voucher is not in `Draft` status, or signature is missing.
  - `403 Forbidden`: Caller is not the owner.
  - `404 Not Found`: Voucher does not exist.

#### 12. Approve Voucher (Director Only)
- **Method & Endpoint**: `POST /api/vouchers/:id/approve`
- **Purpose**: Approves a voucher in `Pending Approval` status. Requires Director digital signature. Status updates to `Approved`.
- **Authentication**: Bearer Token required
- **Allowed Roles**: `director` only (Employee/Accounts return 403 Forbidden).
- **Request Body**:
  ```json
  {
    "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
  ```
  *(Note: If omitted, automatically applies the Director's pre-saved profile signature).*
- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Voucher EV-2026-0002 approved successfully! Forwarded to Accounts for reimbursement.",
    "voucher": {
      "id": 2,
      "status": "Approved",
      "director_name": "Sarah Jenkins",
      "approval_date": "2026-10-11T12:00:00.000Z"
    }
  }
  ```
- **HTTP Status Codes**:
  - `200 OK`: Approved successfully.
  - `400 Bad Request`: Voucher is not in `Pending Approval` status, or Director signature is missing.
  - `403 Forbidden`: Non-director user attempted approval.
  - `404 Not Found`: Voucher does not exist.

#### 13. Reject Voucher (Director Only)
- **Method & Endpoint**: `POST /api/vouchers/:id/reject`
- **Purpose**: Rejects a voucher in `Pending Approval` status with mandatory written audit remarks. Status updates to `Rejected`.
- **Authentication**: Bearer Token required
- **Allowed Roles**: `director` only (Employee/Accounts return 403 Forbidden).
- **Request Body**:
  ```json
  {
    "rejection_reason": "Missing itemized tax invoice. Please upload vendor GST invoice copy."
  }
  ```
- **Example Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Voucher EV-2026-0002 has been rejected with feedback provided to employee.",
    "voucher": {
      "id": 2,
      "status": "Rejected",
      "rejection_reason": "Missing itemized tax invoice. Please upload vendor GST invoice copy."
    }
  }
  ```
- **HTTP Status Codes**:
  - `200 OK`: Rejected successfully.
  - `400 Bad Request`: `rejection_reason` is empty/missing, or voucher is not in `Pending Approval` status.
  - `403 Forbidden`: Non-director user attempted rejection.
  - `404 Not Found`: Voucher does not exist.

---

### Dashboard Analytics API (`/api/dashboard`)

#### 14. Get Role-Tailored Dashboard Statistics
- **Method & Endpoint**: `GET /api/dashboard/stats`
- **Purpose**: Computes role-specific metrics and recent activity tailored to the caller's authorized scope.
- **Authentication**: Bearer Token required
- **Allowed Roles**: `employee`, `director`, `accounts`
- **Role Responses**:
  - **Employee**:
    ```json
    {
      "success": true,
      "role": "employee",
      "stats": {
        "totalVouchers": 3,
        "totalAmountClaimed": 55749.0,
        "draftVouchers": 1,
        "pendingApproval": 1,
        "approvedVouchers": 1,
        "rejectedVouchers": 0
      },
      "recentVouchers": [ ... ]
    }
    ```
  - **Director**:
    ```json
    {
      "success": true,
      "role": "director",
      "stats": {
        "pendingApprovalCount": 1,
        "totalPendingAmount": 12499.0,
        "approvedToday": 1,
        "rejectedToday": 0,
        "totalVouchersInSystem": 3
      },
      "pendingList": [ ... ],
      "recentActivity": [ ... ]
    }
    ```
  - **Accounts**:
    ```json
    {
      "success": true,
      "role": "accounts",
      "stats": {
        "totalVouchers": 3,
        "pendingApproval": 1,
        "approvedVouchers": 1,
        "rejectedVouchers": 0,
        "totalApprovedExpenseAmount": 34500.0
      },
      "recentApprovedVouchers": [ ... ]
    }
    ```
- **HTTP Status Codes**:
  - `200 OK`: Success.
  - `401 Unauthorized`: Not authenticated.

---

### System Health & Discovery APIs

#### 15. Service Health Check
- **Method & Endpoint**: `GET /api/health`
- **Purpose**: Infrastructure liveness and database connection status probe.
- **Authentication**: Public
- **Example Response (200 OK)**:
  ```json
  {
    "status": "online",
    "timestamp": "2026-10-11T07:45:00.000Z",
    "service": "Prachay Securities Expense Voucher Management API",
    "database": "SQLite (expense_vouchers.db) Connected",
    "port": 5000
  }
  ```

#### 16. JSON API Catalog
- **Method & Endpoint**: `GET /api`
- **Purpose**: Self-documenting endpoint index outlining all supported routes.
- **Authentication**: Public

---

## Section E: Assumptions Made During Development

### User Roles & Permissions
1. **Three Mutually Exclusive Roles**:
   - `employee`: Submit personal claims, edit/delete personal drafts, sign.
   - `director`: Organization-wide review, approval with signature, rejection with feedback.
   - `accounts`: Organization-wide read-only financial audit, CSV export, print official slips.
2. **Server-Side Identity Verification**:
   - The backend **never trusts** client-submitted `employee_name`, `employee_id`, or `created_by_user_id`.
   - All ownership fields are derived strictly from the cryptographic JWT session on the server.
   - Attempts to alter user roles via `PUT /api/auth/me` or `/api/auth/role` are permanently blocked with `HTTP 403 Forbidden`.

### Voucher Status Transitions
1. The status lifecycle is strictly unidirectional from `Draft` to `Pending Approval`, after which the Director resolves it to either `Approved` or `Rejected`.
2. Re-approving an already `Approved` voucher or re-rejecting a `Rejected` voucher is rejected by the server with `HTTP 400 Bad Request`.

### Voucher Number Generation
1. Numbers follow the pattern `EV-YYYY-XXXX` (e.g., `EV-2026-0001`).
2. Numbers are generated sequentially based on the highest existing sequence number for the current calendar year.
3. The column has a `UNIQUE` database constraint preventing duplicates.

### Signature Upload & Storage
1. **Dual Storage Mechanism**:
   - **Canvas Vector Drawings**: Converted to base64 `data:image/png;base64` data URIs and stored in the database text column.
   - **Physical File Scans**: Uploaded via multipart form-data to `/server/uploads` using Multer with sanitized filenames and served statically via `/uploads/<filename>`.
2. **Mandatory Signatures**:
   - An employee signature is mandatory before submitting for approval.
   - A Director signature is mandatory before granting approval.

### Authentication & Authorization
1. Stateless JSON Web Tokens (JWT) are signed with HMAC-SHA256 and expire after 7 days (`JWT_EXPIRES_IN=7d`).
2. Tokens are transmitted in standard HTTP `Authorization: Bearer <token>` headers.
3. Passwords are salted and hashed using `bcryptjs` with 10 rounds.

### Draft Editing & Deletion Rules
1. Only the original creator of a voucher can edit or delete it.
2. Editing and deletion are permitted **exclusively** while status is `Draft`.
3. Once submitted (`Pending Approval`), the record becomes permanently immutable for employees.

### Approval & Rejection Behavior
1. Only authenticated users with `role: 'director'` can execute approval or rejection actions.
2. Approving a voucher requires the Director's signature and clears any previous rejection reasons.
3. Rejecting a voucher requires non-empty written feedback explaining the decision to the employee.

### Implemented Features vs. Planned Extensions

| Feature Area | Implemented in Current Submission | Planned / Future Architecture |
| :--- | :--- | :--- |
| **Authentication** | JWT Bearer tokens, bcrypt hashing, demo accounts. | Multi-factor authentication (MFA) via TOTP / SMS. |
| **Data Storage** | SQLite (embedded) + PostgreSQL DDL/migrations. | Distributed PostgreSQL cluster with read replicas. |
| **Signatures** | HTML5 Canvas pad + Multer file uploads (PNG/JPG/SVG/WEBP). | Cryptographic PKI X.509 digital certificates / Aadhaar e-Sign. |
| **Receipt Attachments** | Integrated signature upload pipeline. | Dedicated cloud object storage (AWS S3 / GCP Cloud Storage). |
| **Notifications** | Real-time in-app dashboard badges and status counts. | Automated email / WhatsApp notification webhooks. |
| **Reporting** | Printable A4 formal voucher slips & CSV export. | Automated monthly PDF payroll batch generation. |

---

## Section F: Automated Test Suite & Quality Assurance

The system includes a 105-test automated verification suite covering unit functions, REST routes, PDF specification requirements, and security boundaries.

### Executing the Test Suite
Run the test suite with:
```bash
npm test
```

### Test Suite Structure
The test command runs three test suites:
1. `server/tests/comprehensive_test_suite.js` (69 test cases):
   - User authentication, demo logins, JWT validation.
   - Voucher creation, draft updates, draft deletion.
   - Signature requirements and submission locks.
   - Director approval, director rejection with mandatory remarks.
   - Accounts read-only constraints.
   - Data validation (amounts > 0, mandatory fields, SQL injection defense).
   - 7-dimension search, filtering, and sorting.
2. `server/tests/pdf_checklist.test.js` (19 test cases):
   - Direct verification against the assignment PDF specification.
   - Automatic numbering, Draft rules, Director gates, Dashboard stats.
3. `server/tests/rbac_security.test.js` (17 test cases):
   - Role escalation prevention, identity spoofing defense.
   - Multi-tenant data isolation between employees.

**Result**: **105 / 105 Tests Passing (0 Failed, 0 Blocked)**.  
Detailed test specifications and execution logs are documented in [TEST_CASES.md](file:///d:/Project/Expense%20Voucher%20Management%20System/TEST_CASES.md) and [TEST_EXECUTION_REPORT.md](file:///d:/Project/Expense%20Voucher%20Management%20System/TEST_EXECUTION_REPORT.md).

---

## Section G: Visual Demonstration & Screenshot Guide

The project includes verified UI views corresponding to each core assignment deliverable:

1. **Login Page (`/login`)**:
   - Professional Prachay Securities brand header.
   - Email/password credential form.
   - 1-Click Demo Persona Switcher (Employee Alex, Employee Priya, Director Sarah, Accounts Rohit).
2. **Employee Dashboard (`/`)**:
   - Quick statistics cards: Total Claims, Claimed Amount, Drafts, Pending, Approved, Rejected.
   - Action buttons: "Create Expense Voucher", "My Claims".
   - Recent claims ledger with status badges.
3. **Create Expense Voucher Form**:
   - Auto-generated voucher number preview (`EV-2026-XXXX`).
   - Fields: Expense Date, Department dropdown, Category dropdown, Title, Description, Amount (`₹`).
   - Action buttons: "Save as Draft" and "Sign & Submit for Approval".
4. **HTML5 Canvas Digital Signature Pad**:
   - Interactive drawing canvas with stroke smoothing.
   - Clear canvas, undo, and sample signature generator.
   - Dual-tab file upload mode for scanned signature files.
5. **My Vouchers List**:
   - Dedicated table displaying only the logged-in employee's claims.
   - Status badges with color coding (Draft: Slate, Pending: Amber, Approved: Emerald, Rejected: Rose).
   - Actions for Drafts: "Edit", "Submit", "Delete".
6. **Voucher Details Modal**:
   - Full voucher particulars with audit timeline.
   - Rendered dual signature cards (Employee signature and Director signature).
   - Rejection feedback alert if status is Rejected.
7. **Director Executive Gateway**:
   - Pending Approvals queue with batch review metrics.
   - Claim inspection with direct "Approve Voucher" and "Reject Voucher" actions.
8. **Director Approval & Rejection Workflow**:
   - Approval modal requiring Director signature preview.
   - Rejection modal requiring mandatory written audit reason.
9. **Accounts Finance Ledger**:
   - Organization-wide view of all approved vouchers.
   - Aggregated financial payout metrics.
   - 1-Click CSV ledger data export.
10. **Faceted Search & Filters Drawer**:
    - Multi-criteria filtering by voucher number, claimant name, department, category, status, date range, and amount range.
11. **Printable Corporate A4 Voucher Slip**:
    - Activated via the "Print Slip" button on any approved voucher.
    - Official Prachay Securities letterhead, CIN, itemized table, amount in words, dual signature boxes, and Accounts clearance stamp.
12. **Mobile Responsive Layout**:
    - Responsive drawer navigation and flexible table cards adapting to smartphones and tablets.

---

## GitHub Submission Verification Notice

This repository has been prepared in accordance with the PSPL Internship Assignment submission standards:
- All source code, assets, configuration templates, and database schemas are included.
- Sensitive files (`.env`, database binaries, uploaded private signatures) are strictly excluded via `.gitignore`.
- Zero unpermitted Git pushes will occur without explicit authorization.

*Prachay Securities Private Limited — Expense Voucher Management System © 2026*
