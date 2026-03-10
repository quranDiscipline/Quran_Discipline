import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../services/booking.service';
import type { AvailableSlot } from '../types/landing.types';

export const bookingKeys = {
  all: ['booking'] as const,
  dates: (filters?: { month?: string; teacherSex?: 'male' | 'female' }) =>
    [...bookingKeys.all, 'dates', filters] as const,
  slots: (filters?: { date?: string; teacherSex?: 'male' | 'female' }) =>
    [...bookingKeys.all, 'slots', filters] as const,
};

export const useAvailableDates = (
  month: string,
  teacherSex?: 'male' | 'female',
) => {
  return useQuery<string[]>({
    queryKey: bookingKeys.dates({ month, teacherSex }),
    queryFn: () => bookingApi.getAvailableDates(month, teacherSex),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!month, // Only run when month is provided
  });
};

export const useAvailableSlots = (
  date?: string,
  teacherSex?: 'male' | 'female',
) => {
  return useQuery<AvailableSlot[]>({
    queryKey: bookingKeys.slots({ date, teacherSex }),
    queryFn: () => bookingApi.getAvailableSlots(date, teacherSex),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
