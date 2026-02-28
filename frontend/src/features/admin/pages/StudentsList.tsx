import { useState } from 'react';
import { PageHeader, StatusBadge, DataTable, ConfirmModal, type Column } from '../components/shared';
import { useStudents, useDeactivateStudent, useActivateStudent } from '../hooks';
import type { Student } from '../types';
import { Eye, Edit, Ban, CheckCircle, Plus } from 'lucide-react';

export const StudentsList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    student: Student | null;
    action: 'deactivate' | 'activate';
  }>({ isOpen: false, student: null, action: 'deactivate' });

  const { data, isLoading } = useStudents({
    page,
    limit: 20,
    search,
    subscriptionStatus: statusFilter || undefined,
  });
  const deactivateMutation = useDeactivateStudent();
  const activateMutation = useActivateStudent();

  const columns: Column<Student>[] = [
    {
      key: 'user',
      header: 'Name',
      render: (student) => (
        <div className="flex items-center gap-3">
          {student.user.profilePictureUrl ? (
            <img
              src={student.user.profilePictureUrl}
              alt={student.user.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-medium">
                {student.user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{student.user.fullName}</p>
            <p className="text-sm text-gray-500">{student.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'country',
      header: 'Location',
      render: (student) => (
        <div>
          <p className="text-gray-900">{student.country}</p>
          <p className="text-xs text-gray-500">{student.timezone}</p>
        </div>
      ),
    },
    {
      key: 'packageType',
      header: 'Package',
      render: (student) => (
        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm capitalize">
          {student.packageType?.replace('_', ' ') || 'N/A'}
        </span>
      ),
    },
    {
      key: 'subscriptionStatus',
      header: 'Status',
      render: (student) => <StatusBadge status={student.subscriptionStatus} />,
    },
    {
      key: 'activeEnrollmentsCount',
      header: 'Active Enrollments',
      render: (student) => (
        <span className="text-gray-900">{student.activeEnrollmentsCount || 0}</span>
      ),
    },
  ];

  const handleAction = () => {
    if (!actionModal.student) return;

    if (actionModal.action === 'deactivate') {
      deactivateMutation.mutate(actionModal.student.id);
    } else {
      activateMutation.mutate(actionModal.student.id);
    }
    setActionModal({ isOpen: false, student: null, action: 'deactivate' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        subtitle="Manage your student base"
        action={{
          label: 'Add Student',
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
          <option value="trial">Trial</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        search={{ value: search, onChange: setSearch, placeholder: 'Search by name or email...' }}
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
        actions={(student) => (
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
            {student.subscriptionStatus !== 'cancelled' ? (
              <button
                onClick={() => setActionModal({ isOpen: true, student, action: 'deactivate' })}
                className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                title="Deactivate"
              >
                <Ban className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setActionModal({ isOpen: true, student, action: 'activate' })}
                className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                title="Activate"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      />

      <ConfirmModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, student: null, action: 'deactivate' })}
        onConfirm={handleAction}
        title={actionModal.action === 'deactivate' ? 'Deactivate Student' : 'Activate Student'}
        message={
          actionModal.action === 'deactivate'
            ? `Are you sure you want to deactivate ${actionModal.student?.user.fullName}?`
            : `Are you sure you want to activate ${actionModal.student?.user.fullName}?`
        }
        confirmText={actionModal.action === 'deactivate' ? 'Deactivate' : 'Activate'}
        variant={actionModal.action === 'deactivate' ? 'danger' : 'info'}
        isLoading={deactivateMutation.isPending || activateMutation.isPending}
      />
    </div>
  );
};
