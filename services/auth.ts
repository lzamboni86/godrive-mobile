import * as SecureStore from 'expo-secure-store';
import api from './api';
import { User, UserRole } from '@/types';

const TOKEN_KEY = 'godrive_auth_token';
const USER_KEY = 'godrive_user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    await this.saveSession(response);
    api.setAuthToken(response.accessToken);
    
    return response;
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    api.setAuthToken(null);
  }

  async getStoredSession(): Promise<AuthResponse | null> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userJson = await SecureStore.getItemAsync(USER_KEY);
      
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        api.setAuthToken(token);
        return { user, accessToken: token };
      }
      
      return null;
    } catch {
      return null;
    }
  }

  async saveSession(auth: AuthResponse): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, auth.accessToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(auth.user));
  }

  async refreshToken(): Promise<string | null> {
    // TODO: Implement token refresh when backend supports it
    // const response = await api.post<{ accessToken: string }>('/auth/refresh');
    // return response.accessToken;
    return null;
  }

  isInstructor(user: User | null): boolean {
    return user?.role === UserRole.INSTRUCTOR;
  }
}

export const authService = new AuthService();
export default authService;
