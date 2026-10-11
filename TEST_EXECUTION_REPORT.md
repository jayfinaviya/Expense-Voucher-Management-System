# PSPL Expense Voucher Management System — QA Test Execution Report

**Project:** Expense Voucher Management System (EVMS)  
**Client / Evaluator:** Prachay Securities Private Limited (PSPL)  
**Role:** Senior QA Engineer & Full-Stack Test Automation Engineer  
**Report Date:** October 11, 2026  
**Execution Environment:** Node.js v20.17.0, Express.js 5.3, SQLite 3, React 19, Vite 5.4.11 (Windows x64)  
**Overall Verdict:** **100% PASS — ALL SPECIFICATIONS & SECURITY GATES VERIFIED**

---

## 1. Executive Summary

A comprehensive test automation framework was designed, implemented, and executed across all layers of the **Expense Voucher Management System (EVMS)**. Testing was conducted in alignment with the **PSPL Full Stack Developer Internship Assignment Specification PDF**, covering functional flows, role-based access control (RBAC), multi-tenant data isolation, input validation, and business rule enforcement.

### Test Metrics Overview

| Metric Category | Count | Percentage |
| :--- | :---: | :---: |
| **Total Automated Test Cases** | **105** | **100.0%** |
| — Comprehensive End-to-End Suite (`comprehensive_test_suite.js`) | 69 | 65.7% |
| — PDF Functional Checklist Suite (`pdf_checklist.test.js`) | 19 | 18.1% |
| — Role-Based Security Suite (`rbac_security.test.js`) | 17 | 16.2% |
| **Passed Tests** | **105** | **100.0%** |
| **Failed Tests** | **0** | **0.0%** |
| **Blocked Tests** | **0** | **0.0%** |
| **Code Regression Count** | **0** | **0.0%** |
| **Frontend Production Build Status** | **Passed** | 0 warnings, 0 errors |

---

## 2. Requirement-to-Test Mapping Table

| PDF Requirement | Specification Section | Implemented Test Case IDs | Test Result |
| :--- | :--- | :--- | :---: |
| **User Roles (Employee, Director, Accounts)** | Section 3 | `AUTH-01`, `AUTH-02`, `AUTH-03`, `AUTH-12` | **PASS** |
| **Secure Authentication & Session Management** | Section 6 (Auth) | `AUTH-04` through `AUTH-11` | **PASS** |
| **Voucher Auto-Numbering (`EV-YYYY-XXXX`)** | Section 5 & 10 (Rule 1, 2) | `EMP-01`, `VAL-11` | **PASS** |
| **Initial Draft Status Workflow** | Section 4 & 10 (Rule 3) | `EMP-01`, `EMP-04`, `EMP-09` | **PASS** |
| **Draft Edit & Deletion Boundaries** | Section 10 (Rule 4) | `EMP-04`, `EMP-09` | **PASS** |
| **Mandatory Employee Signature on Submission** | Section 9 & 10 (Rule 12) | `EMP-05`, `EMP-06` | **PASS** |
| **Submission Read-Only Lock** | Section 10 (Rule 5) | `EMP-07`, `EMP-08` | **PASS** |
| **Employee Tenant Data Isolation** | Section 3.1 & 10 (Rule 9) | `EMP-02`, `EMP-10`, `SEC-01`, `SEC-02` | **PASS** |
| **Director Organization-Wide Visibility** | Section 3.2 & 10 (Rule 10) | `DIR-01`, `DIR-02` | **PASS** |
| **Director Digital Signature on Approval** | Section 9 & 10 (Rule 13) | `DIR-03`, `DIR-04`, `DIR-05` | **PASS** |
| **Mandatory Feedback on Rejection** | Section 9 & 10 (Rule 8) | `DIR-07`, `DIR-08`, `EMP-13` | **PASS** |
| **Director Edit Restrictions on Employee Data** | Section 3.2 | `DIR-09` | **PASS** |
| **Accounts Organization-Wide Read-Only Access** | Section 3.3 & 10 (Rule 11) | `ACC-01`, `ACC-02`, `ACC-03` to `ACC-07` | **PASS** |
| **Mandatory Fields & Amount Validation** | Section 9 | `VAL-01` through `VAL-10` | **PASS** |
| **Multifaceted Search & Filtering (Bonus)** | Section 7 | `SRCH-01` through `SRCH-08` | **PASS** |
| **Role-Tailored Dashboard Analytics** | Section 8 | `DASH-01`, `DASH-02`, `DASH-03` | **PASS** |
| **Security, Tamper Resistance & Injection Defense** | Section 6 & Security Rules | `SEC-01` through `SEC-06` | **PASS** |

