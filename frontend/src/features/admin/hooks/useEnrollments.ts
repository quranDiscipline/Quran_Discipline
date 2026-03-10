import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enrollmentsService } from '../services';
import type { Enrollment, PaginatedResponse } from '../types';
import toast from 'react-hot-toast';

export const enrollmentsKeys = {
  all: ['admin', 'enrollments'] as const,
  lists: () => [...enrollmentsKeys.all, 'list'] as const,
  list: (params: any) => [...enrollmentsKeys.lists(), params] as const,
  details: () => [...enrollmentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...enrollmentsKeys.details(), id] as const,
};

export const useEnrollments = (params?: {
  page?: number;
  limit?: number;
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
}) => {
  return useQuery<PaginatedResponse<Enrollment>>({
    queryKey: enrollmentsKeys.list(params || {}),
    queryFn: () => enrollmentsService.findAll(params),
  });
};

export const useEnrollment = (id: string) => {
  return useQuery<Enrollment>({
    queryKey: enrollmentsKeys.detail(id),
    queryFn: () => enrollmentsService.findById(id),
    enabled: !!id,
  });
};

export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: {
      studentId: string;
      courseId: string;
      teacherId: string;
      packageType: 'foundation' | 'mastery' | 'advanced' | 'group_basic' | 'group_premium';
      startDate: string;
    }) => enrollmentsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentsKeys.lists() });
      toast.success('Enrollment created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create enrollment');
    },
  });
};

export const useUpdateEnrollmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'completed' | 'paused' | 'cancelled' }) =>
      enrollmentsService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: enrollmentsKeys.details() });
      toast.success('Enrollment status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update enrollment status');
    },
  });
};

export const useUpdateEnrollmentProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, progressPercentage }: { id: string; progressPercentage: number }) =>
      enrollmentsService.updateProgress(id, progressPercentage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: enrollmentsKeys.details() });
      toast.success('Progress updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update progress');
    },
  });
};
