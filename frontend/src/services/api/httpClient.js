import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_API_URL || 'https://data-analysis-estimation-tool.onrender.com';
const AUTH_TOKEN_KEY = 'daet_auth_token';

const httpClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 120000, // 2 minutes for heavy ML/data operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT bearer token if present
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unpack data and handle unauthorized sessions cleanly
httpClient.interceptors.response.use(
  (response) => {
    if (response.config?.responseType === 'blob') {
      return response;
    }
    // Automatically unpack axios 'data' wrapper so services return the direct payload
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status || null;

    // When 401 Unauthorized occurs, clear session tokens and notify UI
    if (status === 401 && !String(originalRequest.url || '').includes('/api/auth/')) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem('daet_auth_username');
      window.dispatchEvent(new CustomEvent('daet:unauthorized'));
    }

    let message = 'An unexpected error occurred.';
    let details = null;

    if (error.response) {
      details = error.response.data;
      message = error.response.data?.detail || error.response.data?.message || `Server Error: ${status}`;
    } else if (error.request) {
      message = 'Network error: Could not reach the server or request timed out.';
    } else {
      message = error.message;
    }

    return Promise.reject({
      status,
      message,
      details,
    });
  }
);

export default httpClient;
