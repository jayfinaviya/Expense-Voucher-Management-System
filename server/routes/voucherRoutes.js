const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

// List all vouchers (with search, filter, pagination, role restriction)
router.get('/', voucherController.getVouchers);

// Get single voucher details
router.get('/:id', voucherController.getVoucherById);

// Create new voucher (Employee only)
router.post('/', requireRole('employee'), voucherController.createVoucher);

// Edit Draft voucher (Employee only)
router.put('/:id', requireRole('employee'), voucherController.updateVoucher);

// Delete Draft voucher (Employee only)
router.delete('/:id', requireRole('employee'), voucherController.deleteVoucher);

// Submit Draft voucher (Employee only)
router.post('/:id/submit', requireRole('employee'), voucherController.submitVoucher);

// Approve voucher (Director only)
router.post('/:id/approve', requireRole('director'), voucherController.approveVoucher);

// Reject voucher (Director only)
router.post('/:id/reject', requireRole('director'), voucherController.rejectVoucher);

module.exports = router;
