import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:9000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if this is NOT a login request itself
      // This prevents redirect loops after successful login
      const isLoginRequest = error.config?.url?.includes('/auth/login');

      if (!isLoginRequest) {
        // Token expired or invalid - clear auth state
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          // Use history API instead of hard redirect to avoid page reload
          window.history.pushState({}, '', '/login');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/v1/auth/login', { email, password });
    return response.data;
  },

  register: async (data: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
  }) => {
    const response = await api.post('/api/v1/auth/register', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },
};

// Organizations API
export const organizationsAPI = {
  getAll: async () => {
    const response = await api.get('/api/v1/organizations');
    return response.data;
  },

  create: async (data: {
    name: string;
    description?: string;
    industry?: string;
    size?: string;
  }) => {
    const response = await api.post('/api/v1/organizations', data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/v1/organizations/${id}`);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/organizations/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/organizations/${id}`);
    return response.data;
  },
};

// Instances API
export const instancesAPI = {
  getAll: async () => {
    const response = await api.get('/api/v1/instances');
    return response.data;
  },

  create: async (data: {
    name: string;
    url: string;
    organization_id: string;
    credentials: {
      type: 'oauth' | 'basic';
      client_id?: string;
      client_secret?: string;
      username?: string;
      password?: string;
    };
    is_active?: boolean;
  }) => {
    const response = await api.post('/api/v1/instances', data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/v1/instances/${id}`);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/instances/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/instances/${id}`);
    return response.data;
  },

  testConnection: async (id: string) => {
    const response = await api.post(`/api/v1/instances/${id}/test`);
    return response.data;
  },

  sync: async (id: string, data: {
    sync_type: 'manual' | 'scheduled' | 'automatic';
  }) => {
    const response = await api.post(`/api/v1/instances/${id}/sync`, data);
    return response.data;
  },
};

// Analysis API
export const analysisAPI = {
  create: async (data: {
    instance_id: string;
    analysis_type: 'comprehensive' | 'quick' | 'custom';
    modules?: string[];
  }) => {
    const response = await api.post('/api/v1/analysis/analyze', data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/v1/analysis/${id}`);
    return response.data;
  },

  getStatus: async (id: string) => {
    const response = await api.get(`/api/v1/analysis/${id}/status`);
    return response.data;
  },

  getResults: async (id: string) => {
    const response = await api.get(`/api/v1/analysis/${id}/results`);
    return response.data;
  },

  getAll: async (params?: { instance_id?: string; limit?: number }) => {
    const response = await api.get('/api/v1/analysis', { params });
    return response.data;
  },
};

// Insights API
export const insightsAPI = {
  getAll: async (params?: {
    instance_id?: string;
    type?: string;
    severity?: string;
  }) => {
    const response = await api.get('/api/v1/insights', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/v1/insights/${id}`);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getAll: async () => {
    const response = await api.get('/api/v1/dashboards');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/v1/dashboards/${id}`);
    return response.data;
  },

  getStats: async (instance_id?: string) => {
    const response = await api.get('/api/v1/dashboards/stats', {
      params: { instance_id },
    });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/api/v1/users');
    return response.data;
  },

  create: async (data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
  }) => {
    const response = await api.post('/api/v1/users', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/api/v1/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/users/${id}`);
    return response.data;
  },
};

export default api;
