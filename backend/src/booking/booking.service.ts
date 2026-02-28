import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingRequestDto, AssignBookingDto, ConfirmBookingDto } from './dto';

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
        status: BookingStatus.pending,
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
}
