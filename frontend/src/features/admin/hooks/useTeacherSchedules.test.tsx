import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import {
  useTeacherSchedules,
  useBlockedDates,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useBlockDate,
  useUnblockDate,
} from './useTeacherSchedules';
import * as teacherSchedulesService from '../services/teacher-schedules.service';

// Mock the service
vi.mock('../services/teacher-schedules.service', () => ({
  teacherSchedulesApi: {
    getAllSchedules: vi.fn(),
    getBlockedDates: vi.fn(),
    createSchedule: vi.fn(),
    updateSchedule: vi.fn(),
    deleteSchedule: vi.fn(),
    blockDate: vi.fn(),
    unblockDate: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useTeacherSchedules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useTeacherSchedules', () => {
    it('should fetch schedules successfully', async () => {
      const mockData = {
        data: [
          {
            id: 'schedule-1',
            teacherId: 'teacher-1',
            dayOfWeek: 'monday',
            startTime: '10:00',
            endTime: '11:00',
            isAvailable: true,
            maxStudents: null,
          },
        ],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };

      vi.spyOn(teacherSchedulesService.teacherSchedulesApi, 'getAllSchedules').mockResolvedValue(
        mockData as any,
      );

      const { result } = renderHook(() => useTeacherSchedules({ page: 1, limit: 20 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });

    it('should pass filters to API call', async () => {
      vi.spyOn(teacherSchedulesService.teacherSchedulesApi, 'getAllSchedules').mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      });

      renderHook(() => useTeacherSchedules({ teacherId: 'teacher-1', isAvailable: true }), {
        wrapper: createWrapper(),
      });

      await waitFor(() =>
        expect(teacherSchedulesService.teacherSchedulesApi.getAllSchedules).toHaveBeenCalledWith({
          teacherId: 'teacher-1',
          isAvailable: true,
        }),
      );
    });
  });

  describe('useBlockedDates', () => {
    it('should fetch blocked dates successfully', async () => {
      const mockData = [
        {
          id: 'block-1',
          teacherId: 'teacher-1',
          date: '2026-12-25',
          reason: 'Holiday',
          createdBy: 'admin-1',
        },
      ];

      vi.spyOn(teacherSchedulesService.teacherSchedulesApi, 'getBlockedDates').mockResolvedValue(
        mockData as any,
      );

      const { result } = renderHook(
        () => useBlockedDates({ startDate: '2026-12-01', endDate: '2026-12-31' }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useCreateSchedule', () => {
    it('should create schedule and invalidate queries', async () => {
      const mockSchedule = {
        id: 'schedule-1',
        teacherId: 'teacher-1',
        dayOfWeek: 'monday',
        startTime: '10:00',
        endTime: '11:00',
        isAvailable: true,
        maxStudents: null,
      };

      vi.spyOn(teacherSchedulesService.teacherSchedulesApi, 'createSchedule').mockResolvedValue(
        mockSchedule as any,
      );

      const { result } = renderHook(() => useCreateSchedule(), {
        wrapper: createWrapper(),
      });

      const mutation = result.current;

      await mutation.mutateAsync(mockSchedule as any);

      expect(teacherSchedulesService.teacherSchedulesApi.createSchedule).toHaveBeenCalledWith(
        mockSchedule,
      );
    });
  });

  describe('useUpdateSchedule', () => {
    it('should update schedule', async () => {
      const mockSchedule = {
        id: 'schedule-1',
        teacherId: 'teacher-1',
        isAvailable: false,
      };

      vi.spyOn(teacherSchedulesService.teacherSchedulesApi, 'updateSchedule').mockResolvedValue(
        mockSchedule as any,
      );

      const { result } = renderHook(() => useUpdateSchedule(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ id: 'schedule-1', dto: { isAvailable: false } });

      expect(teacherSchedulesService.teacherSchedulesApi.updateSchedule).toHaveBeenCalledWith(
        'schedule-1',
        { isAvailable: false },
      );
    });
  });

  describe('useDeleteSchedule', () => {
    it('should delete schedule', async () => {
      vi.spyOn(teacherSchedulesService.teacherSchedulesApi, 'deleteSchedule').mockResolvedValue(
        undefined,
      );

      const { result } = renderHook(() => useDeleteSchedule(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('schedule-1');

      expect(teacherSchedulesService.teacherSchedulesApi.deleteSchedule).toHaveBeenCalledWith(
        'schedule-1',
      );
    });
  });

  describe('useBlockDate', () => {
    it('should block date', async () => {
      const mockBlock = {
        id: 'block-1',
        teacherId: 'teacher-1',
        date: '2026-12-25',
        reason: 'Holiday',
      };

      vi.spyOn(teacherSchedulesService.teacherSchedulesApi, 'blockDate').mockResolvedValue(
        mockBlock as any,
      );

      const { result } = renderHook(() => useBlockDate(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(mockBlock as any);

      expect(teacherSchedulesService.teacherSchedulesApi.blockDate).toHaveBeenCalledWith(mockBlock);
    });
  });

  describe('useUnblockDate', () => {
    it('should unblock date', async () => {
      vi.spyOn(teacherSchedulesService.teacherSchedulesApi, 'unblockDate').mockResolvedValue(
        undefined,
      );

      const { result } = renderHook(() => useUnblockDate(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('block-1');

      expect(teacherSchedulesService.teacherSchedulesApi.unblockDate).toHaveBeenCalledWith('block-1');
    });
  });
});
