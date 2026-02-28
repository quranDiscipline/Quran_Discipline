import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { coursesService } from '../services';
import type { Course, PaginatedResponse } from '../types';
import toast from 'react-hot-toast';

export const coursesKeys = {
  all: ['admin', 'courses'] as const,
  lists: () => [...coursesKeys.all, 'list'] as const,
  list: (params: any) => [...coursesKeys.lists(), params] as const,
  details: () => [...coursesKeys.all, 'detail'] as const,
  detail: (id: string) => [...coursesKeys.details(), id] as const,
};

export const useCourses = (params?: { page?: number; limit?: number; search?: string; courseType?: string; isActive?: boolean }) => {
  return useQuery<PaginatedResponse<Course>>({
    queryKey: coursesKeys.list(params || {}),
    queryFn: () => coursesService.findAll(params),
  });
};

export const useCourse = (id: string) => {
  return useQuery<Course>({
    queryKey: coursesKeys.detail(id),
    queryFn: () => coursesService.findById(id),
    enabled: !!id,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: {
      title: string;
      description: string;
      courseType: 'memorization' | 'islamic_studies' | 'understanding';
      basePrice: number;
      durationWeeks: number;
      imageUrl?: string;
    }) => coursesService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesKeys.lists() });
      toast.success('Course created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create course');
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string } & Omit<Parameters<typeof coursesService.update>[1], 'id'>) =>
      coursesService.update(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: coursesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: coursesKeys.details() });
      toast.success('Course updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update course');
    },
  });
};

export const useDeactivateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => coursesService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: coursesKeys.details() });
      toast.success('Course deactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to deactivate course');
    },
  });
};

export const useActivateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => coursesService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: coursesKeys.details() });
      toast.success('Course activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to activate course');
    },
  });
};
