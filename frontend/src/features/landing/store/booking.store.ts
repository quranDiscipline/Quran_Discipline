import { create } from 'zustand';
import type { AvailableSlot, BookingFormData, CreateBookingRequestDto } from '../types/landing.types';
import { bookingApi } from '../services/booking.service';
import {
  sendBookingConfirmationEmail,
  sendAdminNotificationEmail,
  formatDateForEmail,
  formatTimeForEmail,
} from '@/services/emailjs.service';
import { emailConfig } from '@/config/email.config';

interface BookingState {
  selectedSlot: AvailableSlot | null;
  formData: Partial<BookingFormData> | null;
  currentStep: 1 | 2 | 3;
  isSubmitting: boolean;
  isConfirmed: boolean;
  error: string | null;
  currentMonth: Date;
  teacherSexFilter: 'male' | 'female' | null;
  bookingReference: string | null;
  emailSent: boolean;
}

interface BookingActions {
  setSelectedSlot: (slot: AvailableSlot | null) => void;
  setFormData: (data: BookingFormData) => void;
  goToStep: (step: 1 | 2 | 3) => void;
  submitBooking: () => Promise<void>;
  reset: () => void;
  setCurrentMonth: (date: Date) => void;
  setTeacherSexFilter: (sex: 'male' | 'female' | null) => void;
}

type BookingStore = BookingState & BookingActions;

export const useBookingStore = create<BookingStore>((set, get) => ({
  // State
  selectedSlot: null,
  formData: null,
  currentStep: 1,
  isSubmitting: false,
  isConfirmed: false,
  error: null,
  currentMonth: new Date(),
  teacherSexFilter: null,
  bookingReference: null,
  emailSent: false,

  // Actions
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),

  setFormData: (data) => set({ formData: data }),

  goToStep: (step) => set({ currentStep: step }),

  submitBooking: async () => {
    const { selectedSlot, formData } = get();

    if (!selectedSlot || !formData) {
      set({ error: 'Please select a time slot and fill in your details' });
      return;
    }

    // Validate required fields
    const requiredFields: (keyof BookingFormData)[] = ['fullName', 'email', 'whatsapp', 'sex', 'country', 'currentLevel', 'preferredPackage'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        set({ error: `Please fill in all required fields` });
        return;
      }
    }

    set({ isSubmitting: true, error: null, emailSent: false });

    try {
      // Get user's timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Generate slot ID for backend (format: teacherId-date-startTime)
      const selectedSlotId = `${selectedSlot.teacherId}-${selectedSlot.date}-${selectedSlot.startTime}`;

      const dto: CreateBookingRequestDto = {
        ...(formData as BookingFormData),
        teacherId: selectedSlot.teacherId,
        preferredDate: selectedSlot.date,
        preferredTime: selectedSlot.startTime,
        selectedSlotId,
        timezone,
      };

      const response = await bookingApi.createBookingRequest(dto);

      // Send confirmation email to student
      try {
        await sendBookingConfirmationEmail({
          to_email: formData.email!,
          student_name: formData.fullName!,
          booking_date: formatDateForEmail(selectedSlot.date),
          booking_time: formatTimeForEmail(selectedSlot.startTime),
          teacher_name: selectedSlot.teacherName,
        });
      } catch (emailError) {
        console.error('Failed to send student confirmation email:', emailError);
        // Don't fail the booking if email fails
      }

      // Send notification email to admin
      try {
        await sendAdminNotificationEmail({
          to_email: emailConfig.adminEmail,
          student_name: formData.fullName!,
          student_email: formData.email!,
          student_whatsapp: formData.whatsapp!,
          booking_date: formatDateForEmail(selectedSlot.date),
          booking_time: formatTimeForEmail(selectedSlot.startTime),
          teacher_preference: formData.sex!,
          message: formData.message,
        });
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
        // Don't fail the booking if email fails
      }

      set({
        isSubmitting: false,
        isConfirmed: true,
        error: null,
        bookingReference: response.id || null,
        emailSent: true,
      });
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error.error?.message || 'Failed to submit booking request',
        emailSent: false,
      });
    }
  },

  reset: () =>
    set({
      selectedSlot: null,
      formData: null,
      currentStep: 1,
      isSubmitting: false,
      isConfirmed: false,
      error: null,
      currentMonth: new Date(),
      teacherSexFilter: null,
      bookingReference: null,
      emailSent: false,
    }),

  setCurrentMonth: (date) => set({ currentMonth: date }),

  setTeacherSexFilter: (sex) => set({ teacherSexFilter: sex }),
}));
