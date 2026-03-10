// Booking form constants

export const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Saudi Arabia',
  'United Arab Emirates',
  'Egypt',
  'Pakistan',
  'India',
  'Malaysia',
  'Indonesia',
  'Singapore',
  'Germany',
  'France',
  'Other',
] as const;

export const CURRENT_LEVELS = [
  { value: 'complete_beginner', label: 'Complete Beginner', description: "I can't read Arabic at all" },
  {
    value: 'can_read_arabic',
    label: 'Can Read Arabic',
    description: 'I can read the Quran but don’t understand it',
  },
  {
    value: 'can_recite',
    label: 'Can Recite',
    description: 'I can recite from memory and want to improve',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'I have memorized portions and want to go further',
  },
] as const;

export const PREFERRED_PACKAGES = [
  { value: 'not_sure', label: 'Not Sure', description: "I'll discuss with the teacher" },
  {
    value: 'foundation',
    label: 'Foundation',
    description: '4 sessions/month - Perfect for beginners',
  },
  {
    value: 'mastery',
    label: 'Mastery',
    description: '8 sessions/month - intensive learning',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: '12 sessions/month - for serious students',
  },
  {
    value: 'group',
    label: 'Group',
    description: 'Affordable group sessions',
  },
] as const;

export const TEACHER_PREFERENCES = [
  { value: 'any', label: 'Any Teacher', icon: '👥' },
  { value: 'male', label: 'Male Teacher', icon: '👨' },
  { value: 'female', label: 'Female Teacher', icon: '👩' },
] as const;

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const WEEKDAYS_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;
