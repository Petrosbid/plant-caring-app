// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: { username: string; email: string; password: string; first_name?: string; last_name?: string }) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  requestOtpCode: (phoneNumber: string) => Promise<void>;
  loginWithOtp: (phoneNumber: string, code: string) => Promise<void>;
  registerWithPhoneOtp: (data: { phone: string; username: string; first_name?: string; last_name?: string }) => Promise<void>;
  registerWithEmailOtp: (data: { email: string; username: string; first_name?: string; last_name?: string }) => Promise<void>;
  verifyRegisterOtp: (identifier: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (accessToken && refreshToken) {
      const fetchUserProfile = async () => {
        try {
          const userData = await authService.getProfile();
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      };
      fetchUserProfile();
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { access, refresh } = await authService.login({ username, password });
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      const userData = await authService.getProfile();
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: { username: string; email: string; password: string; first_name?: string; last_name?: string }) => {
    try {
      const response = await authService.register(userData);
      await login(userData.username, userData.password);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const requestOtpCode = async (phoneNumber: string) => {
    try {
      await authService.requestOtp(phoneNumber);
    } catch (error) {
      console.error('Request OTP failed:', error);
      throw error;
    }
  };

  // ورود با کد یکبارمصرف
  const loginWithOtp = async (phoneNumber: string, code: string) => {
    try {
      const { access, refresh } = await authService.verifyOtp(phoneNumber, code);
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      const userData = await authService.getProfile();
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('OTP login failed:', error);
      throw error;
    }
  };
  const registerWithPhoneOtp = async (data: { phone?: string; email?: string; first_name?: string; last_name?: string; username: string; }) => {
  await authService.registerRequestOtp('phone', data);
};
const registerWithEmailOtp = async (data: { phone?: string; email?: string; first_name?: string; last_name?: string; username: string; }) => {
  await authService.registerRequestOtp('email', data);
};
const verifyRegisterOtp = async (identifier: string, code: string) => {
  const response = await authService.registerVerifyOtp(identifier, code);
  const userData = await authService.getProfile(); 
  setUser(userData);
  setIsAuthenticated(true);
};
  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser, isAuthenticated, requestOtpCode, loginWithOtp }}>
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