import { apiClient } from './client';

export const dashboardApi = {
  getStats: () => {
    return apiClient('/dashboard/stats');
  }
};
