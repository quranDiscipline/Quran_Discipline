import { useState } from 'react';
import { PageHeader, StatusBadge, DataTable, ConfirmModal, type Column } from '../components/shared';
import { useCourses, useDeactivateCourse, useActivateCourse } from '../hooks';
import type { Course } from '../types';
import { Eye, Edit, Ban, CheckCircle, Plus } from 'lucide-react';

export const CoursesList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    course: Course | null;
    action: 'deactivate' | 'activate';
  }>({ isOpen: false, course: null, action: 'deactivate' });

  const { data, isLoading } = useCourses({
    page,
    limit: 20,
    search,
    courseType: typeFilter || undefined,
  });
  const deactivateMutation = useDeactivateCourse();
  const activateMutation = useActivateCourse();

  const columns: Column<Course>[] = [
    {
      key: 'title',
      header: 'Course',
      render: (course) => (
        <div className="flex items-center gap-3">
          {course.imageUrl && (
            <img
              src={course.imageUrl}
              alt={course.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div>
            <p className="font-medium text-gray-900">{course.title}</p>
            <p className="text-sm text-gray-500 line-clamp-1">{course.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'courseType',
      header: 'Type',
      render: (course) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm capitalize">
          {course.courseType}
        </span>
      ),
    },
    {
      key: 'basePrice',
      header: 'Price',
      render: (course) => (
        <span className="text-gray-900 font-medium">${course.basePrice}</span>
      ),
    },
    {
      key: 'durationWeeks',
      header: 'Duration',
      render: (course) => (
        <span className="text-gray-900">{course.durationWeeks} weeks</span>
      ),
    },
    {
      key: 'activeEnrollmentsCount',
      header: 'Active Enrollments',
      render: (course) => (
        <span className="text-gray-900">{course.activeEnrollmentsCount || 0}</span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (course) => <StatusBadge status={course.isActive ? 'active' : 'inactive'} />,
    },
  ];

  const handleAction = () => {
    if (!actionModal.course) return;

    if (actionModal.action === 'deactivate') {
      deactivateMutation.mutate(actionModal.course.id);
    } else {
      activateMutation.mutate(actionModal.course.id);
    }
    setActionModal({ isOpen: false, course: null, action: 'deactivate' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        subtitle="Manage your course catalog"
        action={{
          label: 'Add Course',
          onClick: () => {/* Navigate to create */},
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="">All Types</option>
          <option value="memorization">Memorization</option>
          <option value="islamic_studies">Islamic Studies</option>
          <option value="understanding">Understanding</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        search={{ value: search, onChange: setSearch, placeholder: 'Search courses...' }}
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
        actions={(course) => (
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
            {course.isActive ? (
              <button
                onClick={() => setActionModal({ isOpen: true, course, action: 'deactivate' })}
                className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                title="Deactivate"
              >
                <Ban className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setActionModal({ isOpen: true, course, action: 'activate' })}
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
        onClose={() => setActionModal({ isOpen: false, course: null, action: 'deactivate' })}
        onConfirm={handleAction}
        title={actionModal.action === 'deactivate' ? 'Deactivate Course' : 'Activate Course'}
        message={
          actionModal.action === 'deactivate'
            ? `Are you sure you want to deactivate "${actionModal.course?.title}"?`
            : `Are you sure you want to activate "${actionModal.course?.title}"?`
        }
        confirmText={actionModal.action === 'deactivate' ? 'Deactivate' : 'Activate'}
        variant={actionModal.action === 'deactivate' ? 'danger' : 'info'}
        isLoading={deactivateMutation.isPending || activateMutation.isPending}
      />
    </div>
  );
};
