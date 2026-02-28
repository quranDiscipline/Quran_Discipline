import { useState } from 'react';
import { PageHeader, StatusBadge, DataTable, type Column } from '../components/shared';
import { useEnrollments, useUpdateEnrollmentStatus } from '../hooks';
import type { Enrollment } from '../types';
import { Eye, Edit, Plus } from 'lucide-react';

export const EnrollmentsList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [updateModal, setUpdateModal] = useState<{
    isOpen: boolean;
    enrollment: Enrollment | null;
    newStatus: Enrollment['status'] | null;
  }>({ isOpen: false, enrollment: null, newStatus: null });

  const { data, isLoading } = useEnrollments({
    page,
    limit: 20,
    status: statusFilter || undefined,
  });
  const updateStatusMutation = useUpdateEnrollmentStatus();

  const columns: Column<Enrollment>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (enrollment) => (
        <div>
          <p className="font-medium text-gray-900">{enrollment.student?.user?.fullName || 'N/A'}</p>
          <p className="text-sm text-gray-500">{enrollment.student?.user?.email || ''}</p>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      render: (enrollment) => (
        <div>
          <p className="text-gray-900">{enrollment.course?.title || 'N/A'}</p>
          <p className="text-xs text-gray-500">{enrollment.packageType?.replace('_', ' ') || ''}</p>
        </div>
      ),
    },
    {
      key: 'teacher',
      header: 'Teacher',
      render: (enrollment) => (
        <div>
          <p className="text-gray-900">{enrollment.teacher?.user?.fullName || 'Unassigned'}</p>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (enrollment) => (
        <span className="text-gray-900">
          {enrollment.startDate ? new Date(enrollment.startDate).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'progressPercentage',
      header: 'Progress',
      render: (enrollment) => (
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600"
              style={{ width: `${enrollment.progressPercentage || 0}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">{enrollment.progressPercentage || 0}%</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (enrollment) => <StatusBadge status={enrollment.status} />,
    },
  ];

  const handleStatusUpdate = () => {
    if (!updateModal.enrollment || !updateModal.newStatus) return;

    updateStatusMutation.mutate(
      { id: updateModal.enrollment.id, status: updateModal.newStatus },
      {
        onSuccess: () => {
          setUpdateModal({ isOpen: false, enrollment: null, newStatus: null });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollments"
        subtitle="Manage student enrollments"
        action={{
          label: 'New Enrollment',
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
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        search={{ value: search, onChange: setSearch, placeholder: 'Search enrollments...' }}
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
        actions={(enrollment) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {/* Navigate to detail */}}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => {/* Navigate to edit */}}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Status Update Modal */}
      {updateModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Enrollment Status</h3>
            <p className="text-gray-600 mb-4">
              Change status for {updateModal.enrollment?.student?.user?.fullName}
            </p>
            <div className="space-y-2 mb-6">
              {['active', 'completed', 'paused', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setUpdateModal({ ...updateModal, newStatus: status as Enrollment['status'] })}
                  className="w-full p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 capitalize"
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUpdateModal({ isOpen: false, enrollment: null, newStatus: null })}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!updateModal.newStatus}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
