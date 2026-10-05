import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach JWT token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('driveease_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response ? error.response.status : null;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

    if (status === 401) {
      // Clear token if expired or invalid
      localStorage.removeItem('driveease_token');
      localStorage.removeItem('driveease_user');
      // Do not auto-reload if already on login page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // Soft dispatch event so UI can react
        window.dispatchEvent(new Event('auth_expired'));
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
