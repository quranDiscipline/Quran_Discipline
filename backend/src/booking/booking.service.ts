import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BookingStatus, Sex } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingRequestDto, AssignBookingDto, ConfirmBookingDto } from './dto';

// Type for available slots
export interface AvailableSlot {
  teacherId: string;
  teacherName: string;
  teacherSex: Sex;
  teacherProfilePicture: string | null;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  dayOfWeek: string;
}

type BookingRequestWithTeacher = {
  id: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  sex: string;
  country: string;
  currentLevel: string;
  preferredPackage: string;
  preferredTeacherSex: string | null;
  message: string | null;
  preferredDate: Date | null;
  preferredTime: string | null;
  assignedToId: string | null;
  status: BookingStatus;
  zoomLink: string | null;
  createdAt: Date;
  updatedAt: Date;
  assignedTo: { user: { fullName: string } } | null;
};

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookingRequestDto) {
    let teacherId: string | undefined;

    // If selectedSlotId is provided, parse it to extract teacherId
    // Format: teacherId-date-startTime (teacherId can contain hyphens, so we need to be careful)
    if (dto.selectedSlotId) {
      // The format is: teacherId-date-startTime
      // We need to extract the teacherId which is everything before the last two date-time parts
      // Format: teacherId-YYYY-MM-DD-HH:MM
      const parts = dto.selectedSlotId.split('-');
      if (parts.length >= 4) {
        // Rejoin the teacherId part (everything except the last 3 parts: date and time)
        // Date is YYYY-MM-DD (2 parts), time is HH:MM (1 part)
        const timePart = parts[parts.length - 1]; // HH:MM
        const dateDay = parts[parts.length - 2]; // DD
        const dateMonth = parts[parts.length - 3]; // MM
        const dateYear = parts[parts.length - 4]; // YYYY

        // Everything before YYYY-MM-DD-HH:MM is the teacherId
        const teacherIdParts = parts.slice(0, parts.length - 4);
        teacherId = teacherIdParts.join('-');
      }
    }

    const booking = await this.prisma.bookingRequest.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        whatsappNumber: dto.whatsappNumber,
        sex: dto.sex as any,
        country: dto.country,
        currentLevel: dto.currentLevel,
        preferredPackage: dto.preferredPackage,
        preferredTeacherSex: dto.preferredTeacherSex,
        message: dto.message,
        preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : null,
        preferredTime: dto.preferredTime,
        status: teacherId ? BookingStatus.confirmed : BookingStatus.pending,
        assignedToId: teacherId,
      },
    });

    // TODO Phase 8: Send confirmation email to student
    // await this.emailService.sendBookingConfirmationEmail(dto.email, booking.id);

    // TODO Phase 8: Send notification email to admin
    // await this.emailService.sendAdminNotificationNewBooking(booking);

    return booking;
  }

  async findAll(page = 1, limit = 20, status?: BookingStatus): Promise<PaginatedResponse<BookingRequestWithTeacher>> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== undefined) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      this.prisma.bookingRequest.findMany({
        where,
        include: {
          assignedTo: {
            include: {
              user: {
                select: { fullName: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.bookingRequest.count({ where }),
    ]);

    return {
      data: bookings as BookingRequestWithTeacher[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<BookingRequestWithTeacher> {
    const booking = await this.prisma.bookingRequest.findUnique({
      where: { id },
      include: {
        assignedTo: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking request not found');
    }

    return booking as BookingRequestWithTeacher;
  }

  async assign(id: string, dto: AssignBookingDto): Promise<BookingRequestWithTeacher> {
    const booking = await this.prisma.bookingRequest.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking request not found');
    }

    // Verify teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: dto.teacherId },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Check teacher has availability matching preferred time (soft check)
    if (!teacher.isAvailable) {
      // Warn but allow - we'll include a note in response
      console.warn(`Assigning unavailable teacher to booking ${id}`);
    }

    const updated = await this.prisma.bookingRequest.update({
      where: { id },
      data: {
        assignedToId: dto.teacherId,
      },
      include: {
        assignedTo: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    return updated as BookingRequestWithTeacher;
  }

  async confirm(id: string, dto: ConfirmBookingDto): Promise<BookingRequestWithTeacher> {
    const booking = await this.prisma.bookingRequest.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking request not found');
    }

    // Must be assigned before confirming
    if (!booking.assignedToId) {
      throw new BadRequestException('Cannot confirm unassigned booking request');
    }

    const updated = await this.prisma.bookingRequest.update({
      where: { id },
      data: {
        status: BookingStatus.confirmed,
        zoomLink: dto.zoomLink,
      },
      include: {
        assignedTo: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    // TODO Phase 8: Send confirmation email to student with Zoom link
    // await this.emailService.sendBookingConfirmedEmail(booking.email, dto.zoomLink, dto.confirmedDate, dto.confirmedTime);

    return updated as BookingRequestWithTeacher;
  }

  async cancel(id: string): Promise<void> {
    const booking = await this.prisma.bookingRequest.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking request not found');
    }

    if (booking.status === BookingStatus.completed) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    await this.prisma.bookingRequest.update({
      where: { id },
      data: { status: BookingStatus.cancelled },
    });
  }

  /**
   * Get available booking slots
   * Returns slots from teacher schedules that don't conflict with existing sessions or confirmed bookings
   */
  async getAvailableSlots(date?: string, teacherSex?: Sex): Promise<AvailableSlot[]> {
    // Determine date window
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate: Date;
    let endDate: Date;

    if (date) {
      // Specific date provided
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      endDate.setHours(0, 0, 0, 0);
    } else {
      // Next 14 days
      startDate = today;
      endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 14);
    }

    // Get all teacher schedules within the date window
    const schedules = await this.prisma.teacherSchedule.findMany({
      where: {
        isAvailable: true,
        teacher: {
          isAvailable: true,
          user: {
            isActive: true,
            ...(teacherSex && { sex: teacherSex }),
          },
        },
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                fullName: true,
                sex: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
    });

    // Get blocked dates
    const blockedDates = await this.prisma.blockedDate.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        teacherId: true,
        date: true,
      },
    });

    // Create a set of blocked dates (teacherId-date or "global-date")
    const blockedDateSet = new Set<string>();
    for (const blocked of blockedDates) {
      const dateKey = blocked.date.toISOString().split('T')[0];
      if (blocked.teacherId) {
        blockedDateSet.add(`${blocked.teacherId}-${dateKey}`);
      } else {
        blockedDateSet.add(`global-${dateKey}`);
      }
    }

    // Get all existing sessions in the date window
    const existingSessions = await this.prisma.session.findMany({
      where: {
        scheduledAt: {
          gte: startDate,
          lt: endDate,
        },
        status: {
          in: ['scheduled', 'completed'],
        },
      },
      select: {
        teacherId: true,
        scheduledAt: true,
        durationMinutes: true,
      },
    });

    // Get all confirmed booking requests in the date window
    const confirmedBookings = await this.prisma.bookingRequest.findMany({
      where: {
        status: BookingStatus.confirmed,
        preferredDate: {
          gte: startDate,
          lt: endDate,
        },
        preferredTime: {
          not: null,
        },
        assignedToId: {
          not: null,
        },
      },
      select: {
        assignedToId: true,
        preferredDate: true,
        preferredTime: true,
      },
    });

    // Build a set of taken slots (teacherId + date + time)
    const takenSlots = new Set<string>();

    // Add sessions to taken slots
    for (const session of existingSessions) {
      const sessionDate = new Date(session.scheduledAt);
      const dateKey = sessionDate.toISOString().split('T')[0];
      const hour = sessionDate.getHours();
      const minute = sessionDate.getMinutes();
      const timeKey = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      // Mark the slot as taken (teacherId + date + time)
      takenSlots.add(`${session.teacherId}-${dateKey}-${timeKey}`);

      // Also mark overlapping time slots based on duration
      const durationMinutes = session.durationMinutes || 60;
      for (let offset = 30; offset < durationMinutes; offset += 30) {
        const endTime = new Date(sessionDate);
        endTime.setMinutes(endTime.getMinutes() + offset);
        const endHour = endTime.getHours();
        const endMinute = endTime.getMinutes();
        const endTimeKey = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        takenSlots.add(`${session.teacherId}-${dateKey}-${endTimeKey}`);
      }
    }

    // Add confirmed bookings to taken slots
    for (const booking of confirmedBookings) {
      if (booking.preferredDate && booking.preferredTime) {
        const dateKey = new Date(booking.preferredDate).toISOString().split('T')[0];
        takenSlots.add(`${booking.assignedToId}-${dateKey}-${booking.preferredTime}`);
      }
    }

    // Generate all available slots
    const availableSlots: AvailableSlot[] = [];
    const dayOfWeekMap: Record<number, string> = {
      0: 'monday',
      1: 'tuesday',
      2: 'wednesday',
      3: 'thursday',
      4: 'friday',
      5: 'saturday',
      6: 'sunday',
    };

    // For each schedule, generate slots for each matching date
    for (const schedule of schedules) {
      const { teacher, dayOfWeek, startTime, endTime } = schedule;

      // Generate dates within the window
      const currentDate = new Date(startDate);
      while (currentDate < endDate) {
        const currentDayOfWeek = dayOfWeekMap[currentDate.getDay()];

        // Check if this date matches the schedule's day
        if (currentDayOfWeek === dayOfWeek) {
          const dateKey = currentDate.toISOString().split('T')[0];
          const slotKey = `${teacher.id}-${dateKey}-${startTime}`;

          // Check if date is blocked (globally or for this teacher)
          const isGloballyBlocked = blockedDateSet.has(`global-${dateKey}`);
          const isTeacherBlocked = blockedDateSet.has(`${teacher.id}-${dateKey}`);

          // Skip if this slot is taken or blocked
          if (!takenSlots.has(slotKey) && !isGloballyBlocked && !isTeacherBlocked) {
            availableSlots.push({
              teacherId: teacher.id,
              teacherName: teacher.user.fullName,
              teacherSex: teacher.user.sex,
              teacherProfilePicture: teacher.user.profilePictureUrl,
              date: dateKey,
              startTime,
              endTime,
              dayOfWeek,
            });
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Sort by date, then by start time
    availableSlots.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    });

    return availableSlots;
  }

  /**
   * Get available dates for a given month
   * Returns dates (YYYY-MM-DD) that have at least one available time slot
   */
  async getAvailableDates(month: string, teacherSex?: Sex): Promise<string[]> {
    // Parse month parameter (format: YYYY-MM)
    const [year, monthNum] = month.split('-').map(Number);

    if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
      throw new BadRequestException('Invalid month format. Use YYYY-MM.');
    }

    // Calculate start and end of month
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59); // Last day of month

    // Don't return past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const effectiveStartDate = startDate < today ? today : startDate;

    // Get all teacher schedules for the month
    const schedules = await this.prisma.teacherSchedule.findMany({
      where: {
        isAvailable: true,
        teacher: {
          isAvailable: true,
          user: {
            isActive: true,
            ...(teacherSex && { sex: teacherSex }),
          },
        },
      },
      select: {
        dayOfWeek: true,
        teacherId: true,
      },
    });

    // Build a set of days of the week that have teachers
    const availableDaysOfWeek = new Set(
      schedules.map((s) => s.dayOfWeek),
    );

    // Get blocked dates for the month
    const blockedDates = await this.prisma.blockedDate.findMany({
      where: {
        date: {
          gte: effectiveStartDate,
          lte: endDate,
        },
      },
      select: {
        teacherId: true,
        date: true,
      },
    });

    // Create a set of blocked dates (teacherId-date or "global-date")
    const blockedDateSet = new Set<string>();
    for (const blocked of blockedDates) {
      const dateKey = blocked.date.toISOString().split('T')[0];
      if (blocked.teacherId) {
        blockedDateSet.add(`${blocked.teacherId}-${dateKey}`);
      } else {
        blockedDateSet.add(`global-${dateKey}`);
      }
    }

    // Get all existing sessions in the date window
    const existingSessions = await this.prisma.session.findMany({
      where: {
        scheduledAt: {
          gte: effectiveStartDate,
          lte: endDate,
        },
        status: {
          in: ['scheduled', 'completed'],
        },
      },
      select: {
        teacherId: true,
        scheduledAt: true,
      },
    });

    // Get all confirmed booking requests in the date window
    const confirmedBookings = await this.prisma.bookingRequest.findMany({
      where: {
        status: BookingStatus.confirmed,
        preferredDate: {
          gte: effectiveStartDate,
          lte: endDate,
        },
        preferredTime: {
          not: null,
        },
        assignedToId: {
          not: null,
        },
      },
      select: {
        assignedToId: true,
        preferredDate: true,
        preferredTime: true,
      },
    });

    // Build a map of taken slots (teacherId-date)
    const takenSlots = new Set<string>();

    for (const session of existingSessions) {
      const dateKey = session.scheduledAt.toISOString().split('T')[0];
      takenSlots.add(`${session.teacherId}-${dateKey}`);
    }

    for (const booking of confirmedBookings) {
      if (booking.preferredDate) {
        const dateKey = new Date(booking.preferredDate).toISOString().split('T')[0];
        takenSlots.add(`${booking.assignedToId}-${dateKey}`);
      }
    }

    // Generate all dates in the month
    const availableDates: string[] = [];
    const currentDate = new Date(effectiveStartDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek] as any;

      // Check if this day of week has teachers
      if (availableDaysOfWeek.has(dayName)) {
        const dateKey = currentDate.toISOString().split('T')[0];

        // Check if date is globally blocked
        if (blockedDateSet.has(`global-${dateKey}`)) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        // Check if there's at least one teacher with availability on this date
        const hasAvailableSlot = schedules.some((schedule) => {
          if (schedule.dayOfWeek !== dayName) return false;
          const slotKey = `${schedule.teacherId}-${dateKey}`;
          return !takenSlots.has(slotKey) && !blockedDateSet.has(slotKey);
        });

        if (hasAvailableSlot) {
          availableDates.push(dateKey);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableDates;
  }
}
