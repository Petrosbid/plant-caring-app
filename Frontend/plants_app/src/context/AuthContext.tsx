// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
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

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      await authService.login(credentials);
      const profile = await authService.getProfile();
      setUserState(profile);
      await AsyncStorage.setItem('user', JSON.stringify(profile));
    } catch (error) {
      console.error('Login failed:', error);
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

