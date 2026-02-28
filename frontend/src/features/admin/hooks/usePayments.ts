import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '../services';
import type { Payment, PaginatedResponse, PaymentQueryParams } from '../types';
import toast from 'react-hot-toast';

export const paymentsKeys = {
  all: ['admin', 'payments'] as const,
  lists: () => [...paymentsKeys.all, 'list'] as const,
  list: (params: any) => [...paymentsKeys.lists(), params] as const,
  details: () => [...paymentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentsKeys.details(), id] as const,
  revenueSummary: () => [...paymentsKeys.all, 'revenue-summary'] as const,
};

export const usePayments = (params?: PaymentQueryParams) => {
  return useQuery<PaginatedResponse<Payment>>({
    queryKey: paymentsKeys.list(params || {}),
    queryFn: () => paymentsService.findAll(params),
  });
};

export const usePayment = (id: string) => {
  return useQuery<Payment>({
    queryKey: paymentsKeys.detail(id),
    queryFn: () => paymentsService.findById(id),
    enabled: !!id,
  });
};

export const useRevenueSummary = () => {
  return useQuery<{
    totalThisMonth: number;
    totalThisQuarter: number;
    totalThisYear: number;
    byPaymentMethod: Record<'paypal' | 'bank_transfer', number>;
    byPackageType: Record<string, number>;
  }>({
    queryKey: paymentsKeys.revenueSummary(),
    queryFn: () => paymentsService.getRevenueSummary(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: {
      studentId: string;
      enrollmentId: string;
      amount: number;
      paymentMethod: 'paypal' | 'bank_transfer';
      paymentDate: string;
      transactionId?: string;
    }) => paymentsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.lists() });
      toast.success('Payment created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create payment');
    },
  });
};

export const useMarkPaymentVerified = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, transactionId }: { id: string; transactionId?: string }) =>
      paymentsService.markVerified(id, transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentsKeys.details() });
      toast.success('Payment verified successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to verify payment');
    },
  });
};
