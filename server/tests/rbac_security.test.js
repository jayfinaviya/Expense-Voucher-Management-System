const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
};

const login = async (email, password = 'password123') => {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  assert.strictEqual(res.status, 200, `Login should succeed for ${email}`);
  assert.strictEqual(res.data.success, true);
  return { token: res.data.token, user: res.data.user };
};

async function runTests() {
  console.log('\n🔒 ============================================================');
  console.log('🛡️  EVMS ROLE-BASED ACCESS CONTROL & DATA ISOLATION TEST SUITE');
  console.log('🔒 ============================================================\n');

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

  // Pre-authenticate all personas
  const alexAuth = await login('employee@prachay.com');
  const priyaAuth = await login('priya.patel@prachay.com');
  const directorAuth = await login('director@prachay.com');
  const accountsAuth = await login('accounts@prachay.com');

  console.log('📋 Test Group 1: Employee Data Isolation (Scenarios 2, 5 & 9)');

  await test('Employee Alex sees ONLY their own expense claims', async () => {
    const res = await request('/vouchers', {
      headers: { Authorization: `Bearer ${alexAuth.token}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert(res.data.vouchers.length > 0, 'Alex should have vouchers');
    for (const v of res.data.vouchers) {
      assert.strictEqual(v.created_by_user_id, alexAuth.user.id, `Voucher ${v.voucher_number} must belong to Alex`);
    }
  });

  await test('Employee Priya sees ONLY their own expense claims', async () => {
    const res = await request('/vouchers', {
      headers: { Authorization: `Bearer ${priyaAuth.token}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert(res.data.vouchers.length > 0, 'Priya should have vouchers');
    for (const v of res.data.vouchers) {
      assert.strictEqual(v.created_by_user_id, priyaAuth.user.id, `Voucher ${v.voucher_number} must belong to Priya`);
    }
  });

  await test('Employee attempting to retrieve another employee voucher by ID returns HTTP 403 Forbidden', async () => {
    // Get Priya's first voucher ID
    const priyaVouchers = await request('/vouchers', {
      headers: { Authorization: `Bearer ${priyaAuth.token}` }
    });
    const priyaVoucher = priyaVouchers.data.vouchers[0];
    assert(priyaVoucher, 'Priya must have at least one voucher');

    // Alex attempts to fetch Priya's voucher by ID
    const res = await request(`/vouchers/${priyaVoucher.id}`, {
      headers: { Authorization: `Bearer ${alexAuth.token}` }
    });
    assert.strictEqual(res.status, 403, 'Must return HTTP 403 Forbidden');
    assert.strictEqual(res.data.success, false);
    assert(res.data.message.includes('Forbidden'), 'Message must indicate forbidden access');
  });

  await test('Employee attempting to update another employee voucher returns HTTP 403 Forbidden', async () => {
    const priyaVouchers = await request('/vouchers', {
      headers: { Authorization: `Bearer ${priyaAuth.token}` }
    });
    const priyaVoucher = priyaVouchers.data.vouchers[0];

    const res = await request(`/vouchers/${priyaVoucher.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${alexAuth.token}` },
      body: JSON.stringify({
        expense_title: 'Tampered Title',
        amount: 9999
      })
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
  });

  await test('Backend derives Employee ID strictly from authenticated session (never trusts frontend input)', async () => {
    const res = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexAuth.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: 'Security Probe Voucher',
        expense_date: '2026-10-11',
        amount: 1250,
        employee_id: 'HACKED-EMP-9999', // Attacker sends spoofed employee_id
        action: 'draft'
      })
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.voucher.employee_id, alexAuth.user.employee_id, 'Backend must use verified session employee_id');
    assert.notStrictEqual(res.data.voucher.employee_id, 'HACKED-EMP-9999', 'Frontend spoofed employee_id must be discarded');
    assert.strictEqual(res.data.voucher.created_by_user_id, alexAuth.user.id);
  });

  console.log('\n📋 Test Group 2: Employee API Boundary Protection (Scenarios 3, 4 & 6)');

  await test('Employee calling Director approval API returns HTTP 403 Forbidden', async () => {
    const res = await request('/vouchers/1/approve', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexAuth.token}` },
      body: JSON.stringify({ signature: 'fake-signature' })
    });
    assert.strictEqual(res.status, 403, 'Must return 403 Forbidden for approval attempt');
    assert.strictEqual(res.data.success, false);
  });

  await test('Employee calling Director rejection API returns HTTP 403 Forbidden', async () => {
    const res = await request('/vouchers/1/reject', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexAuth.token}` },
      body: JSON.stringify({ rejection_reason: 'Unauthorized rejection attempt' })
    });
    assert.strictEqual(res.status, 403, 'Must return 403 Forbidden for rejection attempt');
    assert.strictEqual(res.data.success, false);
  });

  await test('Employee attempting to change their role through an API request is blocked', async () => {
    // Attempt role elevation via /auth/role
    const res1 = await request('/auth/role', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexAuth.token}` },
      body: JSON.stringify({ role: 'director' })
    });
    assert.strictEqual(res1.status, 403, 'Must return 403 Forbidden on role modification');

    // Attempt role elevation via /auth/me
    const res2 = await request('/auth/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${alexAuth.token}` },
      body: JSON.stringify({ role: 'director' })
    });
    assert.strictEqual(res2.status, 403, 'Must return 403 Forbidden on profile role update');

    // Verify role in database remains unchanged
    const meRes = await request('/auth/me', {
      headers: { Authorization: `Bearer ${alexAuth.token}` }
    });
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.data.user.role, 'employee', 'Role must remain employee');
  });

  console.log('\n📋 Test Group 3: Director Organization-Wide Access (Scenario 7)');

  await test('Director login has organization-wide visibility across all employees', async () => {
    const res = await request('/vouchers?limit=100', {
      headers: { Authorization: `Bearer ${directorAuth.token}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const creatorIds = new Set(res.data.vouchers.map(v => v.created_by_user_id));
    assert(creatorIds.has(alexAuth.user.id), 'Director must see Alex vouchers');
    assert(creatorIds.has(priyaAuth.user.id), 'Director must see Priya vouchers');
  });

  await test('Director dashboard metrics cover system-wide vouchers', async () => {
    const res = await request('/dashboard/stats', {
      headers: { Authorization: `Bearer ${directorAuth.token}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.role, 'director');
    assert(res.data.stats.totalVouchersInSystem >= 5, 'Must count vouchers across the entire company');
  });

  console.log('\n📋 Test Group 4: Accounts Read-Only Enforcement (Scenario 8)');

  await test('Accounts login has organization-wide read access', async () => {
    const res = await request('/vouchers', {
      headers: { Authorization: `Bearer ${accountsAuth.token}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert(res.data.vouchers.length >= 5, 'Accounts sees all company vouchers');
  });

  await test('Accounts cannot create new vouchers (write forbidden -> HTTP 403)', async () => {
    const res = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accountsAuth.token}` },
      body: JSON.stringify({
        department: 'Finance',
        expense_title: 'Accounts Creation Attempt',
        expense_date: '2026-10-11',
        amount: 500
      })
    });
    assert.strictEqual(res.status, 403, 'Accounts cannot create vouchers');
  });

  await test('Accounts cannot edit vouchers (write forbidden -> HTTP 403)', async () => {
    const res = await request('/vouchers/1', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accountsAuth.token}` },
      body: JSON.stringify({ amount: 100 })
    });
    assert.strictEqual(res.status, 403, 'Accounts cannot edit vouchers');
  });

  await test('Accounts cannot delete vouchers (delete forbidden -> HTTP 403)', async () => {
    const res = await request('/vouchers/1', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accountsAuth.token}` }
    });
    assert.strictEqual(res.status, 403, 'Accounts cannot delete vouchers');
  });

  await test('Accounts cannot approve vouchers (approval forbidden -> HTTP 403)', async () => {
    const res = await request('/vouchers/1/approve', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accountsAuth.token}` },
      body: JSON.stringify({ signature: 'accounts-sig' })
    });
    assert.strictEqual(res.status, 403, 'Accounts cannot approve vouchers');
  });

  await test('Accounts cannot reject vouchers (rejection forbidden -> HTTP 403)', async () => {
    const res = await request('/vouchers/1/reject', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accountsAuth.token}` },
      body: JSON.stringify({ rejection_reason: 'Accounts reject attempt' })
    });
    assert.strictEqual(res.status, 403, 'Accounts cannot reject vouchers');
  });

  console.log('\n📋 Test Group 5: Existing Workflow Verification (Scenario 10)');

  await test('Full lifecycle: Create Draft -> Update Draft -> Sign & Submit -> Director Approve', async () => {
    // 1. Alex creates a fresh draft
    const createRes = await request('/vouchers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexAuth.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: 'Cloud Infrastructure Performance Audit',
        expense_category: 'Software & Subscriptions',
        expense_description: 'Benchmarking performance under high load',
        expense_date: '2026-10-11',
        amount: 15400,
        action: 'draft'
      })
    });
    assert.strictEqual(createRes.status, 201);
    const voucherId = createRes.data.voucher.id;
    assert.strictEqual(createRes.data.voucher.status, 'Draft');

    // 2. Alex updates the draft
    const updateRes = await request(`/vouchers/${voucherId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${alexAuth.token}` },
      body: JSON.stringify({
        department: 'Engineering',
        expense_title: 'Cloud Infrastructure Performance Audit & Tuning',
        expense_category: 'Software & Subscriptions',
        expense_description: 'Benchmarking and container tuning completed',
        expense_date: '2026-10-11',
        amount: 16200,
        action: 'draft'
      })
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.data.voucher.amount, 16200);

    // 3. Alex submits the voucher with mandatory employee signature
    const submitRes = await request(`/vouchers/${voucherId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexAuth.token}` },
      body: JSON.stringify({
        signature: 'data:image/svg+xml;utf8,sample-employee-sig'
      })
    });
    assert.strictEqual(submitRes.status, 200);
    assert.strictEqual(submitRes.data.voucher.status, 'Pending Approval');

    // 4. Director approves the voucher with signature
    const approveRes = await request(`/vouchers/${voucherId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${directorAuth.token}` },
      body: JSON.stringify({
        signature: directorAuth.user.default_signature
      })
    });
    assert.strictEqual(approveRes.status, 200);
    assert.strictEqual(approveRes.data.voucher.status, 'Approved');
    assert.strictEqual(approveRes.data.voucher.approved_by_user_id, directorAuth.user.id);
  });

  console.log('\n============================================================');
  console.log(`🏁 RBAC Security Suite Completed: ${passed} Passed, ${failed} Failed`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
