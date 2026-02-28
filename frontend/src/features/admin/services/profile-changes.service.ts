import { api } from '@/lib/axios';
import type { PaginatedResponse, ProfileChange } from '../types/admin.types';

export const profileChangesService = {
  async findAll(
    page = 1,
    limit = 20,
    status?: 'pending' | 'approved' | 'rejected',
    teacherId?: string,
  ): Promise<PaginatedResponse<ProfileChange>> {
    const { data } = await api.get('/admin/teacher-profile-changes', {
      params: { page, limit, ...(status && { status }), ...(teacherId && { teacherId }) },
    });
    return data;
  },

  async findById(id: string): Promise<ProfileChange> {
    const { data } = await api.get(`/admin/teacher-profile-changes/${id}`);
    return data.data;
  },

  async approve(id: string, notes?: string): Promise<ProfileChange> {
    const { data } = await api.patch(`/admin/teacher-profile-changes/${id}/approve`, {
      notes,
    });
    return data.data;
  },

  async reject(id: string, notes: string): Promise<ProfileChange> {
    const { data } = await api.patch(`/admin/teacher-profile-changes/${id}/reject`, { notes });
    return data.data;
  },
};
