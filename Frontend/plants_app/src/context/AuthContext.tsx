// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';
import type { User } from '../types';

interface RegisterOtpData {
  phone?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
  requestOtpCode: (phoneNumber: string) => Promise<void>;
  loginWithOtp: (phoneNumber: string, code: string) => Promise<void>;
  registerWithPhoneOtp: (data: RegisterOtpData) => Promise<void>;
  registerWithEmailOtp: (data: RegisterOtpData) => Promise<void>;
  verifyRegisterOtp: (identifier: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      console.log('[Auth] Checking token:', token ? 'Found' : 'Not found');
      if (token) {
        try {
          const profile = await authService.getProfile();
          console.log('[Auth] Profile fetched:', profile.username);
          setUserState(profile);
          await AsyncStorage.setItem('user', JSON.stringify(profile));
        } catch (profileError) {
          console.error('[Auth] Failed to fetch profile with existing token:', profileError);
          // If profile fetch fails but token exists, token is likely invalid/expired
          await AsyncStorage.removeItem('access_token');
          await AsyncStorage.removeItem('refresh_token');
          await AsyncStorage.removeItem('user');
          setUserState(null);
        }
      } else {
        setUserState(null);
      }
    } catch (error) {
      console.error('[Auth] Auth check internal error:', error);
      setUserState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const finishAuthSession = async () => {
    const profile = await authService.getProfile();
    setUserState(profile);
    await AsyncStorage.setItem('user', JSON.stringify(profile));
  };

  const login = async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      await authService.login(credentials);
      await finishAuthSession();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestOtpCode = async (phoneNumber: string) => {
    await authService.requestOtp(phoneNumber);
  };

  const loginWithOtp = async (phoneNumber: string, code: string) => {
    setIsLoading(true);
    try {
      await authService.verifyOtp(phoneNumber, code);
      await finishAuthSession();
    } catch (error) {
      console.error('OTP login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithPhoneOtp = async (data: RegisterOtpData) => {
    await authService.registerRequestOtp('phone', data);
  };

  const registerWithEmailOtp = async (data: RegisterOtpData) => {
    await authService.registerRequestOtp('email', data);
  };

  const verifyRegisterOtp = async (identifier: string, code: string) => {
    setIsLoading(true);
    try {
      await authService.registerVerifyOtp(identifier, code);
      await finishAuthSession();
    } catch (error) {
      console.error('Register OTP verify failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUserState(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUserState((prev) => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...userData };
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const setUser = (nextUser: User) => {
    setUserState(nextUser);
    AsyncStorage.setItem('user', JSON.stringify(nextUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
        setUser,
        checkAuth,
        requestOtpCode,
        loginWithOtp,
        registerWithPhoneOtp,
        registerWithEmailOtp,
        verifyRegisterOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

