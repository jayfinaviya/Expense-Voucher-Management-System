import { apiClient } from './client';

export const authApi = {
  login: (email, password) => {
    return apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  getMe: () => {
    return apiClient('/auth/me');
  },

  getDemoUsers: () => {
    return apiClient('/auth/demo-users');
  },

  uploadSignatureFile: (formData) => {
    return apiClient('/upload/signature', {
      method: 'POST',
      body: formData
    });
  }
};
