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
    // Check localStorage for token (use consistent key name)
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (responseData) => {
    try {
      console.log('AuthContext login called with:', responseData);
      
      // Extract token and user from the response data
      const { token, user: userData } = responseData;
      
      if (!token) {
        console.error('No token in response data:', responseData);
        return { success: false, error: 'No token received' };
      }
      
      // Save token and user data to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('Token saved:', token);
      console.log('User saved:', userData);
      
      // Update state
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('User logged out, tokens cleared');
  };

  const register = async (userData) => {
    try {
      // Make API call to register
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Use the same login logic
        await login(data);
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
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