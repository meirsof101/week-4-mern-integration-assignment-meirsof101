import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state (check if user is already logged in)
  useEffect(() => {
    // Check localStorage, sessionStorage, or make API call to verify auth
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token and set user
      // For now, just set loading to false
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      // Make API call to login
      // const response = await fetch('/api/login', { ... });
      // const data = await response.json();
      
      // For now, just simulate login
      setUser({ id: 1, name: 'User', email: credentials.email });
      localStorage.setItem('authToken', 'sample-token');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const register = async (userData) => {
    try {
      // Make API call to register
      // const response = await fetch('/api/register', { ... });
      // const data = await response.json();
      
      // For now, just simulate registration
      setUser({ id: 1, name: userData.name, email: userData.email });
      localStorage.setItem('authToken', 'sample-token');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};