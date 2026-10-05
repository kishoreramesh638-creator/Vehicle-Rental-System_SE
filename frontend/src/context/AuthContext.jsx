import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('driveease_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user on initialization
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('driveease_token');
      const storedUser = localStorage.getItem('driveease_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Refresh user profile in background
          const res = await api.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('driveease_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Initial session check failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('auth_expired', handleAuthExpired);
    return () => window.removeEventListener('auth_expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token: jwtToken } = res.data;

    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('driveease_token', jwtToken);
    localStorage.setItem('driveease_user', JSON.stringify(userData));

    return userData;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { user: userData, token: jwtToken } = res.data;

    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('driveease_token', jwtToken);
    localStorage.setItem('driveease_user', JSON.stringify(userData));

    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('driveease_token');
    localStorage.removeItem('driveease_user');
  };

  const updateCurrentUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem('driveease_user', JSON.stringify(merged));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'ADMIN',
    isCustomer: user?.role === 'CUSTOMER',
    login,
    register,
    logout,
    updateCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
