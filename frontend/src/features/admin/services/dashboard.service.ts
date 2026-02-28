import { api } from '@/lib/axios';
import type { DashboardStats, RevenueChartData, BreakdownItem } from '../types/admin.types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get('/admin/dashboard/stats');
    return data.data;
  },

  async getRevenueChart(months = 12): Promise<RevenueChartData[]> {
    const { data } = await api.get('/admin/dashboard/revenue-chart', { params: { months } });
    return data.data;
  },

  async getStudentsByCountry(): Promise<BreakdownItem[]> {
    const { data } = await api.get('/admin/dashboard/students-by-country');
    return data.data;
  },

  async getStudentsByPackage(): Promise<BreakdownItem[]> {
    const { data } = await api.get('/admin/dashboard/students-by-package');
    return data.data;
  },
};
