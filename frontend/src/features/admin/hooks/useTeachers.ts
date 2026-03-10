import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teachersService, type TeacherQueryParams } from '../services';
import type { Teacher, PaginatedResponse, TeacherStats } from '../types';
import toast from 'react-hot-toast';

export const teachersKeys = {
  all: ['admin', 'teachers'] as const,
  lists: () => [...teachersKeys.all, 'list'] as const,
  list: (params: any) => [...teachersKeys.lists(), params] as const,
  details: () => [...teachersKeys.all, 'detail'] as const,
  detail: (id: string) => [...teachersKeys.details(), id] as const,
  stats: () => [...teachersKeys.all, 'stats'] as const,
  teacherStats: (id: string) => [...teachersKeys.all, 'teacherStats', id] as const,
};

export const useTeachers = (params?: TeacherQueryParams) => {
  return useQuery<PaginatedResponse<Teacher>>({
    queryKey: teachersKeys.list(params || {}),
    queryFn: () => teachersService.findAll(params),
  });
};

export const useTeacher = (id: string) => {
  return useQuery<Teacher>({
    queryKey: teachersKeys.detail(id),
    queryFn: () => teachersService.findById(id),
    enabled: !!id,
  });
};

export const useTeacherStats = (id: string) => {
  return useQuery<TeacherStats>({
    queryKey: teachersKeys.teacherStats(id),
    queryFn: () => teachersService.getTeacherStats(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: {
      email: string;
      fullName: string;
      temporaryPassword: string;
      sex: 'male' | 'female';
      bio: string;
      qualifications: string[];
      specializations: string[];
      hourlyRate?: number;
      profilePictureUrl?: string;
    }) => teachersService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teachersKeys.lists() });
      toast.success('Teacher created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create teacher');
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string } & Omit<Parameters<typeof teachersService.update>[1], 'id'>) =>
      teachersService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teachersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teachersKeys.details() });
      toast.success('Teacher updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update teacher');
    },
  });
};

export const useDeactivateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teachersService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teachersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teachersKeys.details() });
      toast.success('Teacher deactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to deactivate teacher');
    },
  });
};

export const useActivateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teachersService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teachersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teachersKeys.details() });
      toast.success('Teacher activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to activate teacher');
    },
  });
};
