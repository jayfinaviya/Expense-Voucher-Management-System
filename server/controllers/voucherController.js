const { dbRun, dbGet, dbAll } = require('../config/db');

// Generate sequential unique voucher number (e.g., EV-2026-0006)
const generateNextVoucherNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `EV-${currentYear}-`;
  
  const lastVoucher = await dbGet(
    `SELECT voucher_number FROM vouchers WHERE voucher_number LIKE ? ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let nextSequence = 1;
  if (lastVoucher && lastVoucher.voucher_number) {
    const parts = lastVoucher.voucher_number.split('-');
    if (parts.length === 3) {
      const parsedSeq = parseInt(parts[2], 10);
      if (!isNaN(parsedSeq)) {
        nextSequence = parsedSeq + 1;
      }
    }
  }

  const paddedSequence = String(nextSequence).padStart(4, '0');
  return `${prefix}${paddedSequence}`;
};

// GET /api/vouchers
// Fetch vouchers with role filtering, searching, and multifaceted filters
const getVouchers = async (req, res, next) => {
  try {
    const {
      search,
      voucherNumber,
      employeeName,
      department,
      category,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 25
    } = req.query;

    const conditions = [];
    const params = [];

    // Role-based visibility rule
    // Employee: view ONLY vouchers created by themselves
    // Director & Accounts: view all vouchers across the company
    if (req.user.role === 'employee') {
      conditions.push('created_by_user_id = ?');
      params.push(req.user.id);
    } else if (req.user.role === 'director' || req.user.role === 'accounts') {
      // Authorized for organization-wide visibility
    } else {
      return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized role.' });
    }

    // Explicit filter by Voucher Number (Section 7 Search & Filter)
    if (voucherNumber && voucherNumber.trim() !== '') {
      conditions.push('voucher_number LIKE ?');
      params.push(`%${voucherNumber.trim()}%`);
    }

    // Explicit filter by Employee Name (Section 7 Search & Filter)
    if (employeeName && employeeName.trim() !== '') {
      conditions.push('employee_name LIKE ?');
      params.push(`%${employeeName.trim()}%`);
    }

    // Keyword Search (voucher_number, employee_name, expense_title, expense_description)
    if (search && search.trim() !== '') {
      conditions.push('(voucher_number LIKE ? OR employee_name LIKE ? OR expense_title LIKE ? OR expense_description LIKE ?)');
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    // Filter by department
    if (department && department !== 'All') {
      conditions.push('department = ?');
      params.push(department);
    }

    // Filter by category
    if (category && category !== 'All') {
      conditions.push('expense_category = ?');
      params.push(category);
    }

    // Filter by status
    if (status && status !== 'All') {
      conditions.push('status = ?');
      params.push(status);
    }

    // Filter by date range (expense_date)
    if (startDate) {
      conditions.push('expense_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('expense_date <= ?');
      params.push(endDate);
    }

    // Filter by amount range
    if (minAmount && !isNaN(parseFloat(minAmount))) {
      conditions.push('amount >= ?');
      params.push(parseFloat(minAmount));
    }
    if (maxAmount && !isNaN(parseFloat(maxAmount))) {
      conditions.push('amount <= ?');
      params.push(parseFloat(maxAmount));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total matching items
    const countQuery = `SELECT COUNT(*) as total FROM vouchers ${whereClause}`;
    const countResult = await dbGet(countQuery, params);
    const totalRecords = countResult ? countResult.total : 0;

    // Sorting whitelist to prevent SQL injection
    const allowedSortFields = ['created_at', 'expense_date', 'voucher_date', 'amount', 'voucher_number', 'status', 'employee_name', 'department'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 25));
    const offset = (pageNum - 1) * pageLimit;

    const dataQuery = `
      SELECT * FROM vouchers 
      ${whereClause} 
      ORDER BY ${validSortBy} ${validSortOrder} 
      LIMIT ? OFFSET ?
    `;

    const vouchers = await dbAll(dataQuery, [...params, pageLimit, offset]);

    return res.json({
      success: true,
      vouchers,
      pagination: {
        total: totalRecords,
        page: pageNum,
        limit: pageLimit,
        totalPages: Math.ceil(totalRecords / pageLimit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/vouchers/:id
const getVoucherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const voucher = await dbGet('SELECT * FROM vouchers WHERE id = ?', [id]);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    // Check access authorization
    if (req.user.role === 'employee') {
      if (voucher.created_by_user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only view your own expense vouchers.' });
      }
    } else if (req.user.role !== 'director' && req.user.role !== 'accounts') {
      return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized role.' });
    }

    return res.json({ success: true, voucher });
  } catch (err) {
    next(err);
  }
};

// POST /api/vouchers
// Create a new voucher (Saved initially as Draft, or submitted if signature provided)
const createVoucher = async (req, res, next) => {
  try {
    // Only employees can create vouchers
    if (req.user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only employees can create expense vouchers.'
      });
    }

    const {
      expense_date,
      department,
      expense_title,
      expense_category,
      expense_description = '',
      amount,
      signature, // Base64 data URI or path
      action = 'draft' // 'draft' or 'submit'
    } = req.body;

    // Validation rules
    const errors = [];
    if (!department || !department.trim()) errors.push('Department is mandatory.');
    if (!expense_title || !expense_title.trim()) errors.push('Expense Title is mandatory.');
    if (!expense_date || (typeof expense_date === 'string' && !expense_date.trim())) {
      errors.push('Expense Date is mandatory.');
    } else if (isNaN(new Date(expense_date).getTime())) {
      errors.push('Expense Date must be a valid date.');
    }
    if (amount === undefined || amount === null || isNaN(parseFloat(amount))) {
      errors.push('Amount is mandatory.');
    } else if (parseFloat(amount) <= 0) {
      errors.push('Amount must be greater than zero.');
    }

    // Business rule: Employee Signature is mandatory before submission
    if (action === 'submit' && !signature) {
      errors.push("Employee Signature is mandatory before submission for approval.");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(' '), errors });
    }

    // Derive employee information strictly from authenticated user session
    const verifiedEmployeeId = req.user.employee_id || `EMP-${String(req.user.id).padStart(3, '0')}`;
    const verifiedEmployeeName = req.user.name;

    const voucherNumber = await generateNextVoucherNumber();
    const now = new Date();
    const voucherDate = now.toISOString().split('T')[0];
    const isoTimestamp = now.toISOString();

    const status = action === 'submit' ? 'Pending Approval' : 'Draft';
    const signatureDate = action === 'submit' ? isoTimestamp : null;

    const result = await dbRun(
      `INSERT INTO vouchers (
        voucher_number, voucher_date, expense_date, department, expense_title, expense_category,
        expense_description, amount, status, created_by_user_id, employee_name, employee_id,
        employee_signature, employee_signature_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        voucherNumber,
        voucherDate,
        expense_date,
        department.trim(),
        expense_title.trim(),
        expense_category || 'Other',
        expense_description ? expense_description.trim() : '',
        parseFloat(amount),
        status,
        req.user.id,
        verifiedEmployeeName,
        verifiedEmployeeId,
        signature || null,
        signatureDate,
        isoTimestamp,
        isoTimestamp
      ]
    );

    const createdVoucher = await dbGet('SELECT * FROM vouchers WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      success: true,
      message: action === 'submit' 
        ? `Voucher ${voucherNumber} submitted successfully for Director approval!`
        : `Voucher ${voucherNumber} saved as Draft.`,
      voucher: createdVoucher
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/vouchers/:id
// Edit Draft voucher
const updateVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const voucher = await dbGet('SELECT * FROM vouchers WHERE id = ?', [id]);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    // Employee authorization rule
    if (req.user.role !== 'employee' || voucher.created_by_user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only edit your own vouchers.' });
    }

    // Business rule: Employees may edit vouchers ONLY while they are in Draft status
    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Business Rule Violation: Only vouchers in "Draft" status can be edited. Current status is "${voucher.status}".`
      });
    }

    const {
      expense_date,
      department,
      expense_title,
      expense_category,
      expense_description,
      amount,
      employee_id,
      signature,
      action = 'draft' // 'draft' or 'submit'
    } = req.body;

    const errors = [];
    if (!department || !department.trim()) errors.push('Department is mandatory.');
    if (!expense_title || !expense_title.trim()) errors.push('Expense Title is mandatory.');
    if (!expense_date || (typeof expense_date === 'string' && !expense_date.trim())) {
      errors.push('Expense Date is mandatory.');
    } else if (isNaN(new Date(expense_date).getTime())) {
      errors.push('Expense Date must be a valid date.');
    }
    if (amount === undefined || amount === null || isNaN(parseFloat(amount))) {
      errors.push('Amount is mandatory.');
    } else if (parseFloat(amount) <= 0) {
      errors.push('Amount must be greater than zero.');
    }

    const finalSignature = signature || voucher.employee_signature;
    if (action === 'submit' && !finalSignature) {
      errors.push("Employee Signature is mandatory before submission for approval.");
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(' '), errors });
    }

    const now = new Date();
    const isoTimestamp = now.toISOString();
    const newStatus = action === 'submit' ? 'Pending Approval' : 'Draft';
    const signatureDate = action === 'submit' ? isoTimestamp : voucher.employee_signature_date;

    await dbRun(
      `UPDATE vouchers SET
        expense_date = ?,
        department = ?,
        expense_title = ?,
        expense_category = ?,
        expense_description = ?,
        amount = ?,
        employee_id = ?,
        employee_signature = ?,
        employee_signature_date = ?,
        status = ?,
        updated_at = ?
       WHERE id = ?`,
      [
        expense_date,
        department.trim(),
        expense_title.trim(),
        expense_category || voucher.expense_category,
        expense_description !== undefined ? expense_description.trim() : voucher.expense_description,
        parseFloat(amount),
        voucher.employee_id,
        finalSignature,
        signatureDate,
        newStatus,
        isoTimestamp,
        id
      ]
    );

    const updated = await dbGet('SELECT * FROM vouchers WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: action === 'submit'
        ? `Voucher ${voucher.voucher_number} submitted for approval!`
        : `Voucher ${voucher.voucher_number} updated as Draft.`,
      voucher: updated
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/vouchers/:id
// Delete Draft voucher
const deleteVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const voucher = await dbGet('SELECT * FROM vouchers WHERE id = ?', [id]);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    // Role verification
    if (req.user.role !== 'employee' || voucher.created_by_user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own vouchers.' });
    }

    // Business rule: Employees may delete vouchers ONLY while they are in Draft status
    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Business Rule Violation: Only vouchers in "Draft" status can be deleted. This voucher is "${voucher.status}".`
      });
    }

    await dbRun('DELETE FROM vouchers WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: `Voucher ${voucher.voucher_number} has been deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/vouchers/:id/submit
// Submit an existing Draft voucher
const submitVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const voucher = await dbGet('SELECT * FROM vouchers WHERE id = ?', [id]);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (req.user.role !== 'employee' || voucher.created_by_user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only submit your own vouchers.' });
    }

    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Only vouchers with "Draft" status can be submitted. Current status: ${voucher.status}`
      });
    }

    const { signature } = req.body;
    let finalSignature = signature;
    if (finalSignature === undefined || finalSignature === null) {
      finalSignature = voucher.employee_signature;
    }

    if (!finalSignature || (typeof finalSignature === 'string' && !finalSignature.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Employee Signature is mandatory before submission for approval.'
      });
    }

    const now = new Date().toISOString();
    await dbRun(
      `UPDATE vouchers SET
        status = 'Pending Approval',
        employee_signature = ?,
        employee_signature_date = ?,
        updated_at = ?
       WHERE id = ?`,
      [finalSignature, now, now, id]
    );

    const updated = await dbGet('SELECT * FROM vouchers WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: `Voucher ${voucher.voucher_number} submitted to Director for review!`,
      voucher: updated
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/vouchers/:id/approve
// Director only: Approve voucher
const approveVoucher = async (req, res, next) => {
  try {
    if (req.user.role !== 'director') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the Director can approve vouchers.' });
    }

    const { id } = req.params;
    const voucher = await dbGet('SELECT * FROM vouchers WHERE id = ?', [id]);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.status !== 'Pending Approval') {
      return res.status(400).json({
        success: false,
        message: `Only vouchers in "Pending Approval" status can be approved. Current status: ${voucher.status}`
      });
    }

    const { signature } = req.body;
    let finalSignature = signature;
    if (finalSignature === undefined || finalSignature === null) {
      finalSignature = req.user.default_signature;
    }

    // Validation rule: Director Signature is mandatory before approval
    if (!finalSignature || (typeof finalSignature === 'string' && !finalSignature.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Director Signature is mandatory before approval. Please sign or upload signature.'
      });
    }

    const now = new Date().toISOString();
    await dbRun(
      `UPDATE vouchers SET
        status = 'Approved',
        approved_by_user_id = ?,
        director_name = ?,
        director_signature = ?,
        approval_date = ?,
        rejection_reason = NULL,
        updated_at = ?
       WHERE id = ?`,
      [req.user.id, req.user.name, finalSignature, now, now, id]
    );

    const updated = await dbGet('SELECT * FROM vouchers WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: `Voucher ${voucher.voucher_number} approved successfully! Forwarded to Accounts for reimbursement.`,
      voucher: updated
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/vouchers/:id/reject
// Director only: Reject voucher with mandatory reason
const rejectVoucher = async (req, res, next) => {
  try {
    if (req.user.role !== 'director') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the Director can reject vouchers.' });
    }

    const { id } = req.params;
    const voucher = await dbGet('SELECT * FROM vouchers WHERE id = ?', [id]);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.status !== 'Pending Approval') {
      return res.status(400).json({
        success: false,
        message: `Only vouchers in "Pending Approval" status can be rejected. Current status: ${voucher.status}`
      });
    }

    const { rejection_reason } = req.body;

    // Validation rule: Rejection Reason is mandatory if a voucher is rejected
    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection Reason is mandatory when rejecting a voucher.'
      });
    }

    const now = new Date().toISOString();
    await dbRun(
      `UPDATE vouchers SET
        status = 'Rejected',
        approved_by_user_id = ?,
        director_name = ?,
        director_signature = NULL,
        approval_date = NULL,
        rejection_reason = ?,
        updated_at = ?
       WHERE id = ?`,
      [req.user.id, req.user.name, rejection_reason.trim(), now, id]
    );

    const updated = await dbGet('SELECT * FROM vouchers WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: `Voucher ${voucher.voucher_number} has been rejected with feedback provided to employee.`,
      voucher: updated
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  submitVoucher,
  approveVoucher,
  rejectVoucher
};
