import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services';
import type { DashboardStats, RevenueChartData, StudentStats } from '../types';

export const dashboardKeys = {
  all: ['admin', 'dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  revenueChart: (months: number) => [...dashboardKeys.all, 'revenue', months] as const,
  studentsByCountry: () => [...dashboardKeys.all, 'students', 'country'] as const,
  studentsByPackage: () => [...dashboardKeys.all, 'students', 'package'] as const,
};

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardService.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRevenueChart = (months: number = 6) => {
  return useQuery<RevenueChartData[]>({
    queryKey: dashboardKeys.revenueChart(months),
    queryFn: () => dashboardService.getRevenueChart(months),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useStudentsByCountry = () => {
  return useQuery<StudentStats[]>({
    queryKey: dashboardKeys.studentsByCountry(),
    queryFn: () => dashboardService.getStudentsByCountry(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useStudentsByPackage = () => {
  return useQuery<StudentStats[]>({
    queryKey: dashboardKeys.studentsByPackage(),
    queryFn: () => dashboardService.getStudentsByPackage(),
    staleTime: 10 * 60 * 1000,
  });
};
