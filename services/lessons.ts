import api from './api';
import { Lesson, LessonStatus, Payment } from '@/types';

export const lessonsService = {
  async getTodayLessons(instructorId: string): Promise<Lesson[]> {
    return api.get<Lesson[]>(`/lessons/instructor/${instructorId}/today`);
  },

  async getConfirmedLessons(instructorId: string): Promise<Lesson[]> {
    const lessons = await api.get<Lesson[]>(`/lessons/instructor/${instructorId}`);
    return lessons.filter((lesson) => lesson.status === LessonStatus.CONFIRMED);
  },

  async getLessonById(id: string): Promise<Lesson> {
    return api.get<Lesson>(`/lessons/${id}`);
  },

  async updateLessonStatus(id: string, status: LessonStatus): Promise<Lesson> {
    return api.patch<Lesson>(`/lessons/${id}`, { status });
  },

  async completeLesson(id: string): Promise<Lesson> {
    return api.patch<Lesson>(`/lessons/${id}`, { status: LessonStatus.COMPLETED });
  },

  async startLesson(id: string): Promise<Lesson> {
    return api.patch<Lesson>(`/lessons/${id}`, { status: LessonStatus.IN_PROGRESS });
  },
};

export const paymentsService = {
  async releasePayment(lessonId: string): Promise<Payment> {
    return api.patch<Payment>(`/payments/release`, { lessonId });
  },

  async getReleasedBalance(instructorId: string): Promise<number> {
    const response = await api.get<{ balance: number }>(
      `/payments/instructor/${instructorId}/released-balance`
    );
    return response.balance;
  },

  async getPendingBalance(instructorId: string): Promise<number> {
    const response = await api.get<{ balance: number }>(
      `/payments/instructor/${instructorId}/pending-balance`
    );
    return response.balance;
  },

  async getInstructorPayments(instructorId: string): Promise<Payment[]> {
    return api.get<Payment[]>(`/payments/instructor/${instructorId}`);
  },
};
