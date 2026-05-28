import httpClient from './httpClient';

const TOKEN_KEY = 'daet_auth_token';
const USERNAME_KEY = 'daet_auth_username';

export const login = async (username, password) => {
  const response = await httpClient.post('/api/auth/login', { username, password });
  const token = response?.data?.access_token || response?.access_token || response?.data?.data?.access_token;
  if (token) {
    setToken(token);
    setAuthUsername(username);
  }
  return response;
};

export const logout = () => {
  removeToken();
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getAuthUsername = () => {
  return localStorage.getItem(USERNAME_KEY);
};

export const setAuthUsername = (username) => {
  localStorage.setItem(USERNAME_KEY, username);
};

export const removeAuthUsername = () => {
  localStorage.removeItem(USERNAME_KEY);
};

export const autoLogin = async () => {
  const currentToken = getToken();
  if (currentToken) {
    return currentToken;
  }
  try {
    const response = await login('testuser', 'testpassword');
    return response?.data?.access_token || response?.access_token || response?.data?.data?.access_token || getToken();
  } catch (error) {
    console.error('Auto login failed:', error);
    throw error;
  }
};

export const bootstrapAuthSession = async () => {
  const token = await autoLogin();
  const username = getAuthUsername() || 'testuser';
  return {
    token,
    username,
    isAuthenticated: Boolean(token),
  };
};

export const clearAuthSession = () => {
  removeToken();
  removeAuthUsername();
};
