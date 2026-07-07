// components/UI/axiosInstance.js
import axios from 'axios';

// Get the base URL from environment
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4500/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.error('Forbidden: You do not have permission to perform this action');
    }
    
    // Handle 404 Not Found errors
    if (error.response?.status === 404) {
      console.error('Not Found: The requested resource was not found');
    }
    
    // Handle 500 Server errors
    if (error.response?.status >= 500) {
      console.error('Server Error: Please try again later');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;