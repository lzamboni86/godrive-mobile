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
      return data || { totalUsers: 0, pendingInstructors: 0, todayLessons: 0, completedLessons: 0, revenue: 0 };
    } catch (error) {
      console.error('🔍 [FRONTEND] Erro ao buscar dashboard:', error);
      return { totalUsers: 0, pendingInstructors: 0, todayLessons: 0, completedLessons: 0, revenue: 0 };
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
};
