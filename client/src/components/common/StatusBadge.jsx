import React from 'react';
import { Clock, CheckCircle2, XCircle, FileEdit } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  if (normalized === 'approved') {
    return (
      <span className="status-badge approved">
        <CheckCircle2 size={12} strokeWidth={2.5} />
        Approved
      </span>
    );
  }

  if (normalized === 'pending approval' || normalized === 'pending') {
    return (
      <span className="status-badge pending">
        <Clock size={12} strokeWidth={2.5} />
        Pending Approval
      </span>
    );
  }

  if (normalized === 'rejected') {
    return (
      <span className="status-badge rejected">
        <XCircle size={12} strokeWidth={2.5} />
        Rejected
      </span>
    );
  }

  // Default: Draft
  return (
    <span className="status-badge draft">
      <FileEdit size={12} strokeWidth={2.5} />
      Draft
    </span>
  );
};
