import { api } from '@/lib/axios';
import type { PaginatedResponse, Teacher } from '../types/admin.types';

export interface TeacherQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sex?: 'male' | 'female';
  isAvailable?: boolean;
}

export const teachersService = {
  async findAll(params?: TeacherQueryParams): Promise<PaginatedResponse<Teacher>> {
    const { data } = await api.get('/admin/teachers', { params });
    return data;
  },

  async findById(id: string): Promise<Teacher> {
    const { data } = await api.get(`/admin/teachers/${id}`);
    return data.data;
  },

  async create(dto: {
    email: string;
    fullName: string;
    sex: 'male' | 'female';
    temporaryPassword: string;
    bio?: string;
    qualifications?: string[];
    specializations?: string[];
    phoneNumber?: string;
    whatsappNumber?: string;
    country?: string;
    hourlyRate?: number;
  }): Promise<Teacher> {
    const { data } = await api.post('/admin/teachers', dto);
    return data.data;
  },

  async update(id: string, dto: Partial<{
    fullName: string;
    bio: string;
    qualifications: string[];
    specializations: string[];
    phoneNumber: string;
    whatsappNumber: string;
    country?: string;
    hourlyRate?: number;
    isAvailable?: boolean;
  }>): Promise<Teacher> {
    const { data } = await api.patch(`/admin/teachers/${id}`, dto);
    return data.data;
  },

  async deactivate(id: string): Promise<void> {
    await api.patch(`/admin/teachers/${id}/deactivate`);
  },

  async getStats(id: string): Promise<{
    totalStudents: number;
    activeSessions: number;
    rating: number;
    joinedDate: string;
  }> {
    const { data } = await api.get(`/admin/teachers/${id}/stats`);
    return data.data;
  },
};
