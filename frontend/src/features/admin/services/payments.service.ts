import { api } from '@/lib/axios';
import type { PaginatedResponse, Payment } from '../types/admin.types';

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: 'paypal' | 'bank_transfer';
  startDate?: string;
  endDate?: string;
}

export const paymentsService = {
  async findAll(params?: PaymentQueryParams): Promise<PaginatedResponse<Payment>> {
    const { data } = await api.get('/admin/payments', { params });
    return data;
  },

  async findById(id: string): Promise<Payment> {
    const { data } = await api.get(`/admin/payments/${id}`);
    return data.data;
  },

  async create(dto: {
    studentId: string;
    enrollmentId: string;
    amount: number;
    paymentMethod: 'paypal' | 'bank_transfer';
    paymentDate: string;
    transactionId?: string;
  }): Promise<Payment> {
    const { data } = await api.post('/admin/payments', dto);
    return data.data;
  },

  async markVerified(id: string, transactionId?: string): Promise<Payment> {
    const { data } = await api.patch(`/admin/payments/${id}/verify`, {
      transactionId,
    });
    return data.data;
  },

  async getRevenueSummary(): Promise<{
    totalThisMonth: number;
    totalThisQuarter: number;
    totalThisYear: number;
    byPaymentMethod: Record<'paypal' | 'bank_transfer', number>;
    byPackageType: Record<string, number>;
  }> {
    const { data } = await api.get('/admin/payments/summary/revenue');
    return data.data;
  },
};
