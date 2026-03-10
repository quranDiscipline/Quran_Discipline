import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherSchedulesApi, CreateScheduleDto, UpdateScheduleDto, BlockDateDto, BulkScheduleDto } from '../services/teacher-schedules.service';

// Query keys
export const teacherSchedulesKeys = {
  all: ['teacher-schedules'] as const,
  lists: () => [...teacherSchedulesKeys.all, 'list'] as const,
  list: (filters?: { teacherId?: string; isAvailable?: boolean }) =>
    [...teacherSchedulesKeys.lists(), filters] as const,
  details: () => [...teacherSchedulesKeys.all, 'detail'] as const,
  detail: (id: string) => [...teacherSchedulesKeys.details(), id] as const,
  teacher: (teacherId: string) => [...teacherSchedulesKeys.all, 'teacher', teacherId] as const,
  blockedDates: (filters?: { startDate?: string; endDate?: string; teacherId?: string }) =>
    [...teacherSchedulesKeys.all, 'blocked-dates', filters] as const,
};

// Get all schedules with pagination
export const useTeacherSchedules = (filters?: {
  page?: number;
  limit?: number;
  teacherId?: string;
  isAvailable?: boolean;
}) => {
  return useQuery({
    queryKey: teacherSchedulesKeys.list(filters),
    queryFn: () => teacherSchedulesApi.getAllSchedules(filters),
  });
};

// Get schedules for a specific teacher
export const useTeacherSchedulesByTeacher = (teacherId: string) => {
  return useQuery({
    queryKey: teacherSchedulesKeys.teacher(teacherId),
    queryFn: () => teacherSchedulesApi.getTeacherSchedules(teacherId),
    enabled: !!teacherId,
  });
};

// Get a single schedule by ID
export const useSchedule = (id: string) => {
  return useQuery({
    queryKey: teacherSchedulesKeys.detail(id),
    queryFn: () => teacherSchedulesApi.getScheduleById(id),
    enabled: !!id,
  });
};

// Get blocked dates
export const useBlockedDates = (filters?: {
  startDate?: string;
  endDate?: string;
  teacherId?: string;
}) => {
  return useQuery({
    queryKey: teacherSchedulesKeys.blockedDates(filters),
    queryFn: () => teacherSchedulesApi.getBlockedDates(filters),
  });
};

// Create schedule mutation
export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateScheduleDto) => teacherSchedulesApi.createSchedule(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherSchedulesKeys.lists() });
    },
  });
};

// Bulk create schedules mutation
export const useBulkCreateSchedules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: BulkScheduleDto) => teacherSchedulesApi.bulkCreateSchedules(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherSchedulesKeys.lists() });
    },
  });
};

// Update schedule mutation
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateScheduleDto }) =>
      teacherSchedulesApi.updateSchedule(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teacherSchedulesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teacherSchedulesKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: teacherSchedulesKeys.teacher(variables.dto.teacherId || '') });
    },
  });
};

// Delete schedule mutation
export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teacherSchedulesApi.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherSchedulesKeys.lists() });
    },
  });
};

// Copy schedules mutation
export const useCopySchedules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fromTeacherId, toTeacherId }: { fromTeacherId: string; toTeacherId: string }) =>
      teacherSchedulesApi.copySchedules(fromTeacherId, toTeacherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherSchedulesKeys.lists() });
    },
  });
};

// Block date mutation
export const useBlockDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: BlockDateDto) => teacherSchedulesApi.blockDate(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherSchedulesKeys.all });
    },
  });
};

// Unblock date mutation
export const useUnblockDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teacherSchedulesApi.unblockDate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherSchedulesKeys.all });
    },
  });
};
