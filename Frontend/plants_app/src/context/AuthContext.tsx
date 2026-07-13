// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { authService, API_BASE_URL } from "../services/api";
import { getAccessToken, clearTokens, saveTokens } from "../utils/tokenStorage";

WebBrowser.maybeCompleteAuthSession();
import { registerPushNotifications } from "../services/notifications";
import type { User } from "../types";

interface RegisterOtpData {
  phone?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  username: string;
  password?: string;
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
  verifyRegisterOtp: (
    identifier: string,
    code: string,
    password?: string,
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        try {
          // If token is found, try to get profile.
          // Our API service will automatically handle refreshing if this 401s.
          const profile = await authService.getProfile();
          setUserState(profile);
          await AsyncStorage.setItem("user", JSON.stringify(profile));
        } catch (profileError) {
          console.error("[Auth] Failed to fetch profile:", profileError);
          // If even after refresh attempt it fails, clear everything
          await clearTokens();
          await AsyncStorage.removeItem("user");
          setUserState(null);
        }
      } else {
        // No access token, check if we have user in storage as fallback (unlikely without token)
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          try {
            // Check if we can get profile with existing tokens (might trigger refresh)
            const profile = await authService.getProfile();
            setUserState(profile);
          } catch {
            setUserState(null);
            await clearTokens();
            await AsyncStorage.removeItem("user");
          }
        } else {
          setUserState(null);
        }
      }
    } catch (error) {
      console.error("[Auth] Auth check internal error:", error);
      setUserState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      registerPushNotifications(user, setUser);
    }
  }, [user]);

  const finishAuthSession = async () => {
    const profile = await authService.getProfile();
    setUserState(profile);
    await AsyncStorage.setItem("user", JSON.stringify(profile));
  };

  const login = async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      await authService.login(credentials);
      await finishAuthSession();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestOtpCode = async (
    phoneNumber: string,
  ): Promise<void> => {
    await authService.requestOtp(phoneNumber);
  };

  const loginWithOtp = async (phoneNumber: string, code: string) => {
    setIsLoading(true);
    try {
      await authService.verifyOtp(phoneNumber, code);
      await finishAuthSession();
    } catch (error) {
      console.error("OTP login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithPhoneOtp = async (
    data: RegisterOtpData,
  ): Promise<void> => {
    await authService.registerRequestOtp("phone", data);
  };

  const registerWithEmailOtp = async (
    data: RegisterOtpData,
  ): Promise<void> => {
    await authService.registerRequestOtp("email", data);
  };

  const verifyRegisterOtp = async (
    identifier: string,
    code: string,
    password?: string,
  ) => {
    setIsLoading(true);
    try {
      await authService.registerVerifyOtp(identifier, code, password);
      await finishAuthSession();
    } catch (error) {
      console.error("Register OTP verify failed:", error);
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
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = Linking.createURL("redirect");
      const authUrl = `${API_BASE_URL}/auth/google/login/?state=${encodeURIComponent(redirectUrl)}`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type === "success" && result.url) {
        const parsed = Linking.parse(result.url);
        const { access, refresh } = parsed.queryParams || {};

        if (access && refresh) {
          await saveTokens(access as string, refresh as string);
          await finishAuthSession();
        } else {
          throw new Error("Authentication failed: No tokens returned");
        }
      }
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUserState((prev) => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...userData };
      AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const setUser = (nextUser: User) => {
    setUserState(nextUser);
    AsyncStorage.setItem("user", JSON.stringify(nextUser));
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
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
