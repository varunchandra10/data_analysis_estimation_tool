import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  bootstrapAuthSession,
  clearAuthSession,
  getAuthUsername,
  getToken,
  login as loginRequest,
  register as registerRequest,
  setAuthUsername,
} from '../services/api/auth.api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getToken()));
  const [username, setUsername] = useState(getAuthUsername() || '');
  const [error, setError] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const init = async () => {
      setIsBootstrapping(true);
      setError('');
      try {
        const session = await bootstrapAuthSession();
        if (!active) return;
        setIsAuthenticated(Boolean(session?.isAuthenticated));
        setUsername(session?.username || getAuthUsername() || '');
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

    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setUsername('');
      setError('Session expired or unauthorized. Please sign in again.');
      setIsLoginModalOpen(true);
    };

    window.addEventListener('daet:unauthorized', handleUnauthorized);

    return () => {
      active = false;
      window.removeEventListener('daet:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (nextUsername, password) => {
    setError('');
    const response = await loginRequest(nextUsername, password);
    setAuthUsername(nextUsername);
    setUsername(nextUsername);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    return response;
  };

  const register = async (nextUsername, email, password) => {
    setError('');
    await registerRequest(nextUsername, email, password);
    // Automatically log in with the new credentials
    return await login(nextUsername, password);
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
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
        login,
        register,
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
