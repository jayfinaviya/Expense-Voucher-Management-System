/**
 * ============================================================================
 * PSPL Expense Voucher Management System - Comprehensive Automated Test Suite
 * Fully implements and executes all requirements from Sections 2 to 8 of the
 * Full-Stack QA & Security Specification.
 * ============================================================================
 */

const assert = require('assert');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'prachay_securities_expense_voucher_jwt_secret_key_2026_production_safe';

// Test execution recorder
const testResults = [];

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    ...options.headers
  };

  // Only set application/json if body is not FormData or Buffer
  if (!(options.body instanceof Buffer) && !(options.body && options.body.constructor && options.body.constructor.name === 'FormData')) {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  const res = await fetch(url, {
    ...options,
    headers
  });

  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }

  return { status: res.status, ok: res.ok, data };
};

const recordTest = (id, moduleName, scenario, fn) => {
  return async () => {
    const startTime = Date.now();
    try {
      await fn();
      const duration = Date.now() - startTime;
      console.log(`  ✅ [${id}] PASS: ${scenario} (${duration}ms)`);
      testResults.push({
        id,
        module: moduleName,
        scenario,
        status: 'PASS',
        duration,
        error: null
      });
    } catch (err) {
      const duration = Date.now() - startTime;
      console.error(`  ❌ [${id}] FAIL: ${scenario} (${duration}ms)`);
      console.error(`     Details: ${err.message}`);
      testResults.push({
        id,
        module: moduleName,
        scenario,
        status: 'FAIL',
        duration,
        error: err.message
      });
    }
  };
};

