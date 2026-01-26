import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { ApiError } from '@/types';

// URL da API - prioridade: variável de ambiente > app.config > manifest > fallback
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra as any)?.apiUrl ||
  ((Constants.manifest as any)?.extra as any)?.apiUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (__DEV__ ? 'http://192.168.15.14:3000' : 'https://godrive-7j7x.onrender.com'); // Produção: Render, Dev: IP local

const isLocalOrPrivateBaseUrl = (baseUrl?: string) => {
  if (!baseUrl) return false;
  try {
    const hostname = new URL(baseUrl).hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (hostname.startsWith('10.')) return true;
    if (hostname.startsWith('192.168.')) return true;

    const match = hostname.match(/^172\.(\d+)\./);
    if (!match) return false;

    const secondOctet = Number(match[1]);
    return secondOctet >= 16 && secondOctet <= 31;
  } catch {
    return false;
  }
};

class ApiService {
  private instance: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    console.log('🔧 [API] Base URL:', API_BASE_URL);
    console.log('🔧 [API] Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
    console.log('🔧 [API] Constants.manifest?.extra:', (Constants.manifest as any)?.extra);
    
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const baseURL = config.baseURL || API_BASE_URL;
        const method = (config.method || 'GET').toUpperCase();
        const url = config.url || '';
        console.log('🌐 [API]', method, `${baseURL}${url}`);

        
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        // IMPORTANTE: console.error dispara o overlay/toast vermelho do Expo no device.
        // Mantemos o log, mas como console.log para não poluir a UI.
        console.log('🌐 [API] Error details:', {
          message: error.message,
          code: error.code,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          url: error.config?.url,
        });

        const apiError: ApiError = {
          message: error.response?.data?.message || 'Erro de conexão com o servidor',
          statusCode: error.response?.status || 500,
          error: error.response?.data?.error || 'NetworkError',
        };

        if (error.code === 'ECONNABORTED') {
          apiError.message = 'Tempo de conexão esgotado. Verifique sua internet.';
        } else if (!error.response) {
          const baseURL = error.config?.baseURL || API_BASE_URL;
          if (isLocalOrPrivateBaseUrl(baseURL)) {
            apiError.message =
              'Não foi possível conectar ao servidor local. Verifique se o celular está na mesma rede Wi‑Fi do computador, sem VPN, e se a porta 3000 está liberada no firewall.';
          } else {
            apiError.message = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
          }
        }

        return Promise.reject(apiError);
      }
    );
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }
}

export const api = new ApiService();
export default api;
