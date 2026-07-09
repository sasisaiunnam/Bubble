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
  withCredentials: true, // Send cookies (refresh token) with all requests
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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor for error handling and silent refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If the error is from the refresh endpoint itself, do not retry (prevent infinite loop)
      if (originalRequest.url.includes('/auth/refresh')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axiosInstance.defaults.headers.common['Authorization'];
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh token route (withCredentials: true enables cookies)
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = response.data.token;
        localStorage.setItem('token', newToken);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        // Dispatch action to update Redux store so socket connects with fresh token
        const { store } = await import('../store/store');
        const { updateToken } = await import('../store/slices/authSlice');
        store.dispatch(updateToken(newToken));

        processQueue(null, newToken);
        isRefreshing = false;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear credentials and log out
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axiosInstance.defaults.headers.common['Authorization'];

        // Clear token from Redux store to trigger socket disconnect/cleanup
        const { store } = await import('../store/store');
        const { updateToken } = await import('../store/slices/authSlice');
        store.dispatch(updateToken(null));

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
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