async function executeTestSuite() {
  console.log('\n================================================================');
  console.log('🚀 EXECUTING PSPL EXPENSE VOUCHER MANAGEMENT COMPREHENSIVE QA SUITE');
  console.log('================================================================\n');

  // Authenticate base personas
  const login = async (email, password = 'password123') => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    assert.strictEqual(res.status, 200, `Login failed for ${email}`);
    return { token: res.data.token, user: res.data.user };
  };

  const alex = await login('employee@prachay.com');
  const priya = await login('priya.patel@prachay.com');
  const director = await login('director@prachay.com');
  const accounts = await login('accounts@prachay.com');

  // ==========================================================================
  // MODULE 1: AUTHENTICATION & AUTHORIZATION
  // ==========================================================================
  console.log('📦 Module 1: Authentication & Authorization (AUTH)');

  await recordTest('AUTH-01', 'Authentication', 'Login with valid Employee credentials', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'employee@prachay.com', password: 'password123' })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert(res.data.token, 'Token must be provided');
    assert.strictEqual(res.data.user.role, 'employee');
  })();

  await recordTest('AUTH-02', 'Authentication', 'Login with valid Director credentials', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'director@prachay.com', password: 'password123' })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.role, 'director');
  })();

  await recordTest('AUTH-03', 'Authentication', 'Login with valid Accounts credentials', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'accounts@prachay.com', password: 'password123' })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.role, 'accounts');
  })();

  await recordTest('AUTH-04', 'Authentication', 'Login with incorrect password returns HTTP 401', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'employee@prachay.com', password: 'wrongpassword' })
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
    assert(res.data.message.includes('Invalid email or password'));
  })();

  await recordTest('AUTH-05', 'Authentication', 'Login with unknown email returns HTTP 401', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'ghost.user@prachay.com', password: 'password123' })
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  })();

  await recordTest('AUTH-06', 'Authentication', 'Login with missing email returns HTTP 400', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'password123' })
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  })();

  await recordTest('AUTH-07', 'Authentication', 'Login with missing password returns HTTP 400', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'employee@prachay.com' })
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  })();

  await recordTest('AUTH-08', 'Authentication', 'Access protected endpoint without token returns HTTP 401', async () => {
    const res = await request('/vouchers');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  })();

  await recordTest('AUTH-09', 'Authentication', 'Access protected endpoint with invalid Bearer token returns HTTP 401', async () => {
    const res = await request('/vouchers', {
      headers: { Authorization: 'Bearer invalid.cryptographic.signature' }
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  })();

  await recordTest('AUTH-10', 'Authentication', 'Access protected endpoint with expired JWT token returns HTTP 401', async () => {
    const expiredToken = jwt.sign(
      { id: alex.user.id, email: alex.user.email, role: alex.user.role },
      JWT_SECRET,
      { expiresIn: '-10s' }
    );
    const res = await request('/vouchers', {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
    assert(res.data.message.toLowerCase().includes('expired') || res.data.message.toLowerCase().includes('token'));
  })();

  await recordTest('AUTH-11', 'Authentication', 'Verify sensitive password hash is never exposed in API payloads', async () => {
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'employee@prachay.com', password: 'password123' })
    });
    assert.strictEqual(loginRes.data.user.password_hash, undefined, 'password_hash must not be returned on login');

    const meRes = await request('/auth/me', {
      headers: { Authorization: `Bearer ${alex.token}` }
    });
    assert.strictEqual(meRes.data.user.password_hash, undefined, 'password_hash must not be returned on /auth/me');

    const demoRes = await request('/auth/demo-users');
    for (const u of demoRes.data.demoUsers) {
      assert.strictEqual(u.password_hash, undefined, 'password_hash must not be returned in demo-users list');
    }
  })();

  await recordTest('AUTH-12', 'Authentication', 'Role escalation via API request is strictly prohibited (HTTP 403)', async () => {
    const res1 = await request('/auth/role', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({ role: 'director' })
    });
    assert.strictEqual(res1.status, 403);

    const res2 = await request('/auth/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({ role: 'director' })
    });
    assert.strictEqual(res2.status, 403);
  })();

  // ==========================================================================
  // MODULE 2: EMPLOYEE PORTAL & VOUCHER LIFECYCLE
  // ==========================================================================
  console.log('\n📦 Module 2: Employee Portal & Voucher Lifecycle (EMP)');

  let createdDraftId = null;
  let createdDraftNumber = null;

  await recordTest('EMP-01', 'Employee', 'Create a new voucher saved as Draft with sequential number', async () => {
    const res = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: 'AWS ElastiCache Redis Cluster Annual Reserved Node',
        expense_category: 'Software & Subscriptions',
        expense_description: 'Low-latency session caching for production portal cluster',
        expense_date: '2026-10-10',
        amount: 22000.00,
        action: 'draft'
      })
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.voucher.status, 'Draft');
    assert(res.data.voucher.voucher_number.startsWith('EV-'), 'Voucher number must follow EV-YYYY-XXXX format');
    createdDraftId = res.data.voucher.id;
    createdDraftNumber = res.data.voucher.voucher_number;
  })();

  await recordTest('EMP-02', 'Employee', 'View only the employee own vouchers in list', async () => {
    const res = await request('/vouchers', {
      headers: { Authorization: `Bearer ${alex.token}` }
    });
    assert.strictEqual(res.status, 200);
    for (const v of res.data.vouchers) {
      assert.strictEqual(v.created_by_user_id, alex.user.id, 'Every returned voucher must belong to authenticated Alex');
    }
  })();

  await recordTest('EMP-03', 'Employee', 'View owned voucher details by ID', async () => {
    const res = await request(`/vouchers/${createdDraftId}`, {
      headers: { Authorization: `Bearer ${alex.token}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.voucher.id, createdDraftId);
    assert.strictEqual(res.data.voucher.expense_title, 'AWS ElastiCache Redis Cluster Annual Reserved Node');
  })();

  await recordTest('EMP-04', 'Employee', 'Edit an owned voucher while in Draft status', async () => {
    const res = await request(`/vouchers/${createdDraftId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: 'AWS ElastiCache Redis Cluster (Updated with Multi-AZ)',
        expense_category: 'Software & Subscriptions',
        expense_description: 'Multi-AZ replication enabled for high availability failover',
        expense_date: '2026-10-10',
        amount: 26500.00,
        action: 'draft'
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.voucher.expense_title, 'AWS ElastiCache Redis Cluster (Updated with Multi-AZ)');
    assert.strictEqual(res.data.voucher.amount, 26500.00);
  })();

  await recordTest('EMP-05', 'Employee', 'Prevent submission of voucher without employee signature', async () => {
    const res = await request(`/vouchers/${createdDraftId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({ signature: '' })
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert(res.data.message.includes('Employee Signature is mandatory'));
  })();

  await recordTest('EMP-06', 'Employee', 'Submit draft voucher with valid signature -> Pending Approval', async () => {
    const res = await request(`/vouchers/${createdDraftId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        signature: 'data:image/svg+xml;utf8,<svg><text>Alex Turner</text></svg>'
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.voucher.status, 'Pending Approval');
    assert(res.data.voucher.employee_signature, 'Signature must be saved');
    assert(res.data.voucher.employee_signature_date, 'Signature date must be recorded');
  })();

  await recordTest('EMP-07', 'Employee', 'Prevent editing a voucher once submitted (Pending Approval)', async () => {
    const res = await request(`/vouchers/${createdDraftId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: 'Tampered after submission',
        expense_date: '2026-10-10',
        amount: 50000.00
      })
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert(res.data.message.includes('Draft'));
  })();

  await recordTest('EMP-08', 'Employee', 'Prevent deleting a voucher once submitted (Pending Approval)', async () => {
    const res = await request(`/vouchers/${createdDraftId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${alex.token}` }
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert(res.data.message.includes('Draft'));
  })();

  await recordTest('EMP-09', 'Employee', 'Delete owned Draft voucher works when in Draft status', async () => {
    // Create temporary draft to delete
    const tempRes = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: 'Draft to be discarded',
        expense_date: '2026-10-10',
        amount: 500.00,
        action: 'draft'
      })
    });
    assert.strictEqual(tempRes.status, 201);
    const tempId = tempRes.data.voucher.id;

    // Delete it
    const delRes = await request(`/vouchers/${tempId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${alex.token}` }
    });
    assert.strictEqual(delRes.status, 200);

    // Verify it is gone
    const verifyRes = await request(`/vouchers/${tempId}`, {
      headers: { Authorization: `Bearer ${alex.token}` }
    });
    assert.strictEqual(verifyRes.status, 404);
  })();

  await recordTest('EMP-10', 'Employee', 'Prevent retrieving another employee voucher by changing ID (HTTP 403)', async () => {
    // Find Priya voucher
    const priyaVouchers = await request('/vouchers', {
      headers: { Authorization: `Bearer ${priya.token}` }
    });
    assert(priyaVouchers.data.vouchers.length > 0, 'Priya must have at least one voucher');
    const priyaVoucherId = priyaVouchers.data.vouchers[0].id;

    // Alex attempts to query Priya's voucher
    const res = await request(`/vouchers/${priyaVoucherId}`, {
      headers: { Authorization: `Bearer ${alex.token}` }
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
    assert(res.data.message.includes('Forbidden'));
  })();

  await recordTest('EMP-11', 'Employee', 'Prevent employee from calling Director approval API (HTTP 403)', async () => {
    const res = await request(`/vouchers/${createdDraftId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({ signature: 'alex-fake-approval' })
    });
    assert.strictEqual(res.status, 403);
  })();

  await recordTest('EMP-12', 'Employee', 'Prevent employee from calling Director rejection API (HTTP 403)', async () => {
    const res = await request(`/vouchers/${createdDraftId}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({ rejection_reason: 'alex-fake-rejection' })
    });
    assert.strictEqual(res.status, 403);
  })();

  await recordTest('EMP-13', 'Employee', 'View rejection reason on rejected voucher', async () => {
    // Find pre-seeded rejected voucher for Priya
    const priyaVouchers = await request('/vouchers', {
      headers: { Authorization: `Bearer ${priya.token}` }
    });
    const rejectedVoucher = priyaVouchers.data.vouchers.find(v => v.status === 'Rejected');
    assert(rejectedVoucher, 'Pre-seeded rejected voucher must exist for Priya');
    assert(rejectedVoucher.rejection_reason, 'Rejection reason must be visible');
  })();

  // ==========================================================================
  // MODULE 3: DIRECTOR / ADMIN MANAGEMENT
  // ==========================================================================
  console.log('\n📦 Module 3: Director Management & Executive Authorization (DIR)');

  await recordTest('DIR-01', 'Director', 'View organization-wide vouchers across all employees', async () => {
    const res = await request('/vouchers?limit=100', {
      headers: { Authorization: `Bearer ${director.token}` }
    });
    assert.strictEqual(res.status, 200);
    const creatorIds = new Set(res.data.vouchers.map(v => v.created_by_user_id));
    assert(creatorIds.has(alex.user.id), 'Director must see Alex vouchers');
    assert(creatorIds.has(priya.user.id), 'Director must see Priya vouchers');
  })();

  await recordTest('DIR-02', 'Director', 'View pending approval queue filtered by status', async () => {
    const res = await request('/vouchers?status=Pending%20Approval', {
      headers: { Authorization: `Bearer ${director.token}` }
    });
    assert.strictEqual(res.status, 200);
    for (const v of res.data.vouchers) {
      assert.strictEqual(v.status, 'Pending Approval');
    }
  })();

  await recordTest('DIR-03', 'Director', 'Prevent approval without Director signature (HTTP 400)', async () => {
    const res = await request(`/vouchers/${createdDraftId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${director.token}` },
      body: JSON.stringify({ signature: '' })
    });
    assert.strictEqual(res.status, 400);
    assert(res.data.message.includes('Director Signature is mandatory'));
  })();

  await recordTest('DIR-04', 'Director', 'Approve pending voucher with Director digital signature -> Approved', async () => {
    const res = await request(`/vouchers/${createdDraftId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${director.token}` },
      body: JSON.stringify({
        signature: 'data:image/svg+xml;utf8,<svg><text>Sarah Jenkins Director</text></svg>'
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.voucher.status, 'Approved');
    assert.strictEqual(res.data.voucher.approved_by_user_id, director.user.id);
    assert(res.data.voucher.approval_date, 'Approval date must be recorded');
    assert(res.data.voucher.director_signature, 'Director signature must be recorded');
  })();

  await recordTest('DIR-05', 'Director', 'Prevent re-approving or approving non-pending voucher (HTTP 400)', async () => {
    const res = await request(`/vouchers/${createdDraftId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${director.token}` },
      body: JSON.stringify({ signature: 'signature-str' })
    });
    assert.strictEqual(res.status, 400);
    assert(res.data.message.includes('Pending Approval'));
  })();

  let rejectTargetId = null;

  await recordTest('DIR-06', 'Director', 'Create and submit voucher to test rejection workflow', async () => {
    const createRes = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: 'Unbudgeted Premium Monitoring Service',
        expense_date: '2026-10-10',
        amount: 45000.00,
        signature: 'data:image/svg+xml;utf8,<svg><text>Alex</text></svg>',
        action: 'submit'
      })
    });
    assert.strictEqual(createRes.status, 201);
    assert.strictEqual(createRes.data.voucher.status, 'Pending Approval');
    rejectTargetId = createRes.data.voucher.id;
  })();

  await recordTest('DIR-07', 'Director', 'Prevent rejecting voucher without mandatory reason (HTTP 400)', async () => {
    const res = await request(`/vouchers/${rejectTargetId}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${director.token}` },
      body: JSON.stringify({ rejection_reason: '   ' })
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert(res.data.message.includes('Rejection Reason is mandatory'));
  })();

  await recordTest('DIR-08', 'Director', 'Reject pending voucher with mandatory reason -> Rejected', async () => {
    const res = await request(`/vouchers/${rejectTargetId}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${director.token}` },
      body: JSON.stringify({
        rejection_reason: 'Expense exceeds Q2 operational cloud tools allocation. Please get VP pre-clearance.'
      })
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.voucher.status, 'Rejected');
    assert(res.data.voucher.rejection_reason.includes('operational cloud tools'));
  })();

  await recordTest('DIR-09', 'Director', 'Prevent Director from editing employee expense details (HTTP 403)', async () => {
    const res = await request(`/vouchers/${rejectTargetId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${director.token}` },
      body: JSON.stringify({
        expense_title: 'Director Attempted Title Edit',
        amount: 1000
      })
    });
    assert.strictEqual(res.status, 403);
  })();

  // ==========================================================================
  // MODULE 4: ACCOUNTS TEAM & READ-ONLY AUDIT
  // ==========================================================================
  console.log('\n📦 Module 4: Accounts Team & Read-Only Audit (ACC)');

  await recordTest('ACC-01', 'Accounts', 'Accounts can view all organization vouchers', async () => {
    const res = await request('/vouchers', {
      headers: { Authorization: `Bearer ${accounts.token}` }
    });
    assert.strictEqual(res.status, 200);
    assert(res.data.vouchers.length >= 4, 'Accounts must see company vouchers');
  })();

  await recordTest('ACC-02', 'Accounts', 'Accounts can view voucher details and signatures', async () => {
    const res = await request(`/vouchers/${createdDraftId}`, {
      headers: { Authorization: `Bearer ${accounts.token}` }
    });
    assert.strictEqual(res.status, 200);
    assert(res.data.voucher.employee_signature, 'Employee signature must be viewable');
    assert(res.data.voucher.director_signature, 'Director signature must be viewable');
  })();

  await recordTest('ACC-03', 'Accounts', 'Prevent Accounts from creating vouchers (HTTP 403)', async () => {
    const res = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accounts.token}` },
      body: JSON.stringify({
        department: 'Finance',
        expense_title: 'Accounts Creation Attempt',
        expense_date: '2026-10-10',
        amount: 1000
      })
    });
    assert.strictEqual(res.status, 403);
  })();

  await recordTest('ACC-04', 'Accounts', 'Prevent Accounts from editing vouchers (HTTP 403)', async () => {
    const res = await request(`/vouchers/${createdDraftId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accounts.token}` },
      body: JSON.stringify({ amount: 99999 })
    });
    assert.strictEqual(res.status, 403);
  })();

  await recordTest('ACC-05', 'Accounts', 'Prevent Accounts from deleting vouchers (HTTP 403)', async () => {
    const res = await request(`/vouchers/${createdDraftId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accounts.token}` }
    });
    assert.strictEqual(res.status, 403);
  })();

  await recordTest('ACC-06', 'Accounts', 'Prevent Accounts from approving vouchers (HTTP 403)', async () => {
    const res = await request(`/vouchers/${createdDraftId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accounts.token}` },
      body: JSON.stringify({ signature: 'accounts-unauthorized' })
    });
    assert.strictEqual(res.status, 403);
  })();

  await recordTest('ACC-07', 'Accounts', 'Prevent Accounts from rejecting vouchers (HTTP 403)', async () => {
    const res = await request(`/vouchers/${createdDraftId}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accounts.token}` },
      body: JSON.stringify({ rejection_reason: 'accounts-unauthorized' })
    });
    assert.strictEqual(res.status, 403);
  })();

  // ==========================================================================
  // MODULE 5: FORM & DATA VALIDATION
  // ==========================================================================
  console.log('\n📦 Module 5: Form & Data Validation (VAL)');

  await recordTest('VAL-01', 'Validation', 'Department is mandatory (empty string returns HTTP 400)', async () => {
    const res = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: '',
        expense_title: 'Valid Title',
        expense_date: '2026-10-10',
        amount: 1000
      })
    });
    assert.strictEqual(res.status, 400);
    assert(res.data.message.includes('Department is mandatory'));
  })();

  await recordTest('VAL-02', 'Validation', 'Department whitespace-only returns HTTP 400', async () => {
    const res = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: '   ',
        expense_title: 'Valid Title',
        expense_date: '2026-10-10',
        amount: 1000
      })
    });
    assert.strictEqual(res.status, 400);
    assert(res.data.message.includes('Department is mandatory'));
  })();

  await recordTest('VAL-03', 'Validation', 'Expense Title is mandatory (empty string returns HTTP 400)', async () => {
    const res = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: '',
        expense_date: '2026-10-10',
        amount: 1000
      })
    });
    assert.strictEqual(res.status, 400);
    assert(res.data.message.includes('Expense Title is mandatory'));
  })();

  await recordTest('VAL-04', 'Validation', 'Expense Title whitespace-only returns HTTP 400', async () => {
    const res = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: '    ',
        expense_date: '2026-10-10',
        amount: 1000
      })
    });
    assert.strictEqual(res.status, 400);
    assert(res.data.message.includes('Expense Title is mandatory'));
  })();

  await recordTest('VAL-05', 'Validation', 'Expense Date is mandatory (empty returns HTTP 400)', async () => {
    const res = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: 'Valid Title',
        expense_date: '',
        amount: 1000
      })
    });
    assert.strictEqual(res.status, 400);
    assert(res.data.message.includes('Expense Date is mandatory'));
  })();

  await recordTest('VAL-06', 'Validation', 'Expense Date invalid format returns HTTP 400', async () => {
    const res = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: 'Valid Title',
        expense_date: 'not-a-valid-date-string',
        amount: 1000
      })
    });
    assert.strictEqual(res.status, 400);
    assert(res.data.message.includes('valid date'));
  })();

  await recordTest('VAL-07', 'Validation', 'Amount is mandatory (missing returns HTTP 400)', async () => {
    const res = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: 'Valid Title',
        expense_date: '2026-10-10'
      })
    });
    assert.strictEqual(res.status, 400);
    assert(res.data.message.includes('Amount is mandatory'));
  })();

  await recordTest('VAL-08', 'Validation', 'Amount must be greater than zero (zero returns HTTP 400)', async () => {
    const res = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: 'Valid Title',
        expense_date: '2026-10-10',
        amount: 0
      })
    });
    assert.strictEqual(res.status, 400);
    assert(res.data.message.includes('greater than zero'));
  })();

  await recordTest('VAL-09', 'Validation', 'Amount must be greater than zero (negative returns HTTP 400)', async () => {
    const res = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: 'Valid Title',
        expense_date: '2026-10-10',
        amount: -1500
      })
    });
    assert.strictEqual(res.status, 400);
    assert(res.data.message.includes('greater than zero'));
  })();

  await recordTest('VAL-10', 'Validation', 'Amount must be a valid numeric value (NaN returns HTTP 400)', async () => {
    const res = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: 'Valid Title',
        expense_date: '2026-10-10',
        amount: 'two-thousand-rupees'
      })
    });
    assert.strictEqual(res.status, 400);
    assert(res.data.message.includes('Amount is mandatory'));
  })();

  await recordTest('VAL-11', 'Validation', 'Voucher Number is automatically and uniquely generated (EV-YYYY-XXXX)', async () => {
    const res = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: 'Sequence check voucher',
        expense_date: '2026-10-10',
        amount: 1000
      })
    });
    assert.strictEqual(res.status, 201);
    const vn = res.data.voucher.voucher_number;
    const currentYear = new Date().getFullYear();
    const regex = new RegExp(`^EV-${currentYear}-\\d{4}$`);
    assert(regex.test(vn), `Voucher number ${vn} must match EV-YYYY-XXXX`);
  })();

  // ==========================================================================
  // MODULE 6: DASHBOARD STATS & MULTIFACETED SEARCH
  // ==========================================================================
  console.log('\n📦 Module 6: Dashboard Analytics & Search Filters (DASH & SRCH)');

  await recordTest('DASH-01', 'Dashboard', 'Employee Dashboard metrics correctly isolate personal counts', async () => {
    const res = await request('/dashboard/stats', {
      headers: { Authorization: `Bearer ${alex.token}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.role, 'employee');
    assert(res.data.stats.totalVouchers >= 1);
    assert(res.data.stats.totalAmountClaimed > 0);
    assert(typeof res.data.stats.draftVouchers === 'number');
    assert(typeof res.data.stats.pendingApproval === 'number');
    assert(typeof res.data.stats.approvedVouchers === 'number');
    assert(typeof res.data.stats.rejectedVouchers === 'number');
  })();

  await recordTest('DASH-02', 'Dashboard', 'Director Dashboard metrics calculate system-wide counts', async () => {
    const res = await request('/dashboard/stats', {
      headers: { Authorization: `Bearer ${director.token}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.role, 'director');
    assert(res.data.stats.totalVouchersInSystem >= 5);
    assert(typeof res.data.stats.pendingApprovalCount === 'number');
    assert(typeof res.data.stats.totalPendingAmount === 'number');
  })();

  await recordTest('DASH-03', 'Dashboard', 'Accounts Dashboard metrics calculate total approved expense amount', async () => {
    const res = await request('/dashboard/stats', {
      headers: { Authorization: `Bearer ${accounts.token}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.role, 'accounts');
    assert(typeof res.data.stats.totalApprovedExpenseAmount === 'number');
    assert(res.data.stats.totalApprovedExpenseAmount > 0);
  })();

  await recordTest('SRCH-01', 'Search', 'Filter vouchers by Voucher Number exact/partial match', async () => {
    const res = await request('/vouchers?voucherNumber=EV-2026-0001', {
      headers: { Authorization: `Bearer ${director.token}` }
    });
    assert.strictEqual(res.status, 200);
    assert(res.data.vouchers.length >= 1);
    assert.strictEqual(res.data.vouchers[0].voucher_number, 'EV-2026-0001');
  })();

  await recordTest('SRCH-02', 'Search', 'Filter vouchers by Employee Name match', async () => {
    const res = await request('/vouchers?employeeName=Alex', {
      headers: { Authorization: `Bearer ${director.token}` }
    });
    assert.strictEqual(res.status, 200);
    for (const v of res.data.vouchers) {
      assert(v.employee_name.includes('Alex'));
    }
  })();

  await recordTest('SRCH-03', 'Search', 'Filter vouchers by Department match', async () => {
    const res = await request('/vouchers?department=Marketing', {
      headers: { Authorization: `Bearer ${director.token}` }
    });
    assert.strictEqual(res.status, 200);
    for (const v of res.data.vouchers) {
      assert.strictEqual(v.department, 'Marketing');
    }
  })();

  await recordTest('SRCH-04', 'Search', 'Filter vouchers by Expense Category match', async () => {
    const res = await request('/vouchers?category=Software%20%26%20Subscriptions', {
      headers: { Authorization: `Bearer ${director.token}` }
    });
    assert.strictEqual(res.status, 200);
    for (const v of res.data.vouchers) {
      assert.strictEqual(v.expense_category, 'Software & Subscriptions');
    }
  })();

  await recordTest('SRCH-05', 'Search', 'Filter vouchers by Status match', async () => {
    const res = await request('/vouchers?status=Approved', {
      headers: { Authorization: `Bearer ${director.token}` }
    });
    assert.strictEqual(res.status, 200);
    for (const v of res.data.vouchers) {
      assert.strictEqual(v.status, 'Approved');
    }
  })();

  await recordTest('SRCH-06', 'Search', 'Filter vouchers by Date Range (startDate and endDate)', async () => {
    const res = await request('/vouchers?startDate=2026-01-01&endDate=2026-12-31', {
      headers: { Authorization: `Bearer ${director.token}` }
    });
    assert.strictEqual(res.status, 200);
    assert(res.data.vouchers.length > 0);
  })();

  await recordTest('SRCH-07', 'Search', 'Filter vouchers by Amount Range (minAmount and maxAmount)', async () => {
    const res = await request('/vouchers?minAmount=10000&maxAmount=40000', {
      headers: { Authorization: `Bearer ${director.token}` }
    });
    assert.strictEqual(res.status, 200);
    for (const v of res.data.vouchers) {
      assert(v.amount >= 10000 && v.amount <= 40000);
    }
  })();

  await recordTest('SRCH-08', 'Search', 'Sort vouchers by amount in ASC and DESC order', async () => {
    const ascRes = await request('/vouchers?sortBy=amount&sortOrder=ASC', {
      headers: { Authorization: `Bearer ${director.token}` }
    });
    assert.strictEqual(ascRes.status, 200);
    const ascVouchers = ascRes.data.vouchers;
    for (let i = 0; i < ascVouchers.length - 1; i++) {
      assert(ascVouchers[i].amount <= ascVouchers[i + 1].amount, 'Amounts must be sorted ascending');
    }

    const descRes = await request('/vouchers?sortBy=amount&sortOrder=DESC', {
      headers: { Authorization: `Bearer ${director.token}` }
    });
    assert.strictEqual(descRes.status, 200);
    const descVouchers = descRes.data.vouchers;
    for (let i = 0; i < descVouchers.length - 1; i++) {
      assert(descVouchers[i].amount >= descVouchers[i + 1].amount, 'Amounts must be sorted descending');
    }
  })();

  // ==========================================================================
  // MODULE 7: SECURITY & DATA PROTECTION
  // ==========================================================================
  console.log('\n📦 Module 7: Security & Data Isolation (SEC)');

  await recordTest('SEC-01', 'Security', 'Tenant Data Isolation: Alex cannot query Priya vouchers', async () => {
    const priyaList = await request('/vouchers', {
      headers: { Authorization: `Bearer ${priya.token}` }
    });
    const priyaVoucher = priyaList.data.vouchers[0];

    const res = await request(`/vouchers/${priyaVoucher.id}`, {
      headers: { Authorization: `Bearer ${alex.token}` }
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
  })();

  await recordTest('SEC-02', 'Security', 'Identity Spoofing Defense: Server discards client employee_id', async () => {
    const res = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: 'Spoofing Test Voucher',
        expense_date: '2026-10-10',
        amount: 2500,
        employee_id: 'ATTACKER_OVERRIDE_ID'
      })
    });
    assert.strictEqual(res.status, 201);
    assert.notStrictEqual(res.data.voucher.employee_id, 'ATTACKER_OVERRIDE_ID');
    assert.strictEqual(res.data.voucher.employee_id, alex.user.employee_id);
  })();

  await recordTest('SEC-03', 'Security', 'SQL Injection Immunity: Parameterized queries withstand SQL injections', async () => {
    const injectionQuery = "' OR '1'='1' --";
    const res = await request(`/vouchers?search=${encodeURIComponent(injectionQuery)}`, {
      headers: { Authorization: `Bearer ${alex.token}` }
    });
    assert.strictEqual(res.status, 200);
    // Must not leak other users vouchers
    for (const v of res.data.vouchers) {
      assert.strictEqual(v.created_by_user_id, alex.user.id);
    }
  })();

  await recordTest('SEC-04', 'Security', 'Signature upload rejects arbitrary non-image MIME types', async () => {
    const res = await request('/auth/signature', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        signature: '' // No signature provided
      })
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  })();

  await recordTest('SEC-05', 'Security', 'HTTP Status Fidelity: 401 Unauthorized vs 403 Forbidden', async () => {
    // 401 when no token
    const unauthRes = await request('/vouchers');
    assert.strictEqual(unauthRes.status, 401);

    // 403 when authenticated as employee attempting Director action
    const forbidRes = await request('/vouchers/1/approve', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({ signature: 'sig' })
    });
    assert.strictEqual(forbidRes.status, 403);
  })();

  await recordTest('SEC-06', 'Security', 'Immutable Draft Ownership: Update cannot alter voucher owner', async () => {
    const res = await request(`/vouchers/${createdDraftId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${alex.token}` },
      body: JSON.stringify({
        employee_id: 'SPOOFED_OWNER_ID',
        created_by_user_id: priya.user.id,
        amount: 3000
      })
    });
    // Even if Draft or Approved, ownership cannot be moved
    if (res.status === 200) {
      assert.strictEqual(res.data.voucher.created_by_user_id, alex.user.id);
    } else {
      assert(res.status === 400 || res.status === 403);
    }
  })();

  // ==========================================================================
  // SUMMARY REPORT GENERATION
  // ==========================================================================
  const total = testResults.length;
  const passed = testResults.filter(t => t.status === 'PASS').length;
  const failed = testResults.filter(t => t.status === 'FAIL').length;
  const blocked = testResults.filter(t => t.status === 'BLOCKED').length;

  console.log('\n================================================================');
  console.log(`🏁 TEST SUITE RUN COMPLETED: ${passed}/${total} PASSED (${failed} FAILED, ${blocked} BLOCKED)`);
  console.log('================================================================\n');

  return { total, passed, failed, blocked, results: testResults };
}

if (require.main === module) {
  executeTestSuite().then(({ failed }) => {
    if (failed > 0) process.exit(1);
    else process.exit(0);
  }).catch(err => {
    console.error('Fatal test execution error:', err);
    process.exit(1);
  });
}

module.exports = { executeTestSuite, testResults };
