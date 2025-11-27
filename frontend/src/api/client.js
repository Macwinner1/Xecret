import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  zkLogin: (provider, username) => 
    apiClient.post('/auth/zk-login', { provider, username }),
  
  login: (username) => 
    apiClient.post('/auth/login', { username }),
  
  getProfile: (username) => 
    apiClient.get(`/auth/profile/${username}`),
  
  getCurrentUser: () => 
    apiClient.get('/auth/me'),
};

// Content API
export const contentAPI = {
  getAll: () => 
    apiClient.get('/content'),
  
  getById: (contentId) => 
    apiClient.get(`/content/${contentId}`),
  
  getByCreator: (username) => 
    apiClient.get(`/content/creator/${username}`),
  
  upload: (formData) => 
    apiClient.post('/content/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  delete: (contentId) => 
    apiClient.delete(`/content/${contentId}`),
  
  hide: (contentId) => 
    apiClient.post(`/content/${contentId}/hide`),
  
  checkAccess: (contentId) => 
    apiClient.get(`/content/${contentId}/access`),
};

// Payment API
export const paymentAPI = {
  purchase: (content_id, payment_method) => 
    apiClient.post('/payment/purchase', { content_id, payment_method }),
  
  sendTip: (recipient_username, amount, message, content_id) => 
    apiClient.post('/payment/tip', { recipient_username, amount, message, content_id }),
  
  getPurchases: () => 
    apiClient.get('/payment/purchases'),
  
  getEarnings: () => 
    apiClient.get('/payment/earnings'),
};

// Streaming API
export const streamingAPI = {
  createSession: (content_id) => 
    apiClient.post('/stream/session', { content_id }),
  
  getFileUrl: (contentId, sessionKey) => 
    `${API_BASE_URL}/stream/${contentId}/file?session_key=${sessionKey}`,
  
  reportViolation: (content_id, violation_type) => 
    apiClient.post('/stream/violation', { content_id, violation_type }),
  
  renewSession: (session_key) => 
    apiClient.post('/stream/session/renew', { session_key }),
};

export default apiClient;
