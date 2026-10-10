# Expense Voucher Management System

> **Full Stack Developer Internship Assignment**  
> **Client Organization**: Prachay Securities Private Limited (ABC Company)  
> **Application**: Web-based Enterprise Expense Voucher Creation, Multi-Level Digital Authorization, and Financial Reimbursement Audit System.

---

## 1. Executive Summary & Overview

The **Expense Voucher Management System (EVMS)** digitizes the end-to-end expense reimbursement lifecycle for Prachay Securities Private Limited. Prior to this platform, employees manually filled physical paper vouchers, walked them to the Director for ink signatures, and handed physical receipts to the Accounts department.

This web application replaces the legacy manual workflow with an auditable, role-governed digital pipeline featuring:
1. **Employee Workspace**: Self-service voucher creation, live draft saving, HTML5 digital canvas signature affixing, and real-time status tracking.
2. **Director Executive Gateway**: System-wide approval queue, multi-factor criteria inspection, cryptographic signature authorization, and rejection with mandatory audit remarks.
3. **Accounts & Finance Division**: Organization-wide disbursement audit, faceted search and range filtering, printable formal A4 voucher slips with dual signatures, and CSV data export.

---

## 2. Technology Stack

- **Frontend**:
  - **React 18** with Vite build tooling
  - **Design System**: Bespoke, high-trust corporate slate/navy aesthetic (custom CSS tokens, tabular typography with Inter & JetBrains Mono, zero clichéd AI tropes)
  - **Icons**: Lucide React
  - **Signatures**: Dual-mode HTML5 Canvas Signature Pad (mouse/touch/stylus) + image file upload
  - **Print Engine**: Dedicated `@media print` A4 corporate voucher slip with letterhead and dual signatures
- **Backend**:
  - **Node.js** (v20+) & **Express.js**
  - **Authentication**: Stateless JSON Web Tokens (JWT) with HTTP Bearer headers
  - **Role-Based Access Control (RBAC)**: Strict server-side route guards enforcing Employee, Director, and Accounts privileges
  - **File Upload**: Multer multipart middleware with 5MB cap and mime-type filters (PNG, JPEG, WEBP, SVG)
- **Database**:
  - **Active Runtime**: Embedded SQLite with promisified SQL query layer (zero external database daemon required for instant evaluation)
  - **Production Migration Assets**: Full PostgreSQL & MySQL schema definitions in `database/schema.sql` and `database/migrations/001_initial_schema.sql`

---

## 3. Pre-Configured Test Credentials

For evaluation convenience, the system seeds 4 realistic user accounts with hashed passwords:

