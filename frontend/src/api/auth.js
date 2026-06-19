import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

export const receiptAPI = {
  upload: (formData) => api.post('/receipts/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/receipts', { params }),
  getById: (id) => api.get(`/receipts/${id}`),
  update: (id, data) => api.put(`/receipts/${id}`, data),
  delete: (id) => api.delete(`/receipts/${id}`),
  reprocess: (id) => api.post(`/receipts/${id}/reprocess`),
  getStats: () => api.get('/receipts/stats'),
  downloadPdf: (id) => api.get(`/receipts/${id}/pdf`, { responseType: 'blob' }),
};

export const expenseAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getStats: (params) => api.get('/expenses/stats', { params }),
};

export const insightAPI = {
  getAll: () => api.get('/insights'),
  getSpendingHabits: () => api.get('/insights/spending-habits'),
  getBudgetSuggestions: () => api.get('/insights/budget-suggestions'),
  getAnomalies: () => api.get('/insights/anomalies'),
  getSavings: () => api.get('/insights/savings'),
  chat: (message) => api.post('/insights/chat', { message }),
  getChatHistory: () => api.get('/insights/chat/history'),
};

export const reportAPI = {
  generate: (data) => api.post('/reports/generate', data, { responseType: 'blob' }),
  getAll: () => api.get('/reports'),
  getById: (id) => api.get(`/reports/${id}`),
  delete: (id) => api.delete(`/reports/${id}`),
};

export const backupAPI = {
  create: () => api.post('/backup'),
  getHistory: () => api.get('/backup'),
  getLatest: () => api.get('/backup/latest'),
  delete: (id) => api.delete(`/backup/${id}`),
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getStats: () => api.get('/admin/stats'),
};