import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const AUTH_TOKEN_KEY = 'daet_auth_token';
let reloginPromise = null;

const httpClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 120000, // 2 minutes for heavy ML/data operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
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

// Response Interceptor
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

    if (
      status === 401 &&
      !originalRequest._retry &&
      !String(originalRequest.url || '').includes('/api/auth/')
    ) {
      originalRequest._retry = true;

      try {
        if (!reloginPromise) {
          reloginPromise = axios.post(`${BASE_API_URL}/api/auth/login`, {
            username: 'testuser',
            password: 'testpassword',
          });
        }

        const reloginResponse = await reloginPromise;
        const token = reloginResponse?.data?.data?.access_token || reloginResponse?.data?.access_token;

        if (token) {
          localStorage.setItem(AUTH_TOKEN_KEY, token);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return httpClient(originalRequest);
        }
      } catch (reloginError) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      } finally {
        reloginPromise = null;
      }
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
      details
    });
  }
);

export default httpClient;
