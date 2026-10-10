import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const { type = 'info', message } = toast;

  const iconMap = {
    success: <CheckCircle2 size={18} color="#059669" />,
    error: <AlertCircle size={18} color="#dc2626" />,
    info: <Info size={18} color="#2563eb" />
  };

  const borderMap = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6'
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 18px',
        background: '#ffffff',
        borderLeft: `4px solid ${borderMap[type] || '#3b82f6'}`,
        borderRadius: 8,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        maxWidth: 420,
        animation: 'slideUp 200ms ease-out'
      }}
    >
      {iconMap[type] || iconMap.info}
      <div style={{ flex: 1, fontSize: '0.875rem', color: '#1e293b', fontWeight: 500 }}>
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#94a3b8',
          display: 'flex',
          padding: 2
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
