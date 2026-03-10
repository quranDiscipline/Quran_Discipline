import { useState } from 'react';
import { PageHeader, StatusBadge, DataTable, type Column } from '../components/shared';
import { useProfileChanges, useApproveProfileChange, useRejectProfileChange } from '../hooks';
import type { ProfileChange } from '../types';
import { Eye, Check, X, FileText } from 'lucide-react';
import { format } from 'date-fns';

export const ProfileChangesList = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    change: ProfileChange | null;
  }>({ isOpen: false, change: null });

  const { data, isLoading } = useProfileChanges({
    page,
    limit: 20,
    status: statusFilter || undefined,
  });
  const approveMutation = useApproveProfileChange();
  const rejectMutation = useRejectProfileChange();

  const columns: Column<ProfileChange>[] = [
    {
      key: 'teacher',
      header: 'Teacher',
      render: (change) => (
        <div className="flex items-center gap-3">
          {change.teacher?.user?.profilePictureUrl ? (
            <img
              src={change.teacher.user.profilePictureUrl}
              alt={change.teacher.user.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-medium">
                {change.teacher?.user?.fullName?.charAt(0).toUpperCase() || 'T'}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{change.teacher?.user?.fullName || 'N/A'}</p>
            <p className="text-sm text-gray-500">{change.teacher?.user?.email || ''}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'changeType',
      header: 'Change Type',
      render: (change) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm capitalize">
          {change.changeType?.replace('_', ' ') || 'N/A'}
        </span>
      ),
    },
    {
      key: 'requestedChanges',
      header: 'Changes',
      render: (change) => {
        const changes = change.requestedChanges as Record<string, any>;
        const changeKeys = Object.keys(changes || {}).filter(
          (k) => changes[k] !== undefined && changes[k] !== null
        );
        return (
          <div className="flex flex-wrap gap-1">
            {changeKeys.slice(0, 2).map((key) => (
              <span key={key} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 capitalize">
                {key}
              </span>
            ))}
            {changeKeys.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                +{changeKeys.length - 2} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (change) => <StatusBadge status={change.status} />,
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (change) => (
        <span className="text-gray-900">
          {change.createdAt ? format(new Date(change.createdAt), 'MMM d, yyyy') : 'N/A'}
        </span>
      ),
    },
  ];

  const handleApprove = () => {
    if (!reviewModal.change) return;
    approveMutation.mutate(
      { id: reviewModal.change.id, notes: '' },
      {
        onSuccess: () => setReviewModal({ isOpen: false, change: null }),
      }
    );
  };

  const handleReject = () => {
    if (!reviewModal.change) return;
    rejectMutation.mutate(
      { id: reviewModal.change.id, notes: 'Changes do not meet requirements.' },
      {
        onSuccess: () => setReviewModal({ isOpen: false, change: null }),
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Change Requests"
        subtitle="Review teacher profile modification requests"
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
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyMessage="No profile change requests found"
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
        actions={(change) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setReviewModal({ isOpen: true, change })}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {change.status === 'pending' && (
              <>
                <button
                  onClick={() => {
                    setReviewModal({ isOpen: true, change });
                    // Auto-approve on click
                    approveMutation.mutate({ id: change.id, notes: '' });
                  }}
                  className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                  title="Approve"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setReviewModal({ isOpen: true, change });
                    rejectMutation.mutate({ id: change.id, notes: 'Rejected by admin' });
                  }}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                  title="Reject"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      />

      {/* Review Detail Modal */}
      {reviewModal.isOpen && reviewModal.change && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="w-5 h-5 text-primary-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Profile Change Request</h3>
                <p className="text-sm text-gray-500">
                  from {reviewModal.change.teacher?.user?.fullName}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Change Type:</span>
                  <p className="font-medium text-gray-900 capitalize">
                    {reviewModal.change.changeType?.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className="mt-1">
                    <StatusBadge status={reviewModal.change.status} />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Requested Changes:</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {Object.entries((reviewModal.change.requestedChanges as Record<string, any>) || {}).map(
                    ([key, value]) => (
                      <div key={key} className="flex justify-between items-start">
                        <span className="text-gray-600 capitalize">{key}:</span>
                        <span className="font-medium text-gray-900">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {reviewModal.change.reason && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Reason:</h4>
                  <p className="text-gray-700">{reviewModal.change.reason}</p>
                </div>
              )}

              {reviewModal.change.adminNotes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Admin Notes:</h4>
                  <p className="text-gray-700">{reviewModal.change.adminNotes}</p>
                </div>
              )}
            </div>

            {reviewModal.change.status === 'pending' && (
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  onClick={() => setReviewModal({ isOpen: false, change: null })}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
