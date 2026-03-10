import React, { useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBlockedDates, useBlockDate, useUnblockDate } from '../hooks/useTeacherSchedules';
import { useTeachers } from '../hooks/useTeachers';

interface BlockedDatesManagerProps {
  teacherId?: string;
}

export const BlockedDatesManager: React.FC<BlockedDatesManagerProps> = ({ teacherId }) => {
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [newBlockTeacherId, setNewBlockTeacherId] = useState<string | undefined>(teacherId);

  const { data: blockedDates = [], isLoading } = useBlockedDates({
    teacherId,
  });

  const { data: teachersResponse } = useTeachers();
  const teachers = Array.isArray(teachersResponse) ? teachersResponse : teachersResponse?.data || [];

  const blockDateMutation = useBlockDate();
  const unblockDateMutation = useUnblockDate();

  const handleAddBlock = async () => {
    if (!newBlockDate) return;

    try {
      await blockDateMutation.mutateAsync({
        date: newBlockDate,
        teacherId: newBlockTeacherId,
        reason: newBlockReason || undefined,
      });

      setNewBlockDate('');
      setNewBlockReason('');
      setIsAddingBlock(false);
    } catch (error) {
      console.error('Failed to block date:', error);
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await unblockDateMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to unblock date:', error);
    }
  };

  // Separate global and teacher-specific blocks
  const globalBlocks = blockedDates.filter((b) => !b.teacherId);
  const teacherBlocks = blockedDates.filter((b) => b.teacherId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Blocked Dates</h3>
        <button
          type="button"
          onClick={() => setIsAddingBlock(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Block Date
        </button>
      </div>

      {/* Add Block Form */}
      {isAddingBlock && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Block a Date</h4>

          <div className="space-y-4">
            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date to Block
              </label>
              <input
                type="date"
                value={newBlockDate}
                onChange={(e) => setNewBlockDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Teacher Selection */}
            {!teacherId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scope
                </label>
                <select
                  value={newBlockTeacherId || 'global'}
                  onChange={(e) =>
                    setNewBlockTeacherId(e.target.value === 'global' ? undefined : e.target.value)
                  }
                  className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="global">All Teachers (Global Block)</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.user.fullName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Global blocks apply to all teachers. Individual blocks only affect the selected
                  teacher.
                </p>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason (Optional)
              </label>
              <input
                type="text"
                value={newBlockReason}
                onChange={(e) => setNewBlockReason(e.target.value)}
                placeholder="e.g., Holiday, Event, etc."
                className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsAddingBlock(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddBlock}
                disabled={!newBlockDate || blockDateMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {blockDateMutation.isPending ? 'Blocking...' : 'Block Date'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blocked Dates List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading blocked dates...</div>
      ) : blockedDates.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No blocked dates</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Global Blocks */}
          {globalBlocks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Global Blocks (All Teachers)</h4>
              <div className="space-y-2">
                {globalBlocks.map((block) => (
                  <BlockedDateItem key={block.id} block={block} onUnblock={handleUnblock} />
                ))}
              </div>
            </div>
          )}

          {/* Teacher-Specific Blocks */}
          {teacherBlocks.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Teacher-Specific Blocks</h4>
              <div className="space-y-2">
                {teacherBlocks.map((block) => (
                  <BlockedDateItem key={block.id} block={block} onUnblock={handleUnblock} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface BlockedDateItemProps {
  block: {
    id: string;
    date: string;
    reason: string | null;
    teacherId?: string | null;
    teacher?: {
      user: {
        fullName: string;
      };
    } | null;
  };
  onUnblock: (id: string) => void;
}

const BlockedDateItem: React.FC<BlockedDateItemProps> = ({ block, onUnblock }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUnblock = async () => {
    setIsDeleting(true);
    try {
      await onUnblock(block.id);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 border rounded-lg transition-all',
        block.teacherId ? 'border-orange-200 bg-orange-50' : 'border-red-200 bg-red-50',
      )}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{formatDate(block.date)}</span>
          {block.teacher && (
            <span className="text-xs px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full">
              {block.teacher.user.fullName}
            </span>
          )}
        </div>
        {block.reason && <p className="text-sm text-gray-600 mt-0.5">{block.reason}</p>}
      </div>
      <button
        type="button"
        onClick={handleUnblock}
        disabled={isDeleting}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
