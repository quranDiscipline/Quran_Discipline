import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../services';
import type { BookingRequest, PaginatedResponse } from '../types';
import toast from 'react-hot-toast';

export const bookingRequestsKeys = {
  all: ['admin', 'booking-requests'] as const,
  lists: () => [...bookingRequestsKeys.all, 'list'] as const,
  list: (params: any) => [...bookingRequestsKeys.lists(), params] as const,
  details: () => [...bookingRequestsKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingRequestsKeys.details(), id] as const,
};

export const useBookingRequests = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery<PaginatedResponse<BookingRequest>>({
    queryKey: bookingRequestsKeys.list(params || {}),
    queryFn: () => bookingService.findAll(params),
  });
};

export const useBookingRequest = (id: string) => {
  return useQuery<BookingRequest>({
    queryKey: bookingRequestsKeys.detail(id),
    queryFn: () => bookingService.findById(id),
    enabled: !!id,
  });
};

export const useAssignBookingRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, teacherId }: { id: string; teacherId: string }) =>
      bookingService.assign(id, teacherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingRequestsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingRequestsKeys.details() });
      toast.success('Teacher assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to assign teacher');
    },
  });
};

export const useConfirmBookingRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, zoomLink, confirmedDate, confirmedTime }: {
      id: string;
      zoomLink: string;
      confirmedDate: string;
      confirmedTime: string;
    }) => bookingService.confirm(id, { zoomLink, confirmedDate, confirmedTime }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingRequestsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingRequestsKeys.details() });
      toast.success('Booking confirmed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to confirm booking');
    },
  });
};

export const useCancelBookingRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingRequestsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookingRequestsKeys.details() });
      toast.success('Booking cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to cancel booking');
    },
  });
};
