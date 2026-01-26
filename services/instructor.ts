import api from './api';

export interface InstructorProfile {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  hourlyRate?: number;
  pixKey?: string;
  bio?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
  contactPreference: 'whatsapp' | 'email';
}

export const instructorService = {
  // Perfil
  async getProfile(instructorId: string) {
    return api.get(`/instructor/${instructorId}/profile`);
  },

  async updateProfile(data: InstructorProfile) {
    return api.patch(`/instructor/profile`, data);
  },

  // Solicitações
  async getLessonRequests(instructorId: string) {
    return api.get(`/instructor/${instructorId}/requests`);
  },

  // Pagamentos
  async getPayments(instructorId: string) {
    return api.get(`/instructor/${instructorId}/payments`);
  },

  async getPaymentsSummary(instructorId: string) {
    return api.get(`/instructor/${instructorId}/payments/summary`);
  },

  // Aprovações
  async approveRequest(requestId: string) {
    return api.patch(`/instructor/requests/${requestId}/approve`);
  },

  async rejectRequest(requestId: string) {
    return api.patch(`/instructor/requests/${requestId}/reject`);
  },

  // SAC
  async sendContactForm(data: ContactForm): Promise<any> {
    console.log('📧 [API] Enviando formulário de contato para /instructor/contact');
    console.log('📧 [API] Payload:', JSON.stringify(data, null, 2));
    
    try {
      const response = await api.post('/instructor/contact', data);
      console.log('📧 [API] ✅ Resposta recebida:', response);
      return response;
    } catch (error: any) {
      console.error('📧 [API] ❌ Erro na requisição:', error);
      console.error('📧 [API] ❌ Status:', error?.response?.status);
      console.error('📧 [API] ❌ Data:', error?.response?.data);
      throw error;
    }
  },
};
