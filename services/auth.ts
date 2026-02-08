import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import api from './api';
import { User, UserRole } from '@/types';

const TOKEN_KEY = 'godrive_auth_token';
const USER_KEY = 'godrive_user';
const AVATAR_KEY_PREFIX = 'godrive_user_avatar_';
const LEGACY_AVATAR_KEY_PREFIX = 'godrive_user_avatar:';

const isWeb = Platform.OS === 'web';

const safeLocalStorage = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ls = (globalThis as any)?.localStorage as Storage | undefined;
    return ls;
  } catch {
    return undefined;
  }
};

const storageGetItem = async (key: string): Promise<string | null> => {
  if (isWeb) {
    const ls = safeLocalStorage();
    return ls?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
};

const storageSetItem = async (key: string, value: string): Promise<void> => {
  if (isWeb) {
    const ls = safeLocalStorage();
    ls?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

const storageDeleteItem = async (key: string): Promise<void> => {
  if (isWeb) {
    const ls = safeLocalStorage();
    ls?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
};

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
    await storageDeleteItem(TOKEN_KEY);
    await storageDeleteItem(USER_KEY);
    api.setAuthToken(null);
  }

  async getStoredSession(): Promise<AuthResponse | null> {
    try {
      const token = await storageGetItem(TOKEN_KEY);
      const userJson = await storageGetItem(USER_KEY);
      
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
    await storageSetItem(TOKEN_KEY, auth.accessToken);
    await storageSetItem(USER_KEY, JSON.stringify(auth.user));
  }

  async updateStoredUser(user: User): Promise<void> {
    await storageSetItem(USER_KEY, JSON.stringify(user));
  }

  async updateStoredAvatar(userId: string, avatarUri: string): Promise<void> {
    await storageSetItem(`${AVATAR_KEY_PREFIX}${userId}`, avatarUri);

    // Tenta remover a chave antiga (com ':') caso exista
    try {
      await storageDeleteItem(`${LEGACY_AVATAR_KEY_PREFIX}${userId}`);
    } catch {
      // ignore
    }
  }

  async getStoredAvatar(userId: string): Promise<string | null> {
    const current = await storageGetItem(`${AVATAR_KEY_PREFIX}${userId}`);
    if (current) return current;

    // Fallback: lê chave antiga (para quem já tinha avatar salvo)
    try {
      const legacy = await storageGetItem(`${LEGACY_AVATAR_KEY_PREFIX}${userId}`);
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
