import { api } from '@/lib/axios';
import type { PaginatedResponse, Enrollment } from '../types/admin.types';

export const enrollmentsService = {
  async findAll(
    page = 1,
    limit = 20,
    status?: 'active' | 'completed' | 'paused' | 'cancelled',
  ): Promise<PaginatedResponse<Enrollment>> {
    const { data } = await api.get('/admin/enrollments', {
      params: { page, limit, ...(status && { status }) },
    });
    return data;
  },

  async findById(id: string): Promise<Enrollment> {
    const { data } = await api.get(`/admin/enrollments/${id}`);
    return data.data;
  },

  async create(dto: {
    studentId: string;
    courseId: string;
    teacherId: string;
    packageType: 'foundation' | 'mastery' | 'advanced' | 'group_basic' | 'group_premium';
    startDate: string;
  }): Promise<Enrollment> {
    const { data } = await api.post('/admin/enrollments', dto);
    return data.data;
  },

  async updateStatus(id: string, status: 'active' | 'completed' | 'paused' | 'cancelled'): Promise<Enrollment> {
    const { data } = await api.patch(`/admin/enrollments/${id}/status`, { status });
    return data.data;
  },

  async updateProgress(id: string, progressPercentage: number): Promise<Enrollment> {
    const { data } = await api.patch(`/admin/enrollments/${id}/progress`, { progressPercentage });
    return data.data;
  },
};
