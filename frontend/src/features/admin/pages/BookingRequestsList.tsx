import { useState } from 'react';
import { PageHeader, StatusBadge, DataTable, ConfirmModal, type Column } from '../components/shared';
import { useBookingRequests, useAssignBookingRequest, useConfirmBookingRequest, useCancelBookingRequest } from '../hooks';
import type { BookingRequest } from '../types';
import { Eye, UserCheck, Video, X } from 'lucide-react';
import { format } from 'date-fns';

export const BookingRequestsList = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'assign' | 'confirm' | 'cancel' | null;
    booking: BookingRequest | null;
  }>({ isOpen: false, type: null, booking: null });

  const { data, isLoading } = useBookingRequests({
    page,
    limit: 20,
    status: statusFilter || undefined,
  });
  const assignMutation = useAssignBookingRequest();
  const confirmMutation = useConfirmBookingRequest();
  const cancelMutation = useCancelBookingRequest();

  const columns: Column<BookingRequest>[] = [
    {
      key: 'fullName',
      header: 'Name',
      render: (booking) => (
        <div>
          <p className="font-medium text-gray-900">{booking.fullName}</p>
          <p className="text-sm text-gray-500">{booking.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (booking) => (
        <div>
          <p className="text-gray-900">{booking.phone}</p>
          <p className="text-xs text-gray-500">{booking.country}</p>
        </div>
      ),
    },
    {
      key: 'preferredDate',
      header: 'Preferred Time',
      render: (booking) => (
        <div>
          <p className="text-gray-900">{booking.preferredDate}</p>
          <p className="text-sm text-gray-500">{booking.preferredTime}</p>
        </div>
      ),
    },
    {
      key: 'assignedTeacherId',
      header: 'Assigned Teacher',
      render: (booking) => (
        <span className={booking.assignedTeacher ? 'text-gray-900' : 'text-gray-400 italic'}>
          {booking.assignedTeacher?.user?.fullName || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (booking) => <StatusBadge status={booking.status} />,
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (booking) => (
        <span className="text-gray-900">
          {booking.createdAt ? format(new Date(booking.createdAt), 'MMM d, yyyy') : 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking Requests"
        subtitle="Manage assessment call requests"
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
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyMessage="No booking requests found"
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
        actions={(booking) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {/* View details */}}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {booking.status === 'pending' && (
              <>
                <button
                  onClick={() => setActionModal({ isOpen: true, type: 'assign', booking })}
                  className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                  title="Assign Teacher"
                >
                  <UserCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActionModal({ isOpen: true, type: 'confirm', booking })}
                  className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                  title="Confirm with Zoom"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActionModal({ isOpen: true, type: 'cancel', booking })}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      />

      {/* Action Modals */}
      <ConfirmModal
        isOpen={actionModal.isOpen && actionModal.type === 'cancel'}
        onClose={() => setActionModal({ isOpen: false, type: null, booking: null })}
        onConfirm={() => actionModal.booking && cancelMutation.mutate(actionModal.booking.id)}
        title="Cancel Booking Request"
        message="Are you sure you want to cancel this booking request?"
        variant="danger"
        isLoading={cancelMutation.isPending}
      />

      {/* Assign Teacher Modal - Simplified */}
      {actionModal.isOpen && actionModal.type === 'assign' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Assign Teacher</h3>
            <p className="text-gray-600 mb-4">
              Select a teacher for {actionModal.booking?.fullName}
            </p>
            <div className="mb-4">
              <select className="w-full h-11 border border-gray-300 rounded-lg px-4">
                <option>Select a teacher...</option>
                {/* Would populate with available teachers */}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActionModal({ isOpen: false, type: null, booking: null })}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm with Zoom Modal */}
      {actionModal.isOpen && actionModal.type === 'confirm' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Booking</h3>
            <p className="text-gray-600 mb-4">
              Provide Zoom link for {actionModal.booking?.fullName}
            </p>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zoom Link</label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  className="w-full h-11 border border-gray-300 rounded-lg px-4"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmed Date</label>
                  <input
                    type="date"
                    className="w-full h-11 border border-gray-300 rounded-lg px-4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmed Time</label>
                  <input
                    type="time"
                    className="w-full h-11 border border-gray-300 rounded-lg px-4"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActionModal({ isOpen: false, type: null, booking: null })}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
