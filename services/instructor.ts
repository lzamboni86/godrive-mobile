import api from './api';

export interface InstructorProfile {
  hourlyRate?: number;
  pixKey?: string;
}

export const instructorService = {
  // Perfil
  async updateProfile(instructorId: string, data: InstructorProfile) {
    return api.patch(`/instructor/${instructorId}/profile`, data);
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
};
