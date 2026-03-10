import emailjs from '@emailjs/browser';
import { emailConfig } from '@/config/email.config';

// Initialize EmailJS
emailjs.init(emailConfig.publicKey);

/**
 * Send booking confirmation email to student
 */
export const sendBookingConfirmationEmail = async (params: {
  to_email: string;
  student_name: string;
  booking_date: string;
  booking_time: string;
  teacher_name: string;
}) => {
  return await emailjs.send(
    emailConfig.serviceId,
    emailConfig.templates.bookingConfirmation,
    params,
    {
      privateKey: emailConfig.privateKey,
    } as any,
  );
};

/**
 * Send notification email to admin about new booking
 */
export const sendAdminNotificationEmail = async (params: {
  to_email: string;
  student_name: string;
  student_email: string;
  student_whatsapp: string;
  booking_date: string;
  booking_time: string;
  teacher_preference: string;
  message?: string;
}) => {
  return await emailjs.send(
    emailConfig.serviceId,
    emailConfig.templates.adminNotification,
    params,
    {
      privateKey: emailConfig.privateKey,
    } as any,
  );
};

/**
 * Format date for email (e.g., "March 15, 2026")
 */
export const formatDateForEmail = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time for email (e.g., "10:00 AM")
 */
export const formatTimeForEmail = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};
