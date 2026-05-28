import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  bootstrapAuthSession,
  clearAuthSession,
  getAuthUsername,
  getToken,
  login as loginRequest,
  setAuthUsername,
} from '../services/api/auth.api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getToken()));
  const [username, setUsername] = useState(getAuthUsername() || 'testuser');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const init = async () => {
      setIsBootstrapping(true);
      setError('');
      try {
        const session = await bootstrapAuthSession();
        if (!active) return;
        setIsAuthenticated(Boolean(session?.isAuthenticated));
        setUsername(session?.username || getAuthUsername() || 'testuser');
      } catch (err) {
        if (!active) return;
        setIsAuthenticated(Boolean(getToken()));
        setError(err.message || 'Failed to initialize session.');
      } finally {
        if (active) {
          setIsBootstrapping(false);
        }
      }
    };

    init();

    return () => {
      active = false;
    };
  }, []);

  const login = async (nextUsername, password) => {
    setError('');
    const response = await loginRequest(nextUsername, password);
    setAuthUsername(nextUsername);
    setUsername(nextUsername);
    setIsAuthenticated(true);
    return response;
  };

  const logout = () => {
    clearAuthSession();
    setIsAuthenticated(false);
    setUsername('');
  };

  return (
    <AuthContext.Provider
      value={{
        isBootstrapping,
        isAuthenticated,
        username,
        authError: error,
        setAuthError: setError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
