import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import authService, { LoginCredentials, AuthResponse } from '@/services/auth';

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInstructor: boolean;
  isAdmin: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  async function loadStoredSession() {
    try {
      const session = await authService.getStoredSession();
      if (session) {
        setUser(session.user);
        setToken(session.accessToken);
      }
    } catch (error) {
      console.error('Error loading stored session:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      console.log('🔐 Login response:', JSON.stringify(response.user, null, 2));
      console.log('🔐 User role:', response.user.role);
      setUser(response.user);
      setToken(response.accessToken);
    } catch (error) {
      console.log('🔐 Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...userData };
      authService.updateStoredUser(updatedUser).catch(() => {});

      if (typeof userData.avatar === 'string' && userData.avatar) {
        authService.updateStoredAvatar(prevUser.id, userData.avatar).catch(() => {});
      }

      return updatedUser;
    });
  }, []);

  const isAuthenticated = !!user;
  const isInstructor = user?.role === UserRole.INSTRUCTOR;
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isInstructor,
        isAdmin,
        signIn,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
