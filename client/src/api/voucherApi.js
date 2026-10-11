import { apiClient } from './client';

export const voucherApi = {
  getVouchers: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/vouchers${queryString}`);
  },

  getVoucherById: (id) => {
    return apiClient(`/vouchers/${id}`);
  },

  createVoucher: (voucherData) => {
    return apiClient('/vouchers', {
      method: 'POST',
      body: JSON.stringify(voucherData)
    });
  },

  updateVoucher: (id, voucherData) => {
    return apiClient(`/vouchers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(voucherData)
    });
  },

  deleteVoucher: (id) => {
    return apiClient(`/vouchers/${id}`, {
      method: 'DELETE'
    });
  },

  submitVoucher: (id, signature) => {
    return apiClient(`/vouchers/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ signature })
    });
  },

  approveVoucher: (id, signature) => {
    return apiClient(`/vouchers/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ signature })
    });
  },

  rejectVoucher: (id, rejection_reason) => {
    return apiClient(`/vouchers/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejection_reason })
    });
  },

  uploadSignature: (file) => {
    const formData = new FormData();
    formData.append('signatureFile', file);
    return apiClient('/upload/signature', {
      method: 'POST',
      body: formData
    });
  }
};
