import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DayOfWeek } from '@/types';

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

interface ScheduleSlot {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxStudents?: number;
}

interface WeeklyScheduleEditorProps {
  initialSchedules?: ScheduleSlot[];
  onSave: (schedules: ScheduleSlot[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const WeeklyScheduleEditor: React.FC<WeeklyScheduleEditorProps> = ({
  initialSchedules = [],
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [schedules, setSchedules] = useState<ScheduleSlot[]>(
    initialSchedules.length > 0 ? initialSchedules : [{ dayOfWeek: 'monday', startTime: '10:00', endTime: '11:00', isAvailable: true }]
  );

  const addSlot = () => {
    setSchedules([
      ...schedules,
      { dayOfWeek: 'monday', startTime: '10:00', endTime: '11:00', isAvailable: true },
    ]);
  };

  const removeSlot = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof ScheduleSlot, value: any) => {
    const newSchedules = [...schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setSchedules(newSchedules);
  };

  const handleSave = () => {
    // Validate times
    for (const schedule of schedules) {
      const startMinutes = timeToMinutes(schedule.startTime);
      const endMinutes = timeToMinutes(schedule.endTime);
      if (endMinutes <= startMinutes) {
        alert('End time must be after start time for all slots');
        return;
      }
    }
    onSave(schedules);
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Group schedules by day for display
  const schedulesByDay = React.useMemo(() => {
    const grouped: Record<DayOfWeek, ScheduleSlot[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };
    schedules.forEach((schedule) => {
      grouped[schedule.dayOfWeek].push(schedule);
    });
    return grouped;
  }, [schedules]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Schedule</h3>
        <button
          type="button"
          onClick={addSlot}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Slot
        </button>
      </div>

      <div className="space-y-4">
        {DAYS.map((day) => {
          const daySchedules = schedulesByDay[day.value];
          return (
            <div key={day.value} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{day.label}</h4>
                <span className="text-sm text-gray-500">
                  {daySchedules.length} {daySchedules.length === 1 ? 'slot' : 'slots'}
                </span>
              </div>

              {daySchedules.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No availability</p>
              ) : (
                <div className="space-y-3">
                  {daySchedules.map((schedule) => {
                    const actualIndex = schedules.indexOf(schedule);
                    return (
                      <div key={actualIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-4 gap-3">
                          {/* Start Time */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Start
                            </label>
                            <input
                              type="time"
                              value={schedule.startTime}
                              onChange={(e) => updateSlot(actualIndex, 'startTime', e.target.value)}
                              className="w-full h-9 border border-gray-300 rounded px-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>

                          {/* End Time */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              End
                            </label>
                            <input
                              type="time"
                              value={schedule.endTime}
                              onChange={(e) => updateSlot(actualIndex, 'endTime', e.target.value)}
                              className="w-full h-9 border border-gray-300 rounded px-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>

                          {/* Max Students */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Max Students
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={schedule.maxStudents || ''}
                              onChange={(e) =>
                                updateSlot(
                                  actualIndex,
                                  'maxStudents',
                                  e.target.value ? parseInt(e.target.value) : undefined,
                                )
                              }
                              placeholder="Unlimited"
                              className="w-full h-9 border border-gray-300 rounded px-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>

                          {/* Available Toggle */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Status
                            </label>
                            <button
                              type="button"
                              onClick={() => updateSlot(actualIndex, 'isAvailable', !schedule.isAvailable)}
                              className={cn(
                                'w-full h-9 rounded px-2 text-sm font-medium transition-colors',
                                schedule.isAvailable
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200',
                              )}
                            >
                              {schedule.isAvailable ? 'Available' : 'Unavailable'}
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSlot(actualIndex)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
    </div>
  );
};