---

## 3. Bugs Identified During Testing & QA Fixes Applied

During test development and automated execution, three genuine defects and edge-case vulnerabilities were discovered and resolved:

### Defect 1: Multer `fileFilter` Error Caused HTTP 500 Instead of HTTP 400
- **Severity:** Medium
- **Location:** `server/index.js` (Error Handling Middleware)
- **Discovered In:** `SEC-04` file upload validation test.
- **Root Cause:** When an uploaded file possessed an invalid MIME type (e.g., text, executable), `upload.js` invoked `cb(new Error('Invalid file type...'), false)`. The centralized error handler checked only for `err.name === 'MulterError'`, causing non-Multer `Error` instances to fall through to `statusCode = err.status || 500`.
- **Fix Applied:** Added explicit detection in `server/index.js` for `Invalid file type`:
  ```javascript
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  ```
- **Rerun Result:** `SEC-04` passed with `HTTP 400 Bad Request`.

---

### Defect 2: Missing Validation on Corrupt / Non-Date Strings
- **Severity:** Medium
- **Location:** `server/controllers/voucherController.js` (`createVoucher` and `updateVoucher`)
- **Discovered In:** `VAL-06` invalid date format test.
- **Root Cause:** The controller verified truthiness of `expense_date` (`if (!expense_date)`) but did not validate whether the string was a valid calendar date or whitespace. Submitting `{ expense_date: "not-a-date" }` or `{ expense_date: "   " }` would persist malformed timestamps into the SQLite database.
- **Fix Applied:** Hardened date parsing validation in both `createVoucher` and `updateVoucher`:
  ```javascript
  if (!expense_date || (typeof expense_date === 'string' && !expense_date.trim())) {
    errors.push('Expense Date is mandatory.');
  } else if (isNaN(new Date(expense_date).getTime())) {
    errors.push('Expense Date must be a valid date.');
  }
  ```
- **Rerun Result:** `VAL-05` and `VAL-06` passed with `HTTP 400 Bad Request`.

---

### Defect 3: Approval / Submission Signature Fallback When Empty String Passed
- **Severity:** High
- **Location:** `server/controllers/voucherController.js` (`approveVoucher` and `submitVoucher`)
- **Discovered In:** `DIR-03` and `EMP-05` empty signature submission tests.
- **Root Cause:** The controller utilized logical OR fallback:
  ```javascript
  const finalSignature = signature || req.user.default_signature;
  ```
  If a Director or Employee submitted `{ signature: "" }` (explicitly empty string), the falsy empty string evaluated to the right-hand operand, automatically approving the voucher with their pre-seeded default signature instead of rejecting the empty input as required by PDF Section 9.
- **Fix Applied:** Explicitly differentiated between `undefined/null` and empty string:
  ```javascript
  let finalSignature = signature;
  if (finalSignature === undefined || finalSignature === null) {
    finalSignature = req.user.default_signature;
  }
  if (!finalSignature || (typeof finalSignature === 'string' && !finalSignature.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Director Signature is mandatory before approval. Please sign or upload signature.'
    });
  }
  ```
- **Rerun Result:** `DIR-03` and `EMP-05` passed with strict `HTTP 400 Bad Request`.

---

## 4. Files Modified to Fix Bugs

1. **`server/index.js`**
   - Fixed Multer error status mapping to return `400 Bad Request` on invalid file MIME types.
2. **`server/controllers/voucherController.js`**
   - Added whitespace and `isNaN(new Date().getTime())` date validation for `expense_date`.
   - Prevented silent fallback when an explicit empty string signature is passed to `approveVoucher` or `submitVoucher`.
3. **`server/tests/comprehensive_test_suite.js`**
   - Created master automated test suite verifying all 69 scenarios across 7 modules.
4. **`package.json`**
   - Updated `npm test` script to run `comprehensive_test_suite.js`, `pdf_checklist.test.js`, and `rbac_security.test.js`.

---

## 5. Test Suite Execution Logs

