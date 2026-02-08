import api from './api';

export interface Instructor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  vehicle: string;
  cnh: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  totalLessons: number;
  completedLessons: number;
  createdAt: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Dashboard {
  totalUsers: number;
  pendingInstructors: number;
  todayLessons: number;
  completedLessons: number;
  revenue: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: 'USER_REGISTERED' | 'INSTRUCTOR_PENDING' | 'LESSON_COMPLETED' | 'INSTRUCTOR_APPROVED' | 'INSTRUCTOR_REJECTED';
  description: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

export interface PayoutLesson {
  id: string;
  instructorName: string;
  instructorEmail: string;
  amount: number;
  evaluatedAt: string;
  expectedPayoutDate: string;
  daysUntilPayout: number;
}

export interface PayoutSummary {
  totalPending: number;
  totalAmount: number;
  lessons: PayoutLesson[];
}

export interface PayoutResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface PayoutBatchResult {
  processed: number;
  success: number;
  failed: number;
  errors: Array<{ lessonId: string; error: string }>;
}

export const adminService = {
  async getInstructors(): Promise<Instructor[]> {
    console.log('🔍 [FRONTEND] Buscando instrutores...');
    try {
      const data = await api.get<Instructor[]>('/admin/instructors');
      console.log('🔍 [FRONTEND] Response instrutores:', data);
      return data || [];
    } catch (error) {
      console.error('🔍 [FRONTEND] Erro ao buscar instrutores:', error);
      return [];
    }
  },

  async getStudents(): Promise<Student[]> {
    console.log('🔍 [FRONTEND] Buscando alunos...');
    try {
      const data = await api.get<Student[]>('/admin/students');
      console.log('🔍 [FRONTEND] Response alunos:', data);
      return data || [];
    } catch (error) {
      console.error('🔍 [FRONTEND] Erro ao buscar alunos:', error);
      return [];
    }
  },

  async getDashboard(): Promise<Dashboard> {
    console.log('🔍 [FRONTEND] Buscando dashboard...');
    try {
      const data = await api.get<Dashboard>('/admin/dashboard');
      console.log('🔍 [FRONTEND] Response dashboard:', data);
      return data || { totalUsers: 0, pendingInstructors: 0, todayLessons: 0, completedLessons: 0, revenue: 0, recentActivities: [] };
    } catch (error) {
      console.error('🔍 [FRONTEND] Erro ao buscar dashboard:', error);
      return { totalUsers: 0, pendingInstructors: 0, todayLessons: 0, completedLessons: 0, revenue: 0, recentActivities: [] };
    }
  },

  async approveInstructor(id: string): Promise<void> {
    console.log('🔍 [FRONTEND] Aprovando instrutor:', id);
    try {
      await api.post(`/admin/instructors/${id}/approve`);
      console.log('🔍 [FRONTEND] Instrutor aprovado com sucesso');
    } catch (error) {
      console.error('🔍 [FRONTEND] Erro ao aprovar instrutor:', error);
      throw error;
    }
  },

  async rejectInstructor(id: string): Promise<void> {
    console.log('🔍 [FRONTEND] Rejeitando instrutor:', id);
    try {
      await api.post(`/admin/instructors/${id}/reject`);
      console.log('🔍 [FRONTEND] Instrutor rejeitado com sucesso');
    } catch (error) {
      console.error('🔍 [FRONTEND] Erro ao rejeitar instrutor:', error);
      throw error;
    }
  },

  // Financeiro
  async getPayments(): Promise<any[]> {
    console.log('🔍 [FRONTEND] Buscando pagamentos...');
    try {
      const data = await api.get<any[]>('/admin/payments');
      console.log('🔍 [FRONTEND] Response pagamentos:', data);
      return data || [];
    } catch (error) {
      console.error('🔍 [FRONTEND] Erro ao buscar pagamentos:', error);
      return [];
    }
  },

  async processPayment(paymentId: string): Promise<void> {
    console.log('🔍 [FRONTEND] Processando pagamento:', paymentId);
    try {
      await api.post(`/admin/payments/${paymentId}/process`);
      console.log('🔍 [FRONTEND] Pagamento processado com sucesso');
    } catch (error) {
      console.error('🔍 [FRONTEND] Erro ao processar pagamento:', error);
      throw error;
    }
  },

  async generateInvoice(paymentId: string): Promise<void> {
    console.log('🔍 [FRONTEND] Gerando nota fiscal:', paymentId);
    try {
      await api.post(`/admin/payments/${paymentId}/invoice`);
      console.log('🔍 [FRONTEND] Nota fiscal gerada com sucesso');
    } catch (error) {
      console.error('🔍 [FRONTEND] Erro ao gerar nota fiscal:', error);
      throw error;
    }
  },

  async getLogs(): Promise<any[]> {
    console.log('🔍 [FRONTEND] Buscando logs...');
    try {
      const data = await api.get<any[]>('/admin/logs');
      console.log('🔍 [FRONTEND] Response logs:', data);
      return data || [];
    } catch (error) {
      console.error('🔍 [FRONTEND] Erro ao buscar logs:', error);
      return [];
    }
  },

  // ========== PAYOUTS ==========

  async getPayoutSummary(): Promise<PayoutSummary> {
    console.log('💸 [FRONTEND] Buscando resumo de payouts...');
    try {
      const data = await api.get<PayoutSummary>('/admin/payouts/summary');
      console.log('💸 [FRONTEND] Response payout summary:', data);
      return data || { totalPending: 0, totalAmount: 0, lessons: [] };
    } catch (error) {
      console.error('💸 [FRONTEND] Erro ao buscar resumo de payouts:', error);
      return { totalPending: 0, totalAmount: 0, lessons: [] };
    }
  },

  async anticipatePayout(lessonId: string): Promise<PayoutResult> {
    console.log('💸 [FRONTEND] Antecipando payout:', lessonId);
    try {
      const data = await api.post<PayoutResult>(`/admin/payouts/${lessonId}/anticipate`);
      console.log('💸 [FRONTEND] Payout antecipado:', data);
      return data;
    } catch (error: any) {
      console.error('💸 [FRONTEND] Erro ao antecipar payout:', error);
      throw error;
    }
  },

  async retryPayout(lessonId: string): Promise<PayoutResult> {
    console.log('💸 [FRONTEND] Reprocessando payout:', lessonId);
    try {
      const data = await api.post<PayoutResult>(`/admin/payouts/${lessonId}/retry`);
      console.log('💸 [FRONTEND] Payout reprocessado:', data);
      return data;
    } catch (error: any) {
      console.error('💸 [FRONTEND] Erro ao reprocessar payout:', error);
      throw error;
    }
  },

  async processAllPayouts(): Promise<PayoutBatchResult> {
    console.log('💸 [FRONTEND] Processando todos os payouts...');
    try {
      const data = await api.post<PayoutBatchResult>('/admin/payouts/process-all');
      console.log('💸 [FRONTEND] Payouts processados:', data);
      return data;
    } catch (error: any) {
      console.error('💸 [FRONTEND] Erro ao processar payouts:', error);
      throw error;
    }
  },
};
