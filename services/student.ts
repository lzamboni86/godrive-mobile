import api from './api';

export interface Instructor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  vehicle?: {
    make: string;
    model: string;
    year?: number;
    plate: string;
    transmission: 'MANUAL' | 'AUTOMATIC';
    engineType: 'COMBUSTION' | 'ELECTRIC';
  };
  cnh?: string;
  hourlyRate?: number;
  state?: string;
  city?: string;
  neighborhoodReside?: string;
  neighborhoodTeach?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'UNDISCLOSED';
  completedLessonsCount?: number;
  rating?: number;
  bio?: string;
  createdAt: string;
}

export interface Lesson {
  id: string;
  instructorId: string;
  studentId: string;
  date: string;
  time: string;
  duration: number;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'EVALUATED' | 'CANCELLED';
  price: number;
  location?: string;
  instructor?: {
    name: string;
    email: string;
  };
}

export interface Payment {
  id: string;
  studentId: string;
  lessonId?: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  paymentDate?: string;
  description: string;
  createdAt: string;
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
  contactPreference: 'whatsapp' | 'email';
}

export interface ScheduleRequest {
  studentId: string;
  instructorId: string;
  lessons: {
    date: string;
    time: string;
    duration: number;
    price: number;
  }[];
  totalAmount: number;
  status: string;
}

export interface ScheduleResponse {
  id: string;
  preferenceId?: string;
  initPoint?: string;
  sandboxInitPoint?: string;
  isSandbox?: boolean;
  message: string;
}

export type InstructorSearchFilters = {
  state: string;
  city: string;
  neighborhoodTeach: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'UNDISCLOSED';
  transmission?: 'MANUAL' | 'AUTOMATIC';
  engineType?: 'COMBUSTION' | 'ELECTRIC';
};

export const studentService = {
  // Instrutores
  async getApprovedInstructors(filters?: Partial<InstructorSearchFilters>): Promise<Instructor[]> {
    const params = new URLSearchParams();

    if (filters?.state) params.set('state', filters.state);
    if (filters?.city) params.set('city', filters.city);
    if (filters?.neighborhoodTeach) params.set('neighborhoodTeach', filters.neighborhoodTeach);
    if (filters?.gender) params.set('gender', filters.gender);
    if (filters?.transmission) params.set('transmission', filters.transmission);
    if (filters?.engineType) params.set('engineType', filters.engineType);

    const qs = params.toString();
    const url = qs ? `/student/instructors/approved?${qs}` : '/student/instructors/approved';
    return api.get<Instructor[]>(url);
  },

  // Aulas
  async getStudentLessons(studentId: string): Promise<Lesson[]> {
    return api.get<Lesson[]>(`/student/lessons/student/${studentId}`);
  },

  async getUpcomingLessons(studentId: string): Promise<Lesson[]> {
    return api.get<Lesson[]>(`/student/lessons/student/${studentId}/upcoming`);
  },

  async getPastLessons(studentId: string): Promise<Lesson[]> {
    return api.get<Lesson[]>(`/student/lessons/student/${studentId}/past`);
  },

  // Pagamentos
  async getStudentPayments(studentId: string): Promise<Payment[]> {
    return api.get<Payment[]>(`/student/payments/student/${studentId}`);
  },

  async getPaymentSummary(studentId: string): Promise<{
    totalPaid: number;
    totalLessons: number;
    pendingPayments: number;
  }> {
    return api.get(`/student/payments/student/${studentId}/summary`);
  },

  // SAC
  async sendContactForm(data: ContactForm): Promise<void> {
    return api.post('/student/contact', data);
  },

  // Agendamento
  async createScheduleRequest(data: ScheduleRequest): Promise<ScheduleResponse> {
    return api.post<ScheduleResponse>('/student/schedule', data);
  },
};
