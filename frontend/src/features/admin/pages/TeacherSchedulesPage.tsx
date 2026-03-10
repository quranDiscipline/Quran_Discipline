import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Copy, Download, Upload } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { WeeklyScheduleEditor } from '../components/WeeklyScheduleEditor';
import { BlockedDatesManager } from '../components/BlockedDatesManager';
import { useTeachers } from '../hooks/useTeachers';
import { useTeacherSchedulesByTeacher, useBulkCreateSchedules, useCopySchedules } from '../hooks/useTeacherSchedules';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { DayOfWeek } from '@/types';

export function TeacherSchedulesPage() {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [view, setView] = useState<'list' | 'schedule' | 'blocked'>('list');
  const [copyFromTeacher, setCopyFromTeacher] = useState<string>('');
  const [copyToTeacher, setCopyToTeacher] = useState<string>('');
  const [showCopyModal, setShowCopyModal] = useState(false);

  const { data: teachersResponse } = useTeachers();
  const teachers = Array.isArray(teachersResponse) ? teachersResponse : teachersResponse?.data || [];
  const { data: schedules = [], isLoading: isLoadingSchedules } = useTeacherSchedulesByTeacher(
    selectedTeacherId
  );

  const bulkCreateMutation = useBulkCreateSchedules();
  const copySchedulesMutation = useCopySchedules();

  const selectedTeacher = teachers.find((t: any) => t.id === selectedTeacherId);

  const handleSaveSchedule = async (newSchedules: any[]) => {
    if (!selectedTeacherId) return;

    try {
      await bulkCreateMutation.mutateAsync({
        teacherId: selectedTeacherId,
        schedules: newSchedules,
      });
      setView('list');
    } catch (error) {
      console.error('Failed to save schedule:', error);
    }
  };

  const handleCopySchedules = async () => {
    if (!copyFromTeacher || !copyToTeacher) return;

    if (copyFromTeacher === copyToTeacher) {
      alert('Source and destination teachers must be different');
      return;
    }

    try {
      await copySchedulesMutation.mutateAsync({ fromTeacherId: copyFromTeacher, toTeacherId: copyToTeacher });
      setShowCopyModal(false);
      setCopyFromTeacher('');
      setCopyToTeacher('');
    } catch (error) {
      console.error('Failed to copy schedules:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Teacher Schedules | Quran Academy Admin</title>
      </Helmet>

      <div className="space-y-6">
        <PageHeader
          title="Teacher Schedules"
          subtitle="Manage teacher availability and blocked dates"
        />

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Teacher Selector */}
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Teacher
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => {
                setSelectedTeacherId(e.target.value);
                setView('list');
              }}
              className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Choose a teacher...</option>
              {teachers.map((teacher: any) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          {selectedTeacherId && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setView('schedule')}
                className={cn(view === 'schedule' && 'ring-2 ring-primary')}
              >
                <Download className="w-4 h-4 mr-2" />
                Manage Schedule
              </Button>
              <Button
                variant="outline"
                onClick={() => setView('blocked')}
                className={cn(view === 'blocked' && 'ring-2 ring-primary')}
              >
                <Upload className="w-4 h-4 mr-2" />
                Blocked Dates
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCopyModal(true)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Schedule
              </Button>
            </div>
          )}
        </div>

        {/* Content Area */}
        {selectedTeacherId ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            {view === 'list' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedTeacher?.user.fullName}'s Schedule
                </h3>

                {isLoadingSchedules ? (
                  <div className="text-center py-8 text-gray-500">Loading schedule...</div>
                ) : schedules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <p>No schedule configured yet</p>
                    <button
                      type="button"
                      onClick={() => setView('schedule')}
                      className="mt-3 text-primary hover:text-primary-700 font-medium"
                    >
                      Create Schedule →
                    </button>
                  </div>
                ) : (
                  <ScheduleGrid schedules={schedules} />
                )}
              </div>
            )}

            {view === 'schedule' && (
              <WeeklyScheduleEditor
                initialSchedules={schedules.map((s) => ({
                  dayOfWeek: s.dayOfWeek as DayOfWeek,
                  startTime: s.startTime,
                  endTime: s.endTime,
                  isAvailable: s.isAvailable,
                  maxStudents: s.maxStudents || undefined,
                }))}
                onSave={handleSaveSchedule}
                onCancel={() => setView('list')}
                isLoading={bulkCreateMutation.isPending}
              />
            )}

            {view === 'blocked' && (
              <BlockedDatesManager teacherId={selectedTeacherId} />
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Copy className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select a Teacher
              </h3>
              <p className="text-gray-600">
                Choose a teacher from the dropdown above to view and manage their schedule.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Copy Schedule Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Copy Schedule Between Teachers
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Copy From
                </label>
                <select
                  value={copyFromTeacher}
                  onChange={(e) => setCopyFromTeacher(e.target.value)}
                  className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select source teacher...</option>
                  {teachers.map((teacher: any) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Copy To
                </label>
                <select
                  value={copyToTeacher}
                  onChange={(e) => setCopyToTeacher(e.target.value)}
                  className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select destination teacher...</option>
                  {teachers.map((teacher: any) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <p>
                  <strong>Warning:</strong> This will replace the destination teacher's entire
                  schedule with the source teacher's schedule.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCopyModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCopySchedules}
                  disabled={!copyFromTeacher || !copyToTeacher || copySchedulesMutation.isPending}
                  className="flex-1"
                >
                  {copySchedulesMutation.isPending ? 'Copying...' : 'Copy Schedule'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface ScheduleGridProps {
  schedules: Array<{
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    maxStudents: number | null;
  }>;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ schedules }) => {
  const DAYS: { value: string; label: string }[] = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {DAYS.map((day) => {
        const daySchedules = schedules.filter((s) => s.dayOfWeek === day.value);
        return (
          <div key={day.value} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">{day.label}</h4>
            {daySchedules.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No availability</p>
            ) : (
              <div className="space-y-2">
                {daySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={cn(
                      'p-2 rounded border text-sm',
                      schedule.isAvailable
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-gray-50 border-gray-200 text-gray-600',
                    )}
                  >
                    <div className="font-medium">
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                    </div>
                    {schedule.maxStudents && (
                      <div className="text-xs mt-0.5">
                        Max {schedule.maxStudents} student{schedule.maxStudents > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
