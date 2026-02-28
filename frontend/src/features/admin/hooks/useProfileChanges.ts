import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileChangesService } from '../services';
import type { ProfileChange, PaginatedResponse } from '../types';
import toast from 'react-hot-toast';

export const profileChangesKeys = {
  all: ['admin', 'profile-changes'] as const,
  lists: () => [...profileChangesKeys.all, 'list'] as const,
  list: (params: any) => [...profileChangesKeys.lists(), params] as const,
  details: () => [...profileChangesKeys.all, 'detail'] as const,
  detail: (id: string) => [...profileChangesKeys.details(), id] as const,
};

export const useProfileChanges = (params?: { page?: number; limit?: number; status?: string; teacherId?: string }) => {
  return useQuery<PaginatedResponse<ProfileChange>>({
    queryKey: profileChangesKeys.list(params || {}),
    queryFn: () => profileChangesService.findAll(params?.page, params?.limit, params?.status as any, params?.teacherId),
  });
};

export const useProfileChange = (id: string) => {
  return useQuery<ProfileChange>({
    queryKey: profileChangesKeys.detail(id),
    queryFn: () => profileChangesService.findById(id),
    enabled: !!id,
  });
};

export const useApproveProfileChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      profileChangesService.approve(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileChangesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: profileChangesKeys.details() });
      toast.success('Profile change approved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to approve profile change');
    },
  });
};

export const useRejectProfileChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      profileChangesService.reject(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileChangesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: profileChangesKeys.details() });
      toast.success('Profile change rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to reject profile change');
    },
  });
};
