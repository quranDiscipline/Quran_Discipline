import { api } from '@/lib/axios';
import type { PaginatedResponse, Student } from '../types/admin.types';

export interface StudentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  subscriptionStatus?: 'trial' | 'active' | 'paused' | 'cancelled';
  currentLevel?: 'beginner' | 'intermediate' | 'advanced';
  sex?: 'male' | 'female';
}

export const studentsService = {
  async findAll(params?: StudentQueryParams): Promise<PaginatedResponse<Student>> {
    const { data } = await api.get('/admin/students', { params });
    return data;
  },

  async findById(id: string): Promise<Student> {
    const { data } = await api.get(`/admin/students/${id}`);
    return data.data;
  },

  async create(dto: {
    email: string;
    fullName: string;
    sex: 'male' | 'female';
    temporaryPassword: string;
    currentLevel: 'beginner' | 'intermediate' | 'advanced';
    country?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
    paymentMethod?: 'paypal' | 'bank_transfer';
  }): Promise<Student> {
    const { data } = await api.post('/admin/students', dto);
    return data.data;
  },

  async update(id: string, dto: Partial<{
    fullName: string;
    currentLevel: 'beginner' | 'intermediate' | 'advanced';
    phoneNumber: string;
    whatsappNumber: string;
    country: string;
    paymentMethod: 'paypal' | 'bank_transfer';
  }>): Promise<Student> {
    const { data } = await api.patch(`/admin/students/${id}`, dto);
    return data.data;
  },

  async deactivate(id: string): Promise<void> {
    await api.patch(`/admin/students/${id}/deactivate`);
  },

  async getStats(id: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    currentStreak: number;
    progressOverview: {
      totalCourses: number;
      activeCourses: number;
      completedCourses: number;
      averageProgress: number;
    };
  }> {
    const { data } = await api.get(`/admin/students/${id}/stats`);
    return data.data;
  },
};
