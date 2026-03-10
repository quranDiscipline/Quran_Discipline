import React, { useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useBookingStep } from '../hooks/useBookingStep';
import { useBookingStore } from '../store/booking.store';
import { useAvailableSlots, useAvailableDates } from '../hooks/useAvailableSlots';
import { Button } from '../../../components/ui/Button';
import { cn } from '../../../lib/utils';
import type { AvailableSlot } from '../types/landing.types';
import {
  COUNTRIES,
  CURRENT_LEVELS,
  PREFERRED_PACKAGES,
  TEACHER_PREFERENCES,
  WEEKDAYS,
  MONTHS,
} from '../types/booking.constants';

export function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { step, setStep, reset } = useBookingStep();
  const { selectedSlot, setSelectedSlot, formData, setFormData, submitBooking, isSubmitting, error, emailSent } =
    useBookingStore();

  // Check for ?package=mastery URL param
  useEffect(() => {
    const packageParam = searchParams.get('package');
    if (packageParam && !formData) {
      const validPackage = PREFERRED_PACKAGES.find((p) => p.value === packageParam);
      if (validPackage) {
        setFormData({
          fullName: '',
          email: '',
          whatsapp: '',
          sex: 'male',
          country: '',
          currentLevel: 'complete_beginner',
          preferredPackage: validPackage.value as any,
          message: '',
        });
      }
    }
  }, [searchParams, formData, setFormData]);

  // Reset store on unmount (only if user navigates away without completing)
  useEffect(() => {
    return () => {
      // Access the latest state directly from the store on unmount
      if (!useBookingStore.getState().emailSent) {
        useBookingStore.getState().reset();
      }
    };
  }, []); // Empty deps - runs cleanup only on unmount

  // Teacher preference filter
  const [teacherPreference, setTeacherPreference] = React.useState<'any' | 'male' | 'female'>('any');

  // Calendar state
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

  // Get teacher sex filter for API calls
  const teacherSex = teacherPreference !== 'any' ? teacherPreference : undefined;

  // Two-phase loading:
  // Phase 1: Get available dates for current month (lightweight call)
  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  const { data: availableDates = [] } = useAvailableDates(
    monthKey,
    teacherSex,
  );

  // Phase 2: Get full slot data only when a date is selected
  const { data: slotsForSelectedDate = [], isLoading: isLoadingSlots } = useAvailableSlots(
    selectedDate || undefined,
    teacherSex,
  );

  // Memoize calendar helpers
  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    return {
      daysInMonth,
      startDayOfWeek,
      year,
      month,
    };
  }, []);

  const isDateAvailable = useCallback((dateStr: string) => availableDates.includes(dateStr), [availableDates]);

  const isPastDate = useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }, []);

  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, []);

  const formatDisplayDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, []);

  const formatDisplayTime = useCallback((time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }, []);

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  }, [currentMonth]);

  const handleDateClick = useCallback((dateStr: string) => {
    if (isPastDate(new Date(dateStr + 'T00:00:00'))) return;
    setSelectedDate(dateStr);
  }, [isPastDate]);

  const handleSlotSelect = useCallback((slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setStep(2);
  }, [setStep]);

  const handleTeacherPreferenceChange = useCallback((pref: 'any' | 'male' | 'female') => {
    setTeacherPreference(pref);
    setSelectedDate(null);
  }, []);

  // Form submission handlers
  const handleDetailsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      whatsapp: formData.get('whatsapp') as string,
      sex: formData.get('sex') as 'male' | 'female',
      country: formData.get('country') as string,
      currentLevel: formData.get('currentLevel') as any,
      preferredPackage: formData.get('preferredPackage') as any,
      message: formData.get('message') as string | undefined,
    };
    setFormData(data);
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    await submitBooking();
    if (!error) {
      setStep(4);
    }
  };

  // Step 1: Choose Time
  const renderStep1 = () => {
    // Memoize calendar day generation
    const calendarDays = useMemo(() => {
      const { daysInMonth, startDayOfWeek, year, month } = getDaysInMonth(currentMonth);
      const days: React.ReactNode[] = [];

      // Empty cells for days before the first day of month
      for (let i = 0; i < startDayOfWeek; i++) {
        days.push(<div key={`empty-${i}`} className="h-12" />);
      }

      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isPast = isPastDate(date);
        const isAvailable = isDateAvailable(dateStr);
        const isSelected = selectedDate === dateStr;
        const isTodayDate = isToday(date);

        days.push(
          <button
            key={day}
            type="button"
            disabled={isPast || !isAvailable}
            onClick={() => handleDateClick(dateStr)}
            className={cn(
              'relative h-12 rounded-lg font-medium transition-all',
              'disabled:cursor-not-allowed',
              isPast && 'text-gray-300',
              !isPast && !isAvailable && 'text-gray-400',
              !isPast && isAvailable && !isSelected && 'hover:bg-primary-50 text-gray-700',
              isSelected && 'bg-primary text-white',
              isTodayDate && !isSelected && 'ring-2 ring-secondary',
              isAvailable && !isSelected && !isPast && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full" />
              ),
            )}
          >
            {day}
          </button>,
        );
      }

      return days;
    }, [currentMonth, availableDates, selectedDate, isPastDate, isDateAvailable, isToday, handleDateClick]);

    return (
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Your Free Call</h1>
            <p className="text-gray-600">
              Choose a time that works for you. Our team will confirm your booking via email.
            </p>
          </div>

          {/* Teacher Preference */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Teacher Preference</h3>
            <div className="grid grid-cols-3 gap-3">
              {TEACHER_PREFERENCES.map((pref) => (
                <button
                  key={pref.value}
                  type="button"
                  onClick={() => handleTeacherPreferenceChange(pref.value as any)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                    teacherPreference === pref.value
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300',
                  )}
                >
                  <span className="text-2xl">{pref.icon}</span>
                  <span className="text-sm font-medium">{pref.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Slot Summary */}
          {selectedSlot && (
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Selected Time Slot</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Date:</span> {formatDisplayDate(selectedSlot.date)}
                </p>
                <p>
                  <span className="font-medium">Time:</span> {formatDisplayTime(selectedSlot.startTime)} -{' '}
                  {formatDisplayTime(selectedSlot.endTime)}
                </p>
                <p>
                  <span className="font-medium">Teacher:</span> {selectedSlot.teacherName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="mt-3 text-sm text-primary-700 hover:text-primary-800 font-medium"
              >
                Change Selection
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={goToPrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h3 className="text-xl font-semibold text-gray-900">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">{calendarDays}</div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full ring-2 ring-secondary" />
                <span className="text-gray-600">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded" />
                <span className="text-gray-600">Selected</span>
              </div>
            </div>
          </div>

          {/* Time Slots Panel */}
          {selectedDate && !selectedSlot && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 animate-in slide-in-from-top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Available Times for {formatDisplayDate(selectedDate)}
              </h3>

              {isLoadingSlots ? (
                <div className="text-center py-8 text-gray-500">Loading available times...</div>
              ) : slotsForSelectedDate.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No available times for this date. Please select another date.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {slotsForSelectedDate.map((slot) => (
                    <button
                      key={`${slot.date}-${slot.startTime}-${slot.teacherId}`}
                      type="button"
                      onClick={() => handleSlotSelect(slot)}
                      className="p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary-50 transition-all text-center"
                    >
                      <div className="font-semibold text-gray-900">
                        {formatDisplayTime(slot.startTime)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">with {slot.teacherName}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Step 2: Your Details
  const renderStep2 = () => {
    // Pre-fill from URL param or existing form data
    const initialData = formData || {
      fullName: '',
      email: '',
      whatsapp: '',
      sex: 'male',
      country: '',
      currentLevel: 'complete_beginner',
      preferredPackage: searchParams.get('package') || 'not_sure',
      message: '',
    };

    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">About You</h1>
          <p className="text-gray-600">
            Help us understand your needs so we can match you with the right teacher.
          </p>
        </div>

        <form onSubmit={handleDetailsSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              minLength={2}
              maxLength={100}
              defaultValue={initialData.fullName}
              className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              defaultValue={initialData.email}
              className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="john@example.com"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-semibold text-gray-700 mb-1.5">
              WhatsApp Number *
            </label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              required
              minLength={7}
              maxLength={20}
              defaultValue={initialData.whatsapp}
              className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="+1 234 567 8900"
            />
            <p className="text-sm text-gray-500 mt-1">We'll send confirmation and reminders via WhatsApp</p>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender *</label>
            <div className="grid grid-cols-2 gap-4">
              {(['male', 'female'] as const).map((sex) => (
                <label
                  key={sex}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    initialData.sex === sex
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300',
                  )}
                >
                  <input
                    type="radio"
                    name="sex"
                    value={sex}
                    defaultChecked={initialData.sex === sex}
                    required
                    className="w-4 h-4 text-primary"
                  />
                  <span className="font-medium capitalize">{sex}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Country *
            </label>
            <select
              id="country"
              name="country"
              required
              defaultValue={initialData.country}
              className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select your country</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Current Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Current Quran Level *
            </label>
            <div className="space-y-3">
              {CURRENT_LEVELS.map((level) => (
                <label
                  key={level.value}
                  className={cn(
                    'flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all',
                    initialData.currentLevel === level.value
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="currentLevel"
                      value={level.value}
                      defaultChecked={initialData.currentLevel === level.value}
                      required
                      className="w-4 h-4 text-primary mt-1"
                    />
                    <div>
                      <span className="font-medium text-gray-900">{level.label}</span>
                      <p className="text-sm text-gray-500 mt-1">{level.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Preferred Package */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Preferred Package *
            </label>
            <div className="space-y-3">
              {PREFERRED_PACKAGES.map((pkg) => (
                <label
                  key={pkg.value}
                  className={cn(
                    'flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all',
                    initialData.preferredPackage === pkg.value
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="preferredPackage"
                      value={pkg.value}
                      defaultChecked={initialData.preferredPackage === pkg.value}
                      required
                      className="w-4 h-4 text-primary mt-1"
                    />
                    <div>
                      <span className="font-medium text-gray-900">{pkg.label}</span>
                      <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Message (Optional)
            </label>
            <textarea
              id="message"
              name="message"
              maxLength={500}
              defaultValue={initialData.message}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Tell us about your goals or any specific requirements..."
            />
            <p className="text-sm text-gray-500 mt-1 text-right">Max 500 characters</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              ← Back
            </Button>
            <Button type="submit" className="flex-1">
              Continue →
            </Button>
          </div>
        </form>
      </div>
    );
  };

  // Step 3: Review & Confirm
  const renderStep3 = () => {
    if (!selectedSlot || !formData) return null;

    const packageLabel = PREFERRED_PACKAGES.find((p) => p.value === formData.preferredPackage)?.label;
    const levelLabel = CURRENT_LEVELS.find((l) => l.value === formData.currentLevel)?.label;

    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review & Confirm</h1>
          <p className="text-gray-600">Please review your booking details before confirming.</p>
        </div>

        {/* Booking Summary */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-medium text-gray-900">{formatDisplayDate(selectedSlot.date)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Time</span>
              <span className="font-medium text-gray-900">
                {formatDisplayTime(selectedSlot.startTime)} - {formatDisplayTime(selectedSlot.endTime)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Teacher</span>
              <span className="font-medium text-gray-900">{selectedSlot.teacherName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Platform</span>
              <span className="font-medium text-gray-900">Via Zoom</span>
            </div>

            <hr className="border-primary-200" />

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Your Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="text-gray-900">{formData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="text-gray-900">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">WhatsApp</span>
                  <span className="text-gray-900">{formData.whatsapp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender</span>
                  <span className="text-gray-900 capitalize">{formData.sex}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Country</span>
                  <span className="text-gray-900">{formData.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Level</span>
                  <span className="text-gray-900">{levelLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Preferred Package</span>
                  <span className="text-gray-900">{packageLabel}</span>
                </div>
                {formData.message && (
                  <div className="pt-2">
                    <span className="text-gray-600">Message:</span>
                    <p className="text-gray-900 mt-1">{formData.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            By confirming this booking, you agree to be contacted via WhatsApp and email regarding your
            assessment call. We'll send you a Zoom link before the session.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(2)}
            disabled={isSubmitting}
            className="flex-1"
          >
            ← Edit Details
          </Button>
          <Button
            onClick={handleConfirmBooking}
            isLoading={isSubmitting}
            className="flex-1"
          >
            Confirm My Booking
          </Button>
        </div>
      </div>
    );
  };

  // Step 4: Success
  const renderStep4 = () => {
    if (!selectedSlot || !formData) return null;

    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">You're All Set!</h1>
        <p className="text-gray-600 mb-4">
          Your free assessment call has been booked.
        </p>

        {/* Email Confirmation Status */}
        {emailSent ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-green-800">
              ✓ Confirmation email sent to {formData.email}
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              Email confirmation will be sent shortly.
            </p>
          </div>
        )}

        {/* Recap */}
        <div className="bg-gray-50 rounded-xl p-6 text-left mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Booking Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-medium text-gray-900">{formatDisplayDate(selectedSlot.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time</span>
              <span className="font-medium text-gray-900">
                {formatDisplayTime(selectedSlot.startTime)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Teacher</span>
              <span className="font-medium text-gray-900">{selectedSlot.teacherName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-gray-900">{formData.email}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="text-left mb-8">
          <h2 className="font-semibold text-gray-900 mb-3">What's Next?</h2>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="font-medium text-primary">1.</span>
              <span>Check your email for the booking confirmation</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-primary">2.</span>
              <span>Receive a WhatsApp reminder before your call</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-primary">3.</span>
              <span>Get your Zoom link 1 hour before the session</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-primary">4.</span>
              <span>Join your call and start your Quran journey!</span>
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/#programs')}
            className="flex-1"
          >
            View Programs
          </Button>
          <Button
            onClick={() => {
              reset();
              navigate('/');
            }}
            className="flex-1"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Book Free Assessment | Quran Discipline Academy</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Schedule your free assessment call with Quran Discipline Academy. Choose a time that works for you and start your Quran learning journey." />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="font-semibold text-gray-900 hidden sm:inline">
              Quran Discipline Academy
            </span>
          </button>

          {/* Step Indicator */}
          {step < 4 && (
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                      step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600',
                    )}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={cn(
                        'w-8 h-0.5 transition-colors',
                        step > s ? 'bg-primary' : 'bg-gray-200',
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              reset();
              navigate('/');
            }}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </main>
    </div>
    </>
  );
}