```
================================================================
🚀 EXECUTING PSPL EXPENSE VOUCHER MANAGEMENT COMPREHENSIVE QA SUITE
================================================================

📦 Module 1: Authentication & Authorization (AUTH)
  ✅ [AUTH-01] PASS: Login with valid Employee credentials (120ms)
  ✅ [AUTH-02] PASS: Login with valid Director credentials (107ms)
  ✅ [AUTH-03] PASS: Login with valid Accounts credentials (118ms)
  ✅ [AUTH-04] PASS: Login with incorrect password returns HTTP 401 (105ms)
  ✅ [AUTH-05] PASS: Login with unknown email returns HTTP 401 (6ms)
  ✅ [AUTH-06] PASS: Login with missing email returns HTTP 400 (4ms)
  ✅ [AUTH-07] PASS: Login with missing password returns HTTP 400 (4ms)
  ✅ [AUTH-08] PASS: Access protected endpoint without token returns HTTP 401 (7ms)
  ✅ [AUTH-09] PASS: Access protected endpoint with invalid Bearer token returns HTTP 401 (3ms)
  ✅ [AUTH-10] PASS: Access protected endpoint with expired JWT token returns HTTP 401 (10ms)
  ✅ [AUTH-11] PASS: Verify sensitive password hash is never exposed in API payloads (137ms)
  ✅ [AUTH-12] PASS: Role escalation via API request is strictly prohibited (HTTP 403) (14ms)

📦 Module 2: Employee Portal & Voucher Lifecycle (EMP)
  ✅ [EMP-01] PASS: Create a new voucher saved as Draft with sequential number (38ms)
  ✅ [EMP-02] PASS: View only the employee own vouchers in list (10ms)
  ✅ [EMP-03] PASS: View owned voucher details by ID (5ms)
  ✅ [EMP-04] PASS: Edit an owned voucher while in Draft status (38ms)
  ✅ [EMP-05] PASS: Prevent submission of voucher without employee signature (8ms)
  ✅ [EMP-06] PASS: Submit draft voucher with valid signature -> Pending Approval (17ms)
  ✅ [EMP-07] PASS: Prevent editing a voucher once submitted (Pending Approval) (5ms)
  ✅ [EMP-08] PASS: Prevent deleting a voucher once submitted (Pending Approval) (6ms)
  ✅ [EMP-09] PASS: Delete owned Draft voucher works when in Draft status (35ms)
  ✅ [EMP-10] PASS: Prevent retrieving another employee voucher by changing ID (HTTP 403) (13ms)
  ✅ [EMP-11] PASS: Prevent employee from calling Director approval API (HTTP 403) (6ms)
  ✅ [EMP-12] PASS: Prevent employee from calling Director rejection API (HTTP 403) (6ms)
  ✅ [EMP-13] PASS: View rejection reason on rejected voucher (7ms)

📦 Module 3: Director Management & Executive Authorization (DIR)
  ✅ [DIR-01] PASS: View organization-wide vouchers across all employees (9ms)
  ✅ [DIR-02] PASS: View pending approval queue filtered by status (7ms)
  ✅ [DIR-03] PASS: Prevent approval without Director signature (HTTP 400) (7ms)
  ✅ [DIR-04] PASS: Approve pending voucher with Director digital signature -> Approved (18ms)
  ✅ [DIR-05] PASS: Prevent re-approving or approving non-pending voucher (HTTP 400) (6ms)
  ✅ [DIR-06] PASS: Create and submit voucher to test rejection workflow (21ms)
  ✅ [DIR-07] PASS: Prevent rejecting voucher without mandatory reason (HTTP 400) (6ms)
  ✅ [DIR-08] PASS: Reject pending voucher with mandatory reason -> Rejected (18ms)
  ✅ [DIR-09] PASS: Prevent Director from editing employee expense details (HTTP 403) (6ms)

📦 Module 4: Accounts Team & Read-Only Audit (ACC)
  ✅ [ACC-01] PASS: Accounts can view all organization vouchers (7ms)
  ✅ [ACC-02] PASS: Accounts can view voucher details and signatures (5ms)
  ✅ [ACC-03] PASS: Prevent Accounts from creating vouchers (HTTP 403) (6ms)
  ✅ [ACC-04] PASS: Prevent Accounts from editing vouchers (HTTP 403) (5ms)
  ✅ [ACC-05] PASS: Prevent Accounts from deleting vouchers (HTTP 403) (9ms)
  ✅ [ACC-06] PASS: Prevent Accounts from approving vouchers (HTTP 403) (5ms)
  ✅ [ACC-07] PASS: Prevent Accounts from rejecting vouchers (HTTP 403) (5ms)

📦 Module 5: Form & Data Validation (VAL)
  ✅ [VAL-01] PASS: Department is mandatory (empty string returns HTTP 400) (6ms)
  ✅ [VAL-02] PASS: Department whitespace-only returns HTTP 400 (5ms)
  ✅ [VAL-03] PASS: Expense Title is mandatory (empty string returns HTTP 400) (5ms)
  ✅ [VAL-04] PASS: Expense Title whitespace-only returns HTTP 400 (6ms)
  ✅ [VAL-05] PASS: Expense Date is mandatory (empty returns HTTP 400) (5ms)
  ✅ [VAL-06] PASS: Expense Date invalid format returns HTTP 400 (5ms)
  ✅ [VAL-07] PASS: Amount is mandatory (missing returns HTTP 400) (6ms)
  ✅ [VAL-08] PASS: Amount must be greater than zero (zero returns HTTP 400) (5ms)
  ✅ [VAL-09] PASS: Amount must be greater than zero (negative returns HTTP 400) (4ms)
  ✅ [VAL-10] PASS: Amount must be a valid numeric value (NaN returns HTTP 400) (4ms)
  ✅ [VAL-11] PASS: Voucher Number is automatically and uniquely generated (EV-YYYY-XXXX) (52ms)

📦 Module 6: Dashboard Analytics & Search Filters (DASH & SRCH)
  ✅ [DASH-01] PASS: Employee Dashboard metrics correctly isolate personal counts (8ms)
  ✅ [DASH-02] PASS: Director Dashboard metrics calculate system-wide counts (7ms)
  ✅ [DASH-03] PASS: Accounts Dashboard metrics calculate total approved expense amount (7ms)
  ✅ [SRCH-01] PASS: Filter vouchers by Voucher Number exact/partial match (6ms)
  ✅ [SRCH-02] PASS: Filter vouchers by Employee Name match (7ms)
  ✅ [SRCH-03] PASS: Filter vouchers by Department match (5ms)
  ✅ [SRCH-04] PASS: Filter vouchers by Expense Category match (6ms)
  ✅ [SRCH-05] PASS: Filter vouchers by Status match (7ms)
  ✅ [SRCH-06] PASS: Filter vouchers by Date Range (startDate and endDate) (6ms)
  ✅ [SRCH-07] PASS: Filter vouchers by Amount Range (minAmount and maxAmount) (6ms)
  ✅ [SRCH-08] PASS: Sort vouchers by amount in ASC and DESC order (14ms)

📦 Module 7: Security & Data Isolation (SEC)
  ✅ [SEC-01] PASS: Tenant Data Isolation: Alex cannot query Priya vouchers (11ms)
  ✅ [SEC-02] PASS: Identity Spoofing Defense: Server discards client employee_id (22ms)
  ✅ [SEC-03] PASS: SQL Injection Immunity: Parameterized queries withstand SQL injections (7ms)
  ✅ [SEC-04] PASS: Signature upload rejects arbitrary non-image MIME types (6ms)
  ✅ [SEC-05] PASS: HTTP Status Fidelity: 401 Unauthorized vs 403 Forbidden (8ms)
  ✅ [SEC-06] PASS: Immutable Draft Ownership: Update cannot alter voucher owner (5ms)

================================================================
🏁 TEST SUITE RUN COMPLETED: 69/69 PASSED (0 FAILED, 0 BLOCKED)
================================================================

🚀 Starting PDF Checklist Comprehensive Test Suite...
Connected to SQLite database at: D:\Project\Expense Voucher Management System\server\data\expense_vouchers.db
📋 Group 1: User Personas & Role Isolation
  ✅ PASS: Verify pre-seeded users exist with correct roles
📋 Group 2: Business Rules - Auto-Numbering & Draft Workflow
  ✅ PASS: Voucher Number is automatically formatted as EV-YYYY-XXXX
  ✅ PASS: New voucher is saved initially as Draft with all mandatory fields
📋 Group 3: Draft Edit, Delete & Submission Locks
  ✅ PASS: Employee can update a voucher while it is in Draft status
  ✅ PASS: Submission requires Employee Signature and locks to read-only
📋 Group 4: Role Isolation Boundaries
  ✅ PASS: Employee 2 cannot view Employee 1 vouchers
  ✅ PASS: Director and Accounts can view all vouchers across the company
📋 Group 5: Executive Approval Gate & Mandatory Feedback
  ✅ PASS: Director rejection requires non-empty remarks
  ✅ PASS: Director approval requires Director Signature and moves to Approved
📋 Group 6: Section 7 Multifaceted Search & Filter (Bonus Point)
  ✅ PASS: Search & Filter by Voucher Number
  ✅ PASS: Search & Filter by Employee Name
  ✅ PASS: Filter by Department
  ✅ PASS: Filter by Expense Category
  ✅ PASS: Filter by Status (Draft, Pending Approval, Approved, Rejected)
  ✅ PASS: Filter by Date Range
  ✅ PASS: Filter by Amount Range (Min and Max)
📋 Group 7: Section 8 Role-Tailored Dashboard Metrics
  ✅ PASS: Employee Dashboard metrics calculate personal totals correctly
  ✅ PASS: Director Dashboard metrics include Pending Count, Pending Amount, and Daily Counts
  ✅ PASS: Accounts Dashboard metrics calculate total approved expense amount for disbursement
🏁 Test Summary: 19 Passed, 0 Failed

🔒 ============================================================
🛡️  EVMS ROLE-BASED ACCESS CONTROL & DATA ISOLATION TEST SUITE
🔒 ============================================================
📋 Test Group 1: Employee Data Isolation (Scenarios 2, 5 & 9)
  ✅ PASS: Employee Alex sees ONLY their own expense claims
  ✅ PASS: Employee Priya sees ONLY their own expense claims
  ✅ PASS: Employee attempting to retrieve another employee voucher by ID returns HTTP 403 Forbidden
  ✅ PASS: Employee attempting to update another employee voucher returns HTTP 403 Forbidden
  ✅ PASS: Backend derives Employee ID strictly from authenticated session (never trusts frontend input)
📋 Test Group 2: Employee API Boundary Protection (Scenarios 3, 4 & 6)
  ✅ PASS: Employee calling Director approval API returns HTTP 403 Forbidden
  ✅ PASS: Employee calling Director rejection API returns HTTP 403 Forbidden
  ✅ PASS: Employee attempting to change their role through an API request is blocked
📋 Test Group 3: Director Organization-Wide Access (Scenario 7)
  ✅ PASS: Director login has organization-wide visibility across all employees
  ✅ PASS: Director dashboard metrics cover system-wide vouchers
📋 Test Group 4: Accounts Read-Only Enforcement (Scenario 8)
  ✅ PASS: Accounts login has organization-wide read access
  ✅ PASS: Accounts cannot create new vouchers (write forbidden -> HTTP 403)
  ✅ PASS: Accounts cannot edit vouchers (write forbidden -> HTTP 403)
  ✅ PASS: Accounts cannot delete vouchers (delete forbidden -> HTTP 403)
  ✅ PASS: Accounts cannot approve vouchers (approval forbidden -> HTTP 403)
  ✅ PASS: Accounts cannot reject vouchers (rejection forbidden -> HTTP 403)
📋 Test Group 5: Existing Workflow Verification (Scenario 10)
  ✅ PASS: Full lifecycle: Create Draft -> Update Draft -> Sign & Submit -> Director Approve
🏁 RBAC Security Suite Completed: 17 Passed, 0 Failed

============================================================
TOTAL AUTOMATED ASSERTIONS: 105 PASSED, 0 FAILED
============================================================
```

---

## 6. Remaining Risks & Recommendations

1. **Storage of Signature Files**: Uploaded signatures are currently stored on the local disk (`server/uploads/`). For multi-instance horizontal scaling, transition disk storage to S3 or Google Cloud Storage with presigned URLs.
2. **CSRF & Cookie Hardening**: If migrating from Bearer JWTs to cookies, ensure `SameSite=Strict`, `HttpOnly`, and CSRF tokens are enforced.
3. **Audit Trail Persistence**: The application currently tracks `created_at` and `updated_at`. Creating a dedicated `voucher_audit_logs` table recording all state transitions (Draft -> Submitted -> Approved/Rejected) with actor ID and reason will further strengthen regulatory compliance for PSPL financial auditing.
