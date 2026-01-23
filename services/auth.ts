import * as SecureStore from 'expo-secure-store';
import api from './api';
import { User, UserRole } from '@/types';

const TOKEN_KEY = 'godrive_auth_token';
const USER_KEY = 'godrive_user';
const AVATAR_KEY_PREFIX = 'godrive_user_avatar_';
const LEGACY_AVATAR_KEY_PREFIX = 'godrive_user_avatar:';

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

    const storedAvatar = await this.getStoredAvatar(response.user.id);
    const user = storedAvatar ? { ...response.user, avatar: storedAvatar } : response.user;
    const auth = { ...response, user };

    await this.saveSession(auth);
    api.setAuthToken(auth.accessToken);

    return auth;
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
        const userFromStorage = JSON.parse(userJson) as User;
        const storedAvatar = await this.getStoredAvatar(userFromStorage.id);
        const user = storedAvatar ? { ...userFromStorage, avatar: storedAvatar } : userFromStorage;
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

  async updateStoredUser(user: User): Promise<void> {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  }

  async updateStoredAvatar(userId: string, avatarUri: string): Promise<void> {
    await SecureStore.setItemAsync(`${AVATAR_KEY_PREFIX}${userId}`, avatarUri);

    // Tenta remover a chave antiga (com ':') caso exista
    try {
      await SecureStore.deleteItemAsync(`${LEGACY_AVATAR_KEY_PREFIX}${userId}`);
    } catch {
      // ignore
    }
  }

  async getStoredAvatar(userId: string): Promise<string | null> {
    const current = await SecureStore.getItemAsync(`${AVATAR_KEY_PREFIX}${userId}`);
    if (current) return current;

    // Fallback: lê chave antiga (para quem já tinha avatar salvo)
    try {
      const legacy = await SecureStore.getItemAsync(`${LEGACY_AVATAR_KEY_PREFIX}${userId}`);
      if (legacy) {
        // migra para a chave nova
        await this.updateStoredAvatar(userId, legacy);
        return legacy;
      }
    } catch {
      // ignore
    }

    return null;
  }

  async refreshToken(): Promise<string | null> {
    // TODO: Implement token refresh when backend supports it
    // const response = await api.post<{ accessToken: string }>('/auth/refresh');
    // return response.accessToken;
    return null;
  }

  async forgotPassword(email: string): Promise<void> {
    return api.post('/auth/forgot-password', { email });
  }

  isInstructor(user: User | null): boolean {
    return user?.role === UserRole.INSTRUCTOR;
  }
}

export const authService = new AuthService();
export default authService;