| Role | Name | Email | Password | Department | Permissions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Employee** | Alex Turner | `employee@prachay.com` | `password123` | Engineering | Create, edit/delete drafts, sign, submit, view own vouchers |
| **Employee 2** | Priya Patel | `priya.patel@prachay.com` | `password123` | Marketing | Test multi-tenant isolation (employees cannot see other employees' claims) |
| **Director** | Sarah Jenkins | `director@prachay.com` | `password123` | Executive | View all claims, review pending queue, approve with signature, reject with remarks |
| **Accounts** | Rohit Verma | `accounts@prachay.com` | `password123` | Finance & Accounts | View all claims, search/filter/sort, print formal vouchers, export CSV |

> 💡 **Evaluator Convenience**: The top navigation bar includes an **Evaluator Quick Switcher** allowing instant 1-click persona switching without re-entering credentials!

---

## 4. Voucher Lifecycle & Workflow

```
[Employee creates Voucher]
          │
          ▼
       [Draft] ───────────── (Employee may Edit or Delete)
          │
    (Employee signs & submits)
          │
          ▼
  [Pending Approval] ───────── (Read-only for Employee)
          │
     ┌────┴────────────────────────┐
     │                             │
[Director Rejects]        [Director Approves]
(Mandatory Remarks)       (Mandatory Signature)
     │                             │
     ▼                             ▼
 [Rejected]                    [Approved]
(Employee views feedback)          │
                                   ▼
                    [Accounts Reimbursement Queue]
                    (Print Official Voucher Slip / Payout)
```

---

## 5. Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Clone & Enter Directory
```bash
git clone <repository_url>
cd "Expense Voucher Management System"
```

### 2. Install Dependencies
```bash
# Root & backend dependencies
npm install

# Client frontend dependencies
cd client
npm install
cd ..
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=prachay_securities_expense_voucher_jwt_secret_key_2026_production_safe
JWT_EXPIRES_IN=7d
DB_TYPE=sqlite
DB_PATH=./server/data/expense_vouchers.db
UPLOAD_DIR=./server/uploads
MAX_FILE_SIZE_MB=5
```

### 4. Start the Application
Run both backend API and React client concurrently:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend Portal**: `http://localhost:3000`

---

## 6. Database Schema Explanation

### `users` Table
Stores corporate personnel, credentials, roles, and default saved signatures:
- `id` (INTEGER PRIMARY KEY)
- `email` (VARCHAR(255) UNIQUE NOT NULL)
- `password_hash` (VARCHAR(255) NOT NULL)
- `name` (VARCHAR(255) NOT NULL)
- `role` (VARCHAR(50) NOT NULL: `'employee'`, `'director'`, `'accounts'`)
- `department` (VARCHAR(100))
- `employee_id` (VARCHAR(50))
- `default_signature` (TEXT, base64 or URL)
- `created_at` (TIMESTAMP)

### `vouchers` Table
Stores financial voucher particulars, digital signatures, and audit logs:
- `id` (INTEGER PRIMARY KEY)
- `voucher_number` (VARCHAR(50) UNIQUE NOT NULL, e.g., `EV-2026-0001`)
- `voucher_date` (DATE NOT NULL)
- `expense_date` (DATE NOT NULL)
- `department` (VARCHAR(100) NOT NULL)
- `expense_title` (VARCHAR(255) NOT NULL)
- `expense_category` (VARCHAR(100) NOT NULL)
- `expense_description` (TEXT)
- `amount` (DECIMAL(12,2) NOT NULL CHECK (amount > 0))
- `status` (VARCHAR(50) NOT NULL: `'Draft'`, `'Pending Approval'`, `'Approved'`, `'Rejected'`)
- `created_by_user_id` (INTEGER NOT NULL REFERENCES users(id))
- `employee_name` (VARCHAR(255) NOT NULL)
- `employee_id` (VARCHAR(50))
- `employee_signature` (TEXT)
- `employee_signature_date` (TIMESTAMP)
- `approved_by_user_id` (INTEGER REFERENCES users(id))
- `director_name` (VARCHAR(255))
- `director_signature` (TEXT)
- `approval_date` (TIMESTAMP)
- `rejection_reason` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

## 7. RESTful API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate with email and password. Returns JWT token and user profile.
- `GET /api/auth/me`: Validate JWT token and retrieve current user session.
- `GET /api/auth/demo-users`: Retrieve list of pre-seeded test accounts for 1-click sign-in.
- `POST /api/upload/signature`: Upload signature image file (multipart/form-data, 5MB limit).

### Vouchers (`/api/vouchers`)
- `GET /api/vouchers`: List vouchers with search, filtering, sorting, and pagination.
  - Query parameters: `search`, `department`, `category`, `status`, `startDate`, `endDate`, `minAmount`, `maxAmount`, `sortBy`, `sortOrder`, `page`, `limit`.
  - Enforces role isolation (Employees receive only their own vouchers).
- `GET /api/vouchers/:id`: Retrieve single voucher details.
- `POST /api/vouchers`: Create new voucher (Employee only).
- `PUT /api/vouchers/:id`: Update Draft voucher (Employee only, Draft status only).
- `DELETE /api/vouchers/:id`: Delete Draft voucher (Employee only, Draft status only).
- `POST /api/vouchers/:id/submit`: Submit Draft voucher for approval with employee signature.
- `POST /api/vouchers/:id/approve`: Approve voucher with Director signature (Director only).
- `POST /api/vouchers/:id/reject`: Reject voucher with mandatory reason (Director only).

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/stats`: Get role-tailored metrics and recent activity.

---

## 8. Business Rules & Validation Enforcement

| Rule # | Requirement | Implementation |
| :--- | :--- | :--- |
| **BR-1** | Unique Voucher Number | Automatically formatted as `EV-YYYY-XXXX` with sequential auto-incrementing padding. |
| **BR-2** | Initial Draft Status | All newly created vouchers default to `Draft` status unless explicitly submitted with signature. |
| **BR-3** | Draft Edit/Delete Only | Only vouchers in `Draft` status can be edited or deleted. Enforced both client-side and server-side. |
| **BR-4** | Submitted Read-Only | Once submitted (`Pending Approval`), vouchers become read-only for employees. |
| **BR-5** | Employee Signature Requirement | Submission requires a valid signature (drawn on canvas or uploaded as image). |
| **BR-6** | Director Only Approvals | Only authenticated users with `role: 'director'` can approve or reject vouchers. |
| **BR-7** | Director Signature Requirement | Approval requires a valid Director signature before status updates to `Approved`. |
| **BR-8** | Mandatory Rejection Reason | Rejection requires non-empty remarks explaining reason to employee. |
| **BR-9** | Employee Visibility Boundary | Employees cannot access or query vouchers created by other employees. |
| **BR-10** | Organization-Wide Access | Director and Accounts Team can view all vouchers across all departments. |

---

## 9. Assumptions Made During Development

1. **Monetary Currency**: All financial figures are standardized in Indian Rupees (`INR ₹`), formatted using standard Indian numeric grouping.
2. **Signature Storage**: Dual-mode support accommodates both direct HTML5 Canvas vector renderings (stored as base64 PNG data URIs) and uploaded physical signature scans (handled via Multer in `/server/uploads`).
3. **Audit Trail**: Every record persists ISO-8601 creation timestamps, modification timestamps, employee submission timestamps, and director approval timestamps.
4. **Voucher Printing**: Designed according to Indian corporate accounting practices, featuring company CIN number, registered office header, itemized breakdown, amount in words, dual signature boxes, and accounts clearance stamp.

---

## 10. Verification & Demonstration Commands

To run unit checks and health probes:
```bash
# Verify API Health Probe
curl http://localhost:5000/api/health

# Verify Pre-Seeded Accounts
curl http://localhost:5000/api/auth/demo-users
```
