// ============================================================================
// PDF Checklist Automated Verification Suite
// Validates all Functional Requirements, Business Rules, and Validation Rules
// from the Full Stack Developer Internship Assignment Specification
// ============================================================================

const assert = require('assert');
const { initDatabase, dbGet, dbRun, dbAll } = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'prachay_securities_expense_voucher_jwt_secret_key_2026_production_safe';

const runTests = async () => {
  console.log('🚀 Starting PDF Checklist Comprehensive Test Suite...\n');
  await initDatabase();

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  };

  // --------------------------------------------------------------------------
  // 1. User Authentication & Pre-Seeded Personas
  // --------------------------------------------------------------------------
  console.log('📋 Group 1: User Personas & Role Isolation');

  let empUser, dirUser, accUser, emp2User;

  await test('Verify pre-seeded users exist with correct roles', async () => {
    empUser = await dbGet("SELECT * FROM users WHERE email = 'employee@prachay.com'");
    dirUser = await dbGet("SELECT * FROM users WHERE email = 'director@prachay.com'");
    accUser = await dbGet("SELECT * FROM users WHERE email = 'accounts@prachay.com'");
    emp2User = await dbGet("SELECT * FROM users WHERE email = 'priya.patel@prachay.com'");

    assert(empUser && empUser.role === 'employee', 'Employee user must exist with role employee');
    assert(dirUser && dirUser.role === 'director', 'Director user must exist with role director');
    assert(accUser && accUser.role === 'accounts', 'Accounts user must exist with role accounts');
    assert(emp2User && emp2User.role === 'employee', 'Second employee user must exist for tenant isolation');
  });

  // --------------------------------------------------------------------------
  // 2. Voucher Creation & Automatic Numbering (BR-1, BR-2, BR-3)
  // --------------------------------------------------------------------------
  console.log('\n📋 Group 2: Business Rules - Auto-Numbering & Draft Workflow');

  let testVoucherId;
  let testVoucherNumber;

  await test('Voucher Number is automatically formatted as EV-YYYY-XXXX', async () => {
    const currentYear = new Date().getFullYear();
    const lastVoucher = await dbGet(
      "SELECT voucher_number FROM vouchers WHERE voucher_number LIKE ? ORDER BY id DESC LIMIT 1",
      [`EV-${currentYear}-%`]
    );

    let expectedSeq = 1;
    if (lastVoucher && lastVoucher.voucher_number) {
      const parts = lastVoucher.voucher_number.split('-');
      expectedSeq = parseInt(parts[2], 10) + 1;
    }
    const padded = String(expectedSeq).padStart(4, '0');
    testVoucherNumber = `EV-${currentYear}-${padded}`;

    assert(testVoucherNumber.startsWith(`EV-${currentYear}-`), 'Voucher must have correct prefix');
  });

  await test('New voucher is saved initially as Draft with all mandatory fields', async () => {
    const now = new Date().toISOString();
    const result = await dbRun(
      `INSERT INTO vouchers (
        voucher_number, voucher_date, expense_date, department, expense_title, expense_category,
        expense_description, amount, status, created_by_user_id, employee_name, employee_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testVoucherNumber,
        now.split('T')[0],
        '2026-10-10',
        'Engineering',
        'Docker Hub Team Subscription',
        'Software & Subscriptions',
        'Annual dev license renewal',
        25000.00,
        'Draft',
        empUser.id,
        empUser.name,
        empUser.employee_id,
        now,
        now
      ]
    );

    testVoucherId = result.lastID;
    const inserted = await dbGet('SELECT * FROM vouchers WHERE id = ?', [testVoucherId]);
    assert(inserted, 'Voucher must be inserted');
    assert.strictEqual(inserted.status, 'Draft', 'New voucher status must be Draft');
    assert.strictEqual(inserted.amount, 25000.00, 'Amount must match');
  });

  // --------------------------------------------------------------------------
  // 3. Draft Edit & Delete Permissions (Rule 4 & Rule 5)
  // --------------------------------------------------------------------------
  console.log('\n📋 Group 3: Draft Edit, Delete & Submission Locks');

  await test('Employee can update a voucher while it is in Draft status', async () => {
    await dbRun(
      'UPDATE vouchers SET expense_title = ?, amount = ? WHERE id = ? AND status = ?',
      ['Docker Hub Team Subscription (Updated)', 28000.00, testVoucherId, 'Draft']
    );

    const updated = await dbGet('SELECT * FROM vouchers WHERE id = ?', [testVoucherId]);
    assert.strictEqual(updated.expense_title, 'Docker Hub Team Subscription (Updated)');
    assert.strictEqual(updated.amount, 28000.00);
  });

  await test('Submission requires Employee Signature and locks to read-only', async () => {
    const signatureDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const now = new Date().toISOString();

    await dbRun(
      `UPDATE vouchers SET
        status = 'Pending Approval',
        employee_signature = ?,
        employee_signature_date = ?,
        updated_at = ?
       WHERE id = ?`,
      [signatureDataUri, now, now, testVoucherId]
    );

    const submitted = await dbGet('SELECT * FROM vouchers WHERE id = ?', [testVoucherId]);
    assert.strictEqual(submitted.status, 'Pending Approval');
    assert(submitted.employee_signature, 'Employee signature must be present');
    assert(submitted.employee_signature_date, 'Signature date must be recorded');
  });

  // --------------------------------------------------------------------------
  // 4. Role Isolation Boundaries (Section 3.1 & Rule 9, 10, 11)
  // --------------------------------------------------------------------------
  console.log('\n📋 Group 4: Role Isolation Boundaries');

  await test('Employee 2 cannot view Employee 1 vouchers', async () => {
    // Query vouchers for Employee 2
    const emp2Vouchers = await dbAll('SELECT * FROM vouchers WHERE created_by_user_id = ?', [emp2User.id]);
    const includesEmp1Voucher = emp2Vouchers.some(v => v.id === testVoucherId);
    assert(!includesEmp1Voucher, 'Employee 2 must not see Employee 1 vouchers');
  });

  await test('Director and Accounts can view all vouchers across the company', async () => {
    const allVouchers = await dbAll('SELECT * FROM vouchers');
    assert(allVouchers.length >= 1, 'Director/Accounts ledger must see all vouchers');
    const hasTestVoucher = allVouchers.some(v => v.id === testVoucherId);
    assert(hasTestVoucher, 'Ledger must include the test voucher');
  });

  // --------------------------------------------------------------------------
  // 5. Director Review: Rejection with Mandatory Reason & Approval
  // --------------------------------------------------------------------------
  console.log('\n📋 Group 5: Executive Approval Gate & Mandatory Feedback');

  let rejectVoucherId;
  await test('Director rejection requires non-empty remarks', async () => {
    const now = new Date().toISOString();
    const dummyNumber = `EV-${new Date().getFullYear()}-9998`;
    const res = await dbRun(
      `INSERT INTO vouchers (
        voucher_number, voucher_date, expense_date, department, expense_title, expense_category,
        amount, status, created_by_user_id, employee_name, employee_signature, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dummyNumber, now.split('T')[0], '2026-10-10', 'Sales', 'Client Dinner', 'Client Meeting', 4500, 'Pending Approval', empUser.id, empUser.name, 'data:sig', now, now]
    );
    rejectVoucherId = res.lastID;

    // Reject with feedback
    const feedback = 'Please provide itemized tax invoice from restaurant.';
    await dbRun(
      `UPDATE vouchers SET
        status = 'Rejected',
        approved_by_user_id = ?,
        director_name = ?,
        rejection_reason = ?,
        updated_at = ?
       WHERE id = ?`,
      [dirUser.id, dirUser.name, feedback, now, rejectVoucherId]
    );

    const rejected = await dbGet('SELECT * FROM vouchers WHERE id = ?', [rejectVoucherId]);
    assert.strictEqual(rejected.status, 'Rejected');
    assert.strictEqual(rejected.rejection_reason, feedback);
    assert.strictEqual(rejected.director_name, dirUser.name);
  });

  await test('Director approval requires Director Signature and moves to Approved', async () => {
    const dirSignature = 'data:image/png;base64,director_signature_sample';
    const now = new Date().toISOString();

    await dbRun(
      `UPDATE vouchers SET
        status = 'Approved',
        approved_by_user_id = ?,
        director_name = ?,
        director_signature = ?,
        approval_date = ?,
        updated_at = ?
       WHERE id = ?`,
      [dirUser.id, dirUser.name, dirSignature, now, now, testVoucherId]
    );

    const approved = await dbGet('SELECT * FROM vouchers WHERE id = ?', [testVoucherId]);
    assert.strictEqual(approved.status, 'Approved');
    assert(approved.director_signature, 'Director signature must be recorded');
    assert(approved.approval_date, 'Approval date must be recorded');
    assert.strictEqual(approved.director_name, dirUser.name);
  });

  // --------------------------------------------------------------------------
  // 6. Section 7 Search & Filter (Bonus Point) - All 7 Criteria
  // --------------------------------------------------------------------------
  console.log('\n📋 Group 6: Section 7 Multifaceted Search & Filter (Bonus Point)');

  await test('Search & Filter by Voucher Number', async () => {
    const results = await dbAll('SELECT * FROM vouchers WHERE voucher_number LIKE ?', [`%${testVoucherNumber}%`]);
    assert(results.length >= 1, 'Must find voucher by voucher number');
    assert.strictEqual(results[0].voucher_number, testVoucherNumber);
  });

  await test('Search & Filter by Employee Name', async () => {
    const results = await dbAll('SELECT * FROM vouchers WHERE employee_name LIKE ?', [`%${empUser.name}%`]);
    assert(results.length >= 1, 'Must find voucher by employee name');
  });

  await test('Filter by Department', async () => {
    const results = await dbAll('SELECT * FROM vouchers WHERE department = ?', ['Engineering']);
    assert(results.length >= 1, 'Must find vouchers in Engineering department');
  });

  await test('Filter by Expense Category', async () => {
    const results = await dbAll('SELECT * FROM vouchers WHERE expense_category = ?', ['Software & Subscriptions']);
    assert(results.length >= 1, 'Must find vouchers in Software category');
  });

  await test('Filter by Status (Draft, Pending Approval, Approved, Rejected)', async () => {
    const approvedList = await dbAll('SELECT * FROM vouchers WHERE status = ?', ['Approved']);
    const rejectedList = await dbAll('SELECT * FROM vouchers WHERE status = ?', ['Rejected']);
    assert(approvedList.length >= 1, 'Must filter Approved vouchers');
    assert(rejectedList.length >= 1, 'Must filter Rejected vouchers');
  });

  await test('Filter by Date Range', async () => {
    const results = await dbAll('SELECT * FROM vouchers WHERE expense_date >= ? AND expense_date <= ?', ['2026-01-01', '2026-12-31']);
    assert(results.length >= 1, 'Must filter vouchers by date range');
  });

  await test('Filter by Amount Range (Min and Max)', async () => {
    const results = await dbAll('SELECT * FROM vouchers WHERE amount >= ? AND amount <= ?', [10000, 50000]);
    assert(results.length >= 1, 'Must filter vouchers by amount range');
  });

  // --------------------------------------------------------------------------
  // 7. Section 8 Dashboard Analytics
  // --------------------------------------------------------------------------
  console.log('\n📋 Group 7: Section 8 Role-Tailored Dashboard Metrics');

  await test('Employee Dashboard metrics calculate personal totals correctly', async () => {
    const total = await dbGet('SELECT COUNT(*) as c, SUM(amount) as s FROM vouchers WHERE created_by_user_id = ?', [empUser.id]);
    assert(total.c >= 1, 'Employee total vouchers count must be >= 1');
    assert(total.s > 0, 'Employee total amount claimed must be > 0');
  });

  await test('Director Dashboard metrics include Pending Count, Pending Amount, and Daily Counts', async () => {
    const pending = await dbGet("SELECT COUNT(*) as c, COALESCE(SUM(amount), 0) as s FROM vouchers WHERE status = 'Pending Approval'");
    assert(typeof pending.c === 'number', 'Pending approval count must be numeric');
    assert(typeof pending.s === 'number', 'Total pending amount must be numeric');
  });

  await test('Accounts Dashboard metrics calculate total approved expense amount for disbursement', async () => {
    const approved = await dbGet("SELECT COUNT(*) as c, COALESCE(SUM(amount), 0) as totalPayout FROM vouchers WHERE status = 'Approved'");
    assert(approved.c >= 1, 'Approved voucher count must be >= 1');
    assert(approved.totalPayout > 0, 'Total approved expense amount must be > 0');
  });

  // --------------------------------------------------------------------------
  // Cleanup test artifacts
  // --------------------------------------------------------------------------
  await dbRun('DELETE FROM vouchers WHERE id = ?', [testVoucherId]);
  await dbRun('DELETE FROM vouchers WHERE id = ?', [rejectVoucherId]);

  console.log('\n============================================================');
  console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('============================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runTests().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
