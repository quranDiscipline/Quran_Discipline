import { User } from 'lucide-react';
import type { TeacherProfile } from '../../types/landing.types';

interface TeacherCardProps {
  teacher: TeacherProfile;
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  const renderAvatar = () => {
    if (teacher.profilePictureUrl) {
      return (
        <img
          src={teacher.profilePictureUrl}
          alt={teacher.fullName}
          className="w-20 h-20 rounded-full object-cover border-2 border-primary"
        />
      );
    }

    return (
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center border-2 border-primary">
        <User className="w-10 h-10 text-white" />
      </div>
    );
  };

  const parseSpecializations = () => {
    if (!teacher.specializations) return [];
    return typeof teacher.specializations === 'string'
      ? teacher.specializations.split(',').map(s => s.trim())
      : teacher.specializations;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header with Avatar */}
      <div className="flex flex-col items-center text-center mb-4">
        {renderAvatar()}
        <h3 className="text-xl font-bold text-gray-900 mt-4">{teacher.fullName}</h3>
      </div>

      {/* Rating and Students */}
      <div className="flex items-center justify-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-secondary-500">
            {'★'.repeat(Math.floor(Number(teacher.rating)))}
          </span>
          <span className="font-medium text-gray-700">{Number(teacher.rating).toFixed(1)}</span>
        </div>
        <div className="w-px h-4 bg-gray-300" />
        <div className="flex items-center gap-1 text-gray-600">
          <span className="font-medium">{Number(teacher.totalStudents)}</span>
          <span>students</span>
        </div>
      </div>

      {/* Specializations */}
      {teacher.specializations && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {parseSpecializations().map((spec, index) => (
            <span
              key={index}
              className="bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full"
            >
              {spec}
            </span>
          ))}
        </div>
      )}

      {/* Bio */}
      {teacher.bio && (
        <p className="text-gray-600 text-sm text-center line-clamp-3 leading-relaxed">
          {teacher.bio}
        </p>
      )}

      {/* Qualifications */}
      {teacher.qualifications && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            {teacher.qualifications}
          </p>
        </div>
      )}
    </div>
  );
}
