import { api } from '@/lib/axios';
import type { PaginatedResponse, BookingRequest } from '../types/admin.types';

export const bookingService = {
  async findAll(
    page = 1,
    limit = 20,
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  ): Promise<PaginatedResponse<BookingRequest>> {
    const { data } = await api.get('/admin/booking-requests', {
      params: { page, limit, ...(status && { status }) },
    });
    return data;
  },

  async findById(id: string): Promise<BookingRequest> {
    const { data } = await api.get(`/admin/booking-requests/${id}`);
    return data.data;
  },

  async assign(id: string, teacherId: string): Promise<BookingRequest> {
    const { data } = await api.patch(`/admin/booking-requests/${id}/assign`, { teacherId });
    return data.data;
  },

  async confirm(
    id: string,
    dto: { zoomLink: string; confirmedDate: string; confirmedTime: string },
  ): Promise<BookingRequest> {
    const { data } = await api.patch(`/admin/booking-requests/${id}/confirm`, dto);
    return data.data;
  },

  async cancel(id: string): Promise<void> {
    await api.patch(`/admin/booking-requests/${id}/cancel`);
  },
};
