const API_BASE_URL = 'http://localhost:55555/api';

// Get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Get user info from localStorage
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle network errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  } catch (error: any) {
    // Re-throw with better error message for network issues
    if (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      throw new Error('Cannot connect to server. Please make sure the backend is running.');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  
  login: (data: { email: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  
  requestReset: (email: string) =>
    apiRequest('/auth/reset', { method: 'POST', body: JSON.stringify({ email }) }),
  
  verifyCode: (email: string, code: string) =>
    apiRequest('/auth/verify', { method: 'POST', body: JSON.stringify({ email, code }) }),
  
  changePassword: (email: string, code: string, newPassword: string) =>
    apiRequest('/auth/change-password', { method: 'POST', body: JSON.stringify({ email, code, newPassword }) }),
};
// Menu API
export const menuAPI = {
  getMenu: () => apiRequest('/menu'),
  getMenuItem: (id: string) => apiRequest(`/menu/${id}`),
  createMenuItem: (data: any) => apiRequest('/menu', { method: 'POST', body: JSON.stringify(data) }),
  updateMenuItem: (id: string, data: any) => apiRequest(`/menu/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  toggleAvailability: (id: string) => apiRequest(`/menu/${id}/toggle`, { method: 'PATCH' }),
  deleteMenuItem: (id: string) => apiRequest(`/menu/${id}`, { method: 'DELETE' }),
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/menu/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload image');
    }
    return response.json();
  },
};

// Order API
export const orderAPI = {
  createOrder: (data: { items: any[]; pickupTime: string; specialInstructions?: string }) =>
    apiRequest('/orders', { method: 'POST', body: JSON.stringify(data) }),
  
  getCurrentOrders: () => apiRequest('/orders/current'),
  
  getOrderHistory: () => apiRequest('/orders/history'),
  
  getOrder: (id: string) => apiRequest(`/orders/${id}`),
  
  updateOrder: (id: string, data: { items?: any[]; pickupTime?: string; specialInstructions?: string }) =>
    apiRequest(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  
  cancelOrder: (id: string) => apiRequest(`/orders/${id}/cancel`, { method: 'PATCH' }),
};

// Staff API
export const staffAPI = {
  getOrders: () => apiRequest('/staff/orders'),
  
  getCancelledOrders: () => apiRequest('/staff/orders/cancelled'),
  
  updateOrderStatus: (id: string, status: string) =>
    apiRequest(`/staff/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  
  cancelOrder: (id: string) => apiRequest(`/staff/orders/${id}/cancel`, { method: 'PATCH' }),
};

// Manager API
export const managerAPI = {
  getUsers: () => apiRequest('/manager/users'),
  
  createUser: (data: { username: string; password: string; role: string }) =>
    apiRequest('/manager/users', { method: 'POST', body: JSON.stringify(data) }),
  
  updateUser: (id: string, data: any) =>
    apiRequest(`/manager/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  
  deleteUser: (id: string) => apiRequest(`/manager/users/${id}`, { method: 'DELETE' }),
  
  getAllOrders: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiRequest(`/manager/orders${params}`);
  },
  
  getCancelledOrders: () => apiRequest('/manager/orders/cancelled'),
  
  clearCancelledOrders: () => apiRequest('/manager/orders/cancelled', { method: 'DELETE' }),
  
  getDailyReports: (date?: string) => {
    const params = date ? `?date=${date}` : '';
    return apiRequest(`/manager/reports${params}`);
  },
  
  archiveOrder: (orderId: string) => apiRequest(`/manager/archive/${orderId}`, { method: 'POST' }),
  
  bulkArchiveOrders: (daysOld: number) => 
    apiRequest('/manager/archive/bulk', { method: 'POST', body: JSON.stringify({ daysOld }) }),
  
  getArchivedOrders: (date?: string) => {
    const params = date ? `?date=${date}` : '';
    return apiRequest(`/manager/archive${params}`);
  },
  
  cancelOrder: (id: string) => apiRequest(`/staff/orders/${id}/cancel`, { method: 'PATCH' }),
};