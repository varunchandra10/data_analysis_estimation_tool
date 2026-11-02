import httpClient from './httpClient';

const TOKEN_KEY = 'daet_auth_token';
const USERNAME_KEY = 'daet_auth_username';

export const register = async (username, email, password) => {
  const response = await httpClient.post('/api/auth/register', { username, email, password });
  return response;
};

export const login = async (username, password) => {
  const response = await httpClient.post('/api/auth/login', { username, password });
  const token =
    response?.data?.access_token ||
    response?.access_token ||
    response?.data?.data?.access_token ||
    response?.data?.token;

  if (token) {
    setToken(token);
    setAuthUsername(username);
  }
  return response;
};

export const logout = () => {
  clearAuthSession();
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

export const bootstrapAuthSession = async () => {
  const token = getToken();
  const username = getAuthUsername() || '';
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
