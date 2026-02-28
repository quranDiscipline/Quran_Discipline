import { useState } from 'react';
import { PageHeader, StatusBadge, DataTable, ConfirmModal, type Column } from '../components/shared';
import { useTeachers, useDeactivateTeacher, useActivateTeacher, useCreateTeacher } from '../hooks';
import type { Teacher } from '../types';
import { MoreVertical, Eye, Edit, Ban, CheckCircle, Plus, X } from 'lucide-react';

interface NewTeacherForm {
  email: string;
  fullName: string;
  temporaryPassword: string;
  sex: 'male' | 'female';
  bio: string;
  qualifications: string;
  specializations: string;
  hourlyRate: string;
}

export const TeachersList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    teacher: Teacher | null;
    action: 'deactivate' | 'activate';
  }>({ isOpen: false, teacher: null, action: 'deactivate' });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<NewTeacherForm>({
    email: '',
    fullName: '',
    temporaryPassword: '',
    sex: 'male',
    bio: '',
    qualifications: '',
    specializations: '',
    hourlyRate: '',
  });

  const { data, isLoading } = useTeachers({ page, limit: 20, search, isAvailable: statusFilter === 'available' ? true : statusFilter === 'unavailable' ? false : undefined });
  const deactivateMutation = useDeactivateTeacher();
  const activateMutation = useActivateTeacher();
  const createMutation = useCreateTeacher();

  const columns: Column<Teacher>[] = [
    {
      key: 'user',
      header: 'Name',
      render: (teacher) => (
        <div className="flex items-center gap-3">
          {teacher.user.profilePictureUrl ? (
            <img
              src={teacher.user.profilePictureUrl}
              alt={teacher.user.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-medium">
                {teacher.user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{teacher.user.fullName}</p>
            <p className="text-sm text-gray-500">{teacher.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'specializations',
      header: 'Specializations',
      render: (teacher) => (
        <div className="flex flex-wrap gap-1">
          {teacher.specializations.slice(0, 2).map((spec, i) => (
            <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
              {spec}
            </span>
          ))}
          {teacher.specializations.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
              +{teacher.specializations.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'hourlyRate',
      header: 'Hourly Rate',
      render: (teacher) => (
        <span className="text-gray-900">${teacher.hourlyRate || 'N/A'}</span>
      ),
    },
    {
      key: 'activeStudentsCount',
      header: 'Active Students',
      render: (teacher) => (
        <span className="text-gray-900">{teacher.activeStudentsCount || 0}</span>
      ),
    },
    {
      key: 'isAvailable',
      header: 'Status',
      render: (teacher) => (
        <StatusBadge status={teacher.isAvailable ? 'active' : 'inactive'} />
      ),
    },
  ];

  const handleAction = () => {
    if (!actionModal.teacher) return;

    if (actionModal.action === 'deactivate') {
      deactivateMutation.mutate(actionModal.teacher.id);
    } else {
      activateMutation.mutate(actionModal.teacher.id);
    }
    setActionModal({ isOpen: false, teacher: null, action: 'deactivate' });
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        email: formData.email,
        fullName: formData.fullName,
        temporaryPassword: formData.temporaryPassword,
        sex: formData.sex,
        bio: formData.bio,
        qualifications: formData.qualifications.split(',').map(s => s.trim()),
        specializations: formData.specializations.split(',').map(s => s.trim()),
        hourlyRate: parseFloat(formData.hourlyRate) || undefined,
      });
      setCreateModalOpen(false);
      // Reset form
      setFormData({
        email: '',
        fullName: '',
        temporaryPassword: '',
        sex: 'male',
        bio: '',
        qualifications: '',
        specializations: '',
        hourlyRate: '',
      });
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers"
        subtitle="Manage your teaching staff"
        action={{
          label: 'Add Teacher',
          onClick: () => setCreateModalOpen(true),
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
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
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
        actions={(teacher) => (
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
            {teacher.isAvailable ? (
              <button
                onClick={() => setActionModal({ isOpen: true, teacher, action: 'deactivate' })}
                className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                title="Deactivate"
              >
                <Ban className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setActionModal({ isOpen: true, teacher, action: 'activate' })}
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
        onClose={() => setActionModal({ isOpen: false, teacher: null, action: 'deactivate' })}
        onConfirm={handleAction}
        title={actionModal.action === 'deactivate' ? 'Deactivate Teacher' : 'Activate Teacher'}
        message={
          actionModal.action === 'deactivate'
            ? `Are you sure you want to deactivate ${actionModal.teacher?.user.fullName}? They will not be assigned new students.`
            : `Are you sure you want to activate ${actionModal.teacher?.user.fullName}?`
        }
        confirmText={actionModal.action === 'deactivate' ? 'Deactivate' : 'Activate'}
        variant={actionModal.action === 'deactivate' ? 'danger' : 'info'}
        isLoading={deactivateMutation.isPending || activateMutation.isPending}
      />

      {/* Create Teacher Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Add New Teacher</h2>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3"
                    placeholder="teacher@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temporary Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.temporaryPassword}
                    onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3"
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sex *
                  </label>
                  <select
                    required
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value as 'male' | 'female' })}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                  placeholder="Brief biography..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualifications (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3"
                    placeholder="Ijazah in Quran, 10 years experience"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specializations (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.specializations}
                    onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3"
                    placeholder="Tajweed, Memorization"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="w-full h-11 border border-gray-300 rounded-lg px-3"
                  placeholder="25.00"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
