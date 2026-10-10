import React from 'react';
import { Printer, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const VoucherPrintSlip = ({ isOpen, voucher, onClose }) => {
  if (!isOpen || !voucher) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  // Convert numbers to words in Indian numbering format
  const amountToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
      if ((n = n.toString()).length > 9) return 'Overflow';
      const nArray = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!nArray) return '';
      let str = '';
      str += (Number(nArray[1]) !== 0) ? (a[Number(nArray[1])] || b[nArray[1][0]] + ' ' + a[nArray[1][1]]) + 'Crore ' : '';
      str += (Number(nArray[2]) !== 0) ? (a[Number(nArray[2])] || b[nArray[2][0]] + ' ' + a[nArray[2][1]]) + 'Lakh ' : '';
      str += (Number(nArray[3]) !== 0) ? (a[Number(nArray[3])] || b[nArray[3][0]] + ' ' + a[nArray[3][1]]) + 'Thousand ' : '';
      str += (Number(nArray[4]) !== 0) ? (a[Number(nArray[4])] || b[nArray[4][0]] + ' ' + a[nArray[4][1]]) + 'Hundred ' : '';
      str += (Number(nArray[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(nArray[5])] || b[nArray[5][0]] + ' ' + a[nArray[5][1]]) : '';
      return str.trim();
    };

    const whole = Math.floor(num || 0);
    return inWords(whole) ? `${inWords(whole)} Rupees Only` : 'Zero Rupees Only';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-xl" style={{ maxHeight: '95vh' }}>
        {/* Modal Toolbar (hidden when printing) */}
        <div className="modal-header no-print" style={{ background: '#f8fafc' }}>
          <div>
            <h4 style={{ fontSize: '1.125rem', color: '#0f172a', fontWeight: 700 }}>
              Official Voucher Document Preview
            </h4>
            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Standard A4 financial format suitable for internal audit and reimbursement archival
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} />
              Print / Save as PDF
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              style={{ padding: '6px 10px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Slip Container */}
        <div className="modal-body printable-slip-wrapper" style={{ padding: 36, background: '#ffffff', color: '#000000' }}>
          {/* Company Letterhead */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #0f172a',
            paddingBottom: 20,
            marginBottom: 20
          }}>
            <div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#0f172a',
                fontFamily: 'var(--font-heading)'
              }}>
                PRACHAY SECURITIES PRIVATE LIMITED
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#334155', marginTop: 4 }}>
                Corporate Finance & Accounts Division • CIN: U67120MH2015PTC261942
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                BKC Financial Tower, Bandra Kurla Complex, Mumbai - 400051, India
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                color: '#1d4ed8',
                textTransform: 'uppercase'
              }}>
                EXPENSE VOUCHER
              </div>
              <div className="mono-num" style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0f172a',
                marginTop: 4
              }}>
                {voucher.voucher_number}
              </div>
              <div style={{
                display: 'inline-block',
                marginTop: 6,
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                border: '1px solid',
                borderColor: voucher.status === 'Approved' ? '#10b981' : voucher.status === 'Rejected' ? '#ef4444' : '#f59e0b',
                color: voucher.status === 'Approved' ? '#047857' : voucher.status === 'Rejected' ? '#b91c1c' : '#b45309',
                background: voucher.status === 'Approved' ? '#ecfdf5' : voucher.status === 'Rejected' ? '#fef2f2' : '#fffbeb'
              }}>
                STATUS: {voucher.status}
              </div>
            </div>
          </div>

          {/* Metadata Table */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: 24,
            fontSize: '0.875rem'
          }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, width: '20%' }}>
                  Employee Name:
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', width: '30%', fontWeight: 700 }}>
                  {voucher.employee_name}
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, width: '20%' }}>
                  Voucher Filing Date:
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', width: '30%' }}>
                  {voucher.voucher_date}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600 }}>
                  Employee ID:
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>
                  {voucher.employee_id || 'N/A'}
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600 }}>
                  Expense Incurred Date:
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>
                  {voucher.expense_date}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600 }}>
                  Department / Cost Center:
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>
                  {voucher.department}
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600 }}>
                  Expense Category:
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>
                  {voucher.expense_category}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Itemized Expense Particulars Table */}
          <div style={{ marginBottom: 24 }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem'
            }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'center', width: '8%' }}>Item #</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'left', width: '40%' }}>Expense Particulars & Title</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'left', width: '32%' }}>Business Purpose / Description</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1', textAlign: 'right', width: '20%' }}>Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '16px 12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>1</td>
                  <td style={{ padding: '16px 12px', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{voucher.expense_title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>Category: {voucher.expense_category}</div>
                  </td>
                  <td style={{ padding: '16px 12px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', color: '#334155' }}>
                    {voucher.expense_description || 'Standard corporate operational expense.'}
                  </td>
                  <td className="mono-num" style={{ padding: '16px 12px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, fontSize: '1rem' }}>
                    {formatCurrency(voucher.amount)}
                  </td>
                </tr>
                {/* Total Row */}
                <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                  <td colSpan={3} style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right', textTransform: 'uppercase' }}>
                    Total Reimbursement Amount:
                  </td>
                  <td className="mono-num" style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right', fontSize: '1.125rem', color: '#1d4ed8' }}>
                    {formatCurrency(voucher.amount)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Amount In Words */}
            <div style={{
              marginTop: 10,
              padding: '10px 14px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: '0.8125rem',
              color: '#334155'
            }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Amount in Words: </span>
              <span style={{ fontStyle: 'italic', fontWeight: 600 }}>{amountToWords(voucher.amount)}</span>
            </div>
          </div>

          {/* Dual Formal Declarations & Signatures */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24,
            marginBottom: 24
          }}>
            {/* Claimant Declaration */}
            <div style={{ border: '1px solid #cbd5e1', padding: 14, borderRadius: 6, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569', marginBottom: 4 }}>
                1. Claimant Certification
              </div>
              <p style={{ fontSize: '0.6875rem', color: '#64748b', lineHeight: 1.4, marginBottom: 12 }}>
                I declare that the expenses detailed herein were necessarily incurred in the discharge of official duties on behalf of Prachay Securities.
              </p>

              <div style={{
                height: 80,
                borderBottom: '1px solid #94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafafa',
                marginBottom: 6
              }}>
                {voucher.employee_signature ? (
                  <img src={voucher.employee_signature} alt="Employee Signature" style={{ maxHeight: 68, maxWidth: '90%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Signature Not Affixed</span>
                )}
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
                Employee: {voucher.employee_name}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                Signed Date: {voucher.employee_signature_date ? new Date(voucher.employee_signature_date).toLocaleDateString('en-IN') : voucher.voucher_date}
              </div>
            </div>

            {/* Director Approval Sign-off */}
            <div style={{ border: '1px solid #cbd5e1', padding: 14, borderRadius: 6, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569', marginBottom: 4 }}>
                2. Director Approval & Sanction
              </div>
              <p style={{ fontSize: '0.6875rem', color: '#64748b', lineHeight: 1.4, marginBottom: 12 }}>
                I have reviewed the claimed expenditures and hereby certify and sanction the amount for reimbursement under corporate policy.
              </p>

              <div style={{
                height: 80,
                borderBottom: '1px solid #94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafafa',
                marginBottom: 6
              }}>
                {voucher.director_signature ? (
                  <img src={voucher.director_signature} alt="Director Signature" style={{ maxHeight: 68, maxWidth: '90%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {voucher.status === 'Approved' ? 'Executive Sanction' : 'Awaiting Approval'}
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
                Director: {voucher.director_name || 'Sarah Jenkins (Director)'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                Approval Date: {voucher.approval_date ? new Date(voucher.approval_date).toLocaleDateString('en-IN') : 'Pending'}
              </div>
            </div>
          </div>

          {/* Accounts Reimbursement Clearance Box */}
          <div style={{
            border: '2px dashed #94a3b8',
            padding: 12,
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a' }}>
                3. Accounts Department Disbursement Record
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: 2 }}>
                Passed for Electronic Funds Transfer (NEFT / RTGS) to registered employee salary account.
              </div>
            </div>
            <div style={{
              border: '1px solid #059669',
              background: '#ecfdf5',
              color: '#065f46',
              padding: '6px 14px',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {voucher.status === 'Approved' ? 'PASSED FOR PAYMENT' : 'AUDIT PENDING'}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer no-print">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            <Printer size={15} />
            Print Voucher Slip
          </button>
        </div>
      </div>
    </div>
  );
};
