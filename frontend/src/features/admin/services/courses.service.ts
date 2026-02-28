import { api } from '@/lib/axios';
import type { Course } from '../types/admin.types';

export const coursesService = {
  async findAll(includeInactive = false): Promise<Course[]> {
    const { data } = await api.get('/admin/courses', {
      params: includeInactive ? undefined : { includeInactive: 'false' },
    });
    return data;
  },

  async findById(id: string): Promise<Course> {
    const { data } = await api.get(`/admin/courses/${id}`);
    return data.data;
  },

  async create(dto: {
    title: string;
    description: string;
    courseType: 'memorization' | 'islamic_studies' | 'understanding';
    durationMonths: number;
    priceMonthly: number;
    maxStudentsPerGroup?: number;
  }): Promise<Course> {
    const { data } = await api.post('/admin/courses', dto);
    return data.data;
  },

  async update(id: string, dto: Partial<{
    title: string;
    description: string;
    courseType: 'memorization' | 'islamic_studies' | 'understanding';
    durationMonths: number;
    priceMonthly: number;
    maxStudentsPerGroup: number;
  }>): Promise<Course> {
    const { data } = await api.patch(`/admin/courses/${id}`, dto);
    return data.data;
  },

  async deactivate(id: string): Promise<void> {
    await api.patch(`/admin/courses/${id}/deactivate`);
  },
};
