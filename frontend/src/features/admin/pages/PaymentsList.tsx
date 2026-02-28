import { useState } from 'react';
import { PageHeader, StatusBadge, DataTable, ConfirmModal, type Column } from '../components/shared';
import { usePayments, useMarkPaymentVerified } from '../hooks';
import type { Payment } from '../types';
import { Eye, CheckCircle, Plus, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export const PaymentsList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [verifyModal, setVerifyModal] = useState<{
    isOpen: boolean;
    payment: Payment | null;
  }>({ isOpen: false, payment: null });

  const { data, isLoading } = usePayments({
    page,
    limit: 20,
    status: statusFilter || undefined,
    paymentMethod: methodFilter || undefined,
  });
  const verifyMutation = useMarkPaymentVerified();

  const columns: Column<Payment>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (payment) => (
        <div>
          <p className="font-medium text-gray-900">{payment.enrollment?.student?.user?.fullName || 'N/A'}</p>
          <p className="text-sm text-gray-500">{payment.enrollment?.student?.user?.email || ''}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (payment) => (
        <span className="font-semibold text-gray-900">${payment.amount}</span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (payment) => (
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gray-500" />
          <span className="capitalize text-gray-900">{payment.paymentMethod}</span>
        </div>
      ),
    },
    {
      key: 'paymentDate',
      header: 'Date',
      render: (payment) => (
        <span className="text-gray-900">
          {payment.paymentDate ? format(new Date(payment.paymentDate), 'MMM d, yyyy') : 'N/A'}
        </span>
      ),
    },
    {
      key: 'transactionId',
      header: 'Transaction ID',
      render: (payment) => (
        <span className="text-sm text-gray-600 font-mono">
          {payment.transactionId || 'N/A'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (payment) => <StatusBadge status={payment.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Manage student payments and transactions"
        action={{
          label: 'Record Payment',
          onClick: () => {/* Navigate to create */},
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">All Methods</option>
          <option value="paypal">PayPal</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        search={{ value: search, onChange: setSearch, placeholder: 'Search by transaction ID...' }}
        pagination={
          data?.meta
            ? {
                page,
                limit: 20,
                total: data.meta.total,
                totalPages: data.meta.totalPages,
                onPageChange: setPage,
              }
            : undefined
        }
        actions={(payment) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {/* Navigate to detail */}}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {payment.status === 'pending' && (
              <button
                onClick={() => setVerifyModal({ isOpen: true, payment })}
                className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                title="Mark as Verified"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      />

      {/* Verify Payment Modal */}
      {verifyModal.isOpen && verifyModal.payment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Verify Payment</h3>
                <p className="text-sm text-gray-500">
                  ${verifyModal.payment.amount} from {verifyModal.payment.enrollment?.student?.user?.fullName}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter transaction ID..."
                className="w-full h-11 border border-gray-300 rounded-lg px-4"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setVerifyModal({ isOpen: false, payment: null })}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  verifyMutation.mutate(verifyModal.payment.id);
                  setVerifyModal({ isOpen: false, payment: null });
                }}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Verify Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
