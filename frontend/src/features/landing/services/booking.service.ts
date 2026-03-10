import { api } from '../../../lib/axios';
import type { AvailableSlot, CreateBookingRequestDto } from '../types/landing.types';

const bookingApi = {
  getAvailableDates: async (
    month: string,
    teacherSex?: 'male' | 'female',
  ): Promise<string[]> => {
    const params = new URLSearchParams();
    params.append('month', month);
    if (teacherSex) params.append('teacherSex', teacherSex);

    const response = await api.get(`/public/available-dates?${params.toString()}`);
    return response.data.data;
  },

  getAvailableSlots: async (
    date?: string,
    teacherSex?: 'male' | 'female',
  ): Promise<AvailableSlot[]> => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (teacherSex) params.append('teacherSex', teacherSex);

    const response = await api.get(`/public/available-slots?${params.toString()}`);
    return response.data.data;
  },

  createBookingRequest: async (dto: CreateBookingRequestDto): Promise<any> => {
    const response = await api.post('/public/booking-requests', dto);
    return response.data.data;
  },
};

export { bookingApi };
