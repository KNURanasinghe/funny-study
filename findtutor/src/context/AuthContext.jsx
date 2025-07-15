import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
  try {
    // Store user data directly (no API call needed since TeacherAuth handles that)
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Store additional IDs for backward compatibility
    if (userData.role === 'student') {
      localStorage.setItem('studentId', userData.studentId?.toString());
    } else if (userData.role === 'teacher') {
      localStorage.setItem('teacherId', userData.teacherId?.toString());
    }
    
    return userData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

  const register = async (userData) => {
    try {
      const response = await axios.post('http://82.25.180.10:5000/api/users/', userData);
      const newUser = response.data;
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://82.25.180.10:5000/api/users/logout');
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if server logout fails
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('http://82.25.180.10:5000/api/users/profile', profileData, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      throw error.response?.data || { message: 'Profile update failed' };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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