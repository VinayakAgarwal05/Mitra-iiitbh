import axios from 'axios';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  return '/api';
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('college_connect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if invalid/expired, unless on login/register/verification endpoints
      const isAuthRoute = window.location.pathname.startsWith('/login') || 
                          window.location.pathname.startsWith('/register') || 
                          window.location.pathname.startsWith('/verify-email');
      if (!isAuthRoute) {
        localStorage.removeItem('college_connect_token');
        localStorage.removeItem('college_connect_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
