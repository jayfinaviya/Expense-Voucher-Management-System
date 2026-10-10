const { dbGet, dbAll } = require('../config/db');

// GET /api/dashboard/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    if (role === 'employee') {
      // Employee Dashboard: only own vouchers
      const totalVouchersRes = await dbGet(
        'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as totalAmount FROM vouchers WHERE created_by_user_id = ?',
        [userId]
      );

      const draftRes = await dbGet(
        'SELECT COUNT(*) as count FROM vouchers WHERE created_by_user_id = ? AND status = ?',
        [userId, 'Draft']
      );

      const pendingRes = await dbGet(
        'SELECT COUNT(*) as count FROM vouchers WHERE created_by_user_id = ? AND status = ?',
        [userId, 'Pending Approval']
      );

      const approvedRes = await dbGet(
        'SELECT COUNT(*) as count FROM vouchers WHERE created_by_user_id = ? AND status = ?',
        [userId, 'Approved']
      );

      const rejectedRes = await dbGet(
        'SELECT COUNT(*) as count FROM vouchers WHERE created_by_user_id = ? AND status = ?',
        [userId, 'Rejected']
      );

      const recentVouchers = await dbAll(
        'SELECT * FROM vouchers WHERE created_by_user_id = ? ORDER BY created_at DESC LIMIT 5',
        [userId]
      );

      return res.json({
        success: true,
        role: 'employee',
        stats: {
          totalVouchers: totalVouchersRes.count,
          totalAmountClaimed: totalVouchersRes.totalAmount,
          draftVouchers: draftRes.count,
          pendingApproval: pendingRes.count,
          approvedVouchers: approvedRes.count,
          rejectedVouchers: rejectedRes.count
        },
        recentVouchers
      });
    }

    if (role === 'director') {
      // Director Dashboard: system-wide metrics
      const pendingCountRes = await dbGet(
        'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as totalPendingAmount FROM vouchers WHERE status = ?',
        ['Pending Approval']
      );

      const approvedTodayRes = await dbGet(
        "SELECT COUNT(*) as count FROM vouchers WHERE status = 'Approved' AND approval_date LIKE ?",
        [`${today}%`]
      );

      const rejectedTodayRes = await dbGet(
        "SELECT COUNT(*) as count FROM vouchers WHERE status = 'Rejected' AND updated_at LIKE ?",
        [`${today}%`]
      );

      const allTotalRes = await dbGet('SELECT COUNT(*) as count FROM vouchers');

      const recentActivity = await dbAll(
        'SELECT * FROM vouchers ORDER BY updated_at DESC LIMIT 7'
      );

      const pendingList = await dbAll(
        "SELECT * FROM vouchers WHERE status = 'Pending Approval' ORDER BY created_at ASC LIMIT 10"
      );

      return res.json({
        success: true,
        role: 'director',
        stats: {
          pendingApprovalCount: pendingCountRes.count,
          totalPendingAmount: pendingCountRes.totalPendingAmount,
          approvedToday: approvedTodayRes.count,
          rejectedToday: rejectedTodayRes.count,
          totalVouchersInSystem: allTotalRes.count
        },
        pendingList,
        recentActivity
      });
    }

    if (role === 'accounts') {
      // Accounts Dashboard: system-wide metrics and reimbursement monitoring
      const countsRes = await dbGet(
        `SELECT 
          COUNT(*) as totalVouchers,
          COALESCE(SUM(CASE WHEN status = 'Approved' THEN amount ELSE 0 END), 0) as totalApprovedAmount,
          SUM(CASE WHEN status = 'Pending Approval' THEN 1 ELSE 0 END) as pendingCount,
          SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approvedCount,
          SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejectedCount
        FROM vouchers`
      );

      const recentApproved = await dbAll(
        "SELECT * FROM vouchers WHERE status = 'Approved' ORDER BY approval_date DESC LIMIT 8"
      );

      return res.json({
        success: true,
        role: 'accounts',
        stats: {
          totalVouchers: countsRes.totalVouchers || 0,
          pendingApproval: countsRes.pendingCount || 0,
          approvedVouchers: countsRes.approvedCount || 0,
          rejectedVouchers: countsRes.rejectedCount || 0,
          totalApprovedExpenseAmount: countsRes.totalApprovedAmount || 0
        },
        recentApprovedVouchers: recentApproved
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid role.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats
};
