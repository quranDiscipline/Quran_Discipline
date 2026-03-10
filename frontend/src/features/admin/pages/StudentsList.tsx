import { useState } from 'react';
import { PageHeader, StatusBadge, DataTable, ConfirmModal, type Column } from '../components/shared';
import { useStudents, useDeactivateStudent, useActivateStudent, useCreateStudent, useUpdateStudent } from '../hooks';
import type { Student } from '../types';
import { Eye, Edit, Ban, CheckCircle, Plus, X } from 'lucide-react';

interface NewStudentForm {
  email: string;
  fullName: string;
  temporaryPassword: string;
  sex: 'male' | 'female';
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  country: string;
  phoneNumber: string;
  whatsappNumber: string;
  paymentMethod: 'paypal' | 'bank_transfer' | '';
}

export const StudentsList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'trial' | 'active' | 'paused' | 'cancelled' | ''>('');
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    student: Student | null;
    action: 'deactivate' | 'activate';
  }>({ isOpen: false, student: null, action: 'deactivate' });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<NewStudentForm>({
    email: '',
    fullName: '',
    temporaryPassword: '',
    sex: 'male',
    currentLevel: 'beginner',
    country: '',
    phoneNumber: '',
    whatsappNumber: '',
    paymentMethod: '',
  });

  const { data, isLoading } = useStudents({
    page,
    limit: 20,
    search: search || undefined,
    subscriptionStatus: statusFilter || undefined,
  });
  const deactivateMutation = useDeactivateStudent();
  const activateMutation = useActivateStudent();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();

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
          <p className="text-gray-900">{student.country || 'N/A'}</p>
          <p className="text-xs text-gray-500">{student.timezone || 'N/A'}</p>
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

  const handleAction = async () => {
    if (!actionModal.student) return;

    try {
      if (actionModal.action === 'deactivate') {
        await deactivateMutation.mutateAsync(actionModal.student.id);
      } else {
        await activateMutation.mutateAsync(actionModal.student.id);
      }
      setActionModal({ isOpen: false, student: null, action: 'deactivate' });
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedStudent) {
        // Update existing student
        await updateMutation.mutateAsync({
          id: selectedStudent.id,
          fullName: formData.fullName,
          currentLevel: formData.currentLevel,
          phoneNumber: formData.phoneNumber || undefined,
          whatsappNumber: formData.whatsappNumber || undefined,
          country: formData.country || undefined,
          paymentMethod: formData.paymentMethod as 'paypal' | 'bank_transfer' | undefined,
        });
      } else {
        // Create new student
        await createMutation.mutateAsync({
          email: formData.email,
          fullName: formData.fullName,
          sex: formData.sex,
          temporaryPassword: formData.temporaryPassword,
          currentLevel: formData.currentLevel,
          country: formData.country || undefined,
          phoneNumber: formData.phoneNumber || undefined,
          whatsappNumber: formData.whatsappNumber || undefined,
          paymentMethod: formData.paymentMethod as 'paypal' | 'bank_transfer' | undefined,
        });
      }
      setCreateModalOpen(false);
      setIsEditMode(false);
      setSelectedStudent(null);
      setFormData({
        email: '',
        fullName: '',
        temporaryPassword: '',
        sex: 'male',
        currentLevel: 'beginner',
        country: '',
        phoneNumber: '',
        whatsappNumber: '',
        paymentMethod: '',
      });
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        subtitle="Manage your student base"
        action={{
          label: 'Add Student',
          onClick: () => setCreateModalOpen(true),
          leftIcon: <Plus className="w-4 h-4" />,
        }}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | 'trial' | 'active' | 'paused' | 'cancelled')}
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
              onClick={() => {
                setSelectedStudent(student);
                setDetailsModalOpen(true);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedStudent(student);
                setIsEditMode(true);
                setCreateModalOpen(true);
                // Pre-fill form with student data
                setFormData({
                  email: student.user.email,
                  fullName: student.user.fullName,
                  temporaryPassword: '', // Don't pre-fill password for security
                  sex: student.user.sex,
                  currentLevel: student.currentLevel,
                  country: student.country || '',
                  phoneNumber: student.user.phoneNumber || '',
                  whatsappNumber: student.user.whatsappNumber || '',
                  paymentMethod: '', // Reset payment method for edit (user can change if needed)
                });
              }}
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

      {/* Create Student Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button
                onClick={() => {
                  setCreateModalOpen(false);
                  setSelectedStudent(null);
                  setIsEditMode(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-4">
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
                    placeholder="student@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temporary Password{!isEditMode && ' *'}
                  </label>
                  <input
                    type="password"
                    required={!isEditMode}
                    pattern={isEditMode ? undefined : "^(?=.*[A-Z])(?=.*\\d).{8,}$"}
                    value={formData.temporaryPassword}
                    onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3"
                    placeholder={isEditMode ? 'Leave empty to keep current password' : 'Min 8 chars, 1 uppercase, 1 number (e.g., Student123)'}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Level *
                  </label>
                  <select
                    required
                    value={formData.currentLevel}
                    onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'paypal' | 'bank_transfer' | '' })}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3"
                  >
                    <option value="">Select...</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3"
                    placeholder="United States"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalOpen(false);
                    setSelectedStudent(null);
                    setIsEditMode(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : isEditMode
                      ? 'Update Student'
                      : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {detailsModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Student Details</h2>
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedStudent(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                {selectedStudent.user.profilePictureUrl ? (
                  <img
                    src={selectedStudent.user.profilePictureUrl}
                    alt={selectedStudent.user.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-bold text-xl">
                      {selectedStudent.user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedStudent.user.fullName}</h3>
                  <p className="text-sm text-gray-500">{selectedStudent.user.email}</p>
                  <StatusBadge status={selectedStudent.subscriptionStatus} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Current Level</p>
                  <p className="font-medium capitalize">{selectedStudent.currentLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Package</p>
                  <p className="font-medium capitalize">{selectedStudent.packageType?.replace('_', ' ') || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{selectedStudent.country || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Timezone</p>
                  <p className="font-medium">{selectedStudent.timezone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedStudent.user.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">WhatsApp</p>
                  <p className="font-medium">{selectedStudent.user.whatsappNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Enrollments</p>
                  <p className="font-medium">{selectedStudent.activeEnrollmentsCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sessions Completed</p>
                  <p className="font-medium">{selectedStudent.totalSessionsCompleted}</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setSelectedStudent(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
