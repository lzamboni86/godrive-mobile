import * as FileSystem from 'expo-file-system/legacy';
import api from './api';

export interface UploadResponse {
  url: string;
  message?: string;
}

class UploadService {
  /**
   * Faz upload de uma imagem (multipart/form-data) para o backend.
   * Retorna a URL pública da imagem salva.
   */
  async uploadImage(imageUri: string): Promise<UploadResponse> {
    try {
      // Garante que a URI seja válida e acessível
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Arquivo de imagem não encontrado.');
      }

      // Cria FormData para multipart
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg', // Forçamos JPEG para compatibilidade
        name: `avatar_${Date.now()}.jpg`,
      } as any);

      // Envia para endpoint de upload (multipart)
      const response = await api.post<UploadResponse>('/instructor/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error: any) {
      console.error('Erro no upload de imagem:', error);
      throw new Error(error?.message || 'Não foi possível fazer upload da imagem.');
    }
  }
}

export const uploadService = new UploadService();
export default uploadService;
