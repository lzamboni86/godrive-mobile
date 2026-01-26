// Types based on backend Prisma schema

export enum LessonStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
}

export enum WalletTransactionStatus {
  AVAILABLE = 'AVAILABLE',
  LOCKED = 'LOCKED',
  USED = 'USED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  userId: string;
  user: User;
  cpf?: string;
  birthDate?: string;
  address?: string;
  enrollmentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Instructor {
  id: string;
  userId: string;
  user: User;
  cpf?: string;
  cnh: string;
  cnhCategory: string;
  cnhExpiration: string;
  vehicleId?: string;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  color: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  studentId: string;
  student: Student;
  instructorId: string;
  instructor: Instructor;
  vehicleId?: string;
  vehicle?: Vehicle;
  scheduledAt: string;
  duration: number;
  status: LessonStatus;
  notes?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  lessonId: string;
  lesson: Lesson;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
  releasedAt?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  user: User;
  amount: number;
  status: WalletTransactionStatus;
  bookingId?: string;
  paymentMethod: 'MERCADO_PAGO' | 'STRIPE' | 'OTHER';
  transactionId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalance {
  totalBalance: number;
  availableBalance: number;
  lockedBalance: number;
  usedBalance: number;
}

export interface MercadoPagoPreference {
  id: string;
  initPoint: string;
  sandboxInitPoint: string;
  items: Array<{
    id: string;
    title: string;
    description: string;
    quantity: number;
    unitPrice: number;
    currencyId: string;
  }>;
  payer: {
    email: string;
    name?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  backUrls: {
    success: string;
    failure: string;
    pending: string;
  };
  autoReturn: string;
  externalReference?: string;
}

export interface DashboardData {
  releasedBalance: number;
  pendingBalance: number;
  todayLessons: Lesson[];
  completedToday: number;
  upcomingLessons: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
