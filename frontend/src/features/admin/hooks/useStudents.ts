import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentsService, type StudentQueryParams } from '../services';
import type { Student, PaginatedResponse, StudentStats } from '../types';
import toast from 'react-hot-toast';

export const studentsKeys = {
  all: ['admin', 'students'] as const,
  lists: () => [...studentsKeys.all, 'list'] as const,
  list: (params: any) => [...studentsKeys.lists(), params] as const,
  details: () => [...studentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentsKeys.details(), id] as const,
  stats: () => [...studentsKeys.all, 'stats'] as const,
  studentStats: (id: string) => [...studentsKeys.all, 'studentStats', id] as const,
};

export const useStudents = (params?: StudentQueryParams) => {
  return useQuery<PaginatedResponse<Student>>({
    queryKey: studentsKeys.list(params || {}),
    queryFn: () => studentsService.findAll(params),
  });
};

export const useStudent = (id: string) => {
  return useQuery<Student>({
    queryKey: studentsKeys.detail(id),
    queryFn: () => studentsService.findById(id),
    enabled: !!id,
  });
};

export const useStudentStats = (id: string) => {
  return useQuery<StudentStats>({
    queryKey: studentsKeys.studentStats(id),
    queryFn: () => studentsService.getStudentStats(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: {
      email: string;
      fullName: string;
      temporaryPassword: string;
      sex: 'male' | 'female';
      currentLevel?: 'beginner' | 'intermediate' | 'advanced';
      country?: string;
      phoneNumber?: string;
      whatsappNumber?: string;
      paymentMethod?: 'paypal' | 'bank_transfer';
    }) => studentsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.lists() });
      toast.success('Student created successfully');
    },
    onError: (error: any) => {
      toast.error(error.error?.message || error.response?.data?.error?.message || 'Failed to create student');
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string } & Omit<Parameters<typeof studentsService.update>[1], 'id'>) =>
      studentsService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studentsKeys.details() });
      toast.success('Student updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.error?.message || error.response?.data?.error?.message || 'Failed to update student');
    },
  });
};

export const useDeactivateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => studentsService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studentsKeys.details() });
      toast.success('Student deactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error.error?.message || error.response?.data?.error?.message || 'Failed to deactivate student');
    },
  });
};

export const useActivateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => studentsService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studentsKeys.details() });
      toast.success('Student activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.error?.message || error.response?.data?.error?.message || 'Failed to activate student');
    },
  });
};
