// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, fetchUserProfile, registerUser, deleteUser } from '../api';

interface User {
  username: string;
  email: string;
  // Add other fields as needed
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  deleteUser: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const getUser = async () => {
        try {
          const user = await fetchUserProfile(token);
          setUser(user);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };
      getUser();
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      const response = await loginUser({ username, password });
      if (response?.access_token) {
        setToken(response.access_token);
        localStorage.setItem('token', response.access_token);
        const userProfile = await fetchUserProfile(response.access_token);
        setUser(userProfile);
        alert('Login successful!');
        navigate('/findstock');
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert('Login failed. Please check your credentials and try again.');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      await registerUser({ username, email, password });
      // Stay on the same page after registration
      // User can now login with the registered credentials
      alert('Registration successful! You can now log in with your credentials.');
    } catch (error) {
      console.error("Registration failed:", error);
      alert('Registration failed. Please try again with a different username or email.');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    navigate('/');
  };

  const deleteUserAccount = async (username: string, password: string) => {
    try {
      await deleteUser(username, password);
      // After successful deletion, log the user out
      alert('Account deleted successfully.');
      logout();
    } catch (error) {
      console.error("Delete user failed:", error);
      alert('Failed to delete account. Please check your credentials and try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, deleteUser: deleteUserAccount }}>
      {children}
    </AuthContext.Provider>
  );
};
