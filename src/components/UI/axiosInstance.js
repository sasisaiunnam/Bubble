import axios from 'axios';

// Access environment variables using import.meta.env in Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4500/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * This runs before each request is sent.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the auth token from storage (e.g., localStorage)
    const token = localStorage.getItem('authToken');

    // If the token exists, add it to the Authorization header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * This runs for each response received.
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx will trigger this function.
    // You can process response data here before it's returned.
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      if (status === 401) {
        // Handle Unauthorized errors
        // For example, remove the token and redirect to the login page
        console.error('Unauthorized access - 401. Redirecting to login.');
        localStorage.removeItem('authToken');
        // In a React app, you might want to use a more sophisticated way to navigate
        // but window.location is a simple and effective fallback.
        // window.location.href = '/login';
      } else {
        console.error(`Server Error: ${status}`, data);
      }
    } else if (error.request) {
      // The request was made but no response was received (e.g., network error)
      console.error('Network Error: No response received.', error.request);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;