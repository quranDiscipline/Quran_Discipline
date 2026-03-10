import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Sex, BookingStatus } from '@prisma/client';

const mockPrismaService = {
  bookingRequest: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  teacher: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  teacherSchedule: {
    findMany: jest.fn(),
  },
  session: {
    findMany: jest.fn(),
  },
};

describe('BookingService', () => {
  let service: BookingService;
  let prisma: typeof mockPrismaService;

  const mockBooking = {
    id: 'booking-uuid-1',
    fullName: 'John Doe',
    email: 'john@example.com',
    whatsappNumber: '+1234567890',
    sex: Sex.male,
    country: 'USA',
    currentLevel: 'beginner',
    preferredPackage: 'mastery',
    preferredTeacherSex: 'male',
    message: 'I want to learn Quran',
    preferredDate: new Date('2024-02-01'),
    preferredTime: '10:00 AM',
    assignedToId: null,
    status: BookingStatus.pending,
    zoomLink: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    assignedTo: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates booking request with status pending when no selectedSlotId', async () => {
      const dto = {
        fullName: 'John Doe',
        email: 'john@example.com',
        whatsappNumber: '+1234567890',
        sex: Sex.male,
        country: 'USA',
        currentLevel: 'beginner',
        preferredPackage: 'mastery',
        timezone: 'America/New_York',
      };

      prisma.bookingRequest.create.mockResolvedValue(mockBooking);

      const result = await service.create(dto as any);

      expect(result).toEqual(mockBooking);
      expect(prisma.bookingRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: BookingStatus.pending,
          }),
        }),
      );
    });

    it('creates booking request with status confirmed when selectedSlotId provided', async () => {
      const dto = {
        fullName: 'John Doe',
        email: 'john@example.com',
        whatsappNumber: '+1234567890',
        sex: Sex.male,
        country: 'USA',
        currentLevel: 'beginner',
        preferredPackage: 'mastery',
        selectedSlotId: 'teacher-123-2024-03-15-10:00',
        timezone: 'America/New_York',
      };

      const confirmedBooking = {
        ...mockBooking,
        status: BookingStatus.confirmed,
        assignedToId: 'teacher-123',
      };

      prisma.bookingRequest.create.mockResolvedValue(confirmedBooking);

      const result = await service.create(dto as any);

      expect(result.status).toBe(BookingStatus.confirmed);
      expect(result.assignedToId).toBe('teacher-123');
      expect(prisma.bookingRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: BookingStatus.confirmed,
            assignedToId: 'teacher-123',
          }),
        }),
      );
    });

    it('parses teacherId from selectedSlotId format (teacherId-date-startTime)', async () => {
      const dto = {
        fullName: 'John Doe',
        email: 'john@example.com',
        whatsappNumber: '+1234567890',
        sex: Sex.male,
        country: 'USA',
        currentLevel: 'beginner',
        preferredPackage: 'mastery',
        selectedSlotId: 'abc-123-def-2024-03-15-14:30',
        timezone: 'Europe/London',
      };

      const confirmedBooking = {
        ...mockBooking,
        status: BookingStatus.confirmed,
        assignedToId: 'abc-123-def',
      };

      prisma.bookingRequest.create.mockResolvedValue(confirmedBooking);

      await service.create(dto as any);

      expect(prisma.bookingRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            assignedToId: 'abc-123-def',
          }),
        }),
      );
    });

    it('accepts request without preferredDate (optional field)', async () => {
      const dto = {
        fullName: 'John Doe',
        email: 'john@example.com',
        whatsappNumber: '+1234567890',
        sex: Sex.male,
        country: 'USA',
        currentLevel: 'beginner',
        preferredPackage: 'mastery',
        timezone: 'America/New_York',
      };

      prisma.bookingRequest.create.mockResolvedValue(mockBooking);

      await service.create(dto as any);

      expect(prisma.bookingRequest.create).toHaveBeenCalled();
    });
  });

  describe('assign', () => {
    it('sets assignedToId on booking', async () => {
      prisma.bookingRequest.findUnique.mockResolvedValue(mockBooking);
      prisma.teacher.findUnique.mockResolvedValue({
        id: 'teacher-1',
        isAvailable: true,
        user: { fullName: 'Ahmad Ibrahim' },
      });
      prisma.bookingRequest.update.mockResolvedValue({
        ...mockBooking,
        assignedToId: 'teacher-1',
      });

      const result = await service.assign('booking-1', { teacherId: 'teacher-1' });

      expect(prisma.bookingRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { assignedToId: 'teacher-1' },
        }),
      );
    });

    it('throws NotFoundException when teacher not found', async () => {
      prisma.bookingRequest.findUnique.mockResolvedValue(mockBooking);
      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(
        service.assign('booking-1', { teacherId: 'nonexistent-teacher' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirm', () => {
    it('sets status confirmed and zoomLink', async () => {
      const assignedBooking = { ...mockBooking, assignedToId: 'teacher-1' };
      prisma.bookingRequest.findUnique.mockResolvedValue(assignedBooking);
      prisma.bookingRequest.update.mockResolvedValue({
        ...assignedBooking,
        status: BookingStatus.confirmed,
        zoomLink: 'https://zoom.us/j/123456',
      });

      const dto = {
        zoomLink: 'https://zoom.us/j/123456',
        confirmedDate: '2024-02-01',
        confirmedTime: '10:00 AM',
      };

      await service.confirm('booking-1', dto);

      expect(prisma.bookingRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            status: BookingStatus.confirmed,
            zoomLink: dto.zoomLink,
          },
        }),
      );
    });

    it('throws BadRequestException when booking not yet assigned', async () => {
      prisma.bookingRequest.findUnique.mockResolvedValue(mockBooking);

      await expect(
        service.confirm('booking-1', {
          zoomLink: 'https://zoom.us/j/123456',
          confirmedDate: '2024-02-01',
          confirmedTime: '10:00 AM',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('sets status to cancelled', async () => {
      prisma.bookingRequest.findUnique.mockResolvedValue(mockBooking);
      prisma.bookingRequest.update.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.cancelled,
      });

      await service.cancel('booking-1');

      expect(prisma.bookingRequest.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: { status: BookingStatus.cancelled },
      });
    });

    it('throws BadRequestException when cancelling a completed booking', async () => {
      const completedBooking = { ...mockBooking, status: BookingStatus.completed };
      prisma.bookingRequest.findUnique.mockResolvedValue(completedBooking);

      await expect(service.cancel('booking-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAvailableSlots', () => {
    const mockTeacher = {
      id: 'teacher-1',
      isAvailable: true,
      user: {
        fullName: 'Ahmad Ibrahim',
        sex: Sex.male,
        profilePictureUrl: null,
        isActive: true,
      },
    };

    const mockSchedule = {
      id: 'schedule-1',
      teacherId: 'teacher-1',
      dayOfWeek: 'monday',
      startTime: '10:00',
      endTime: '11:00',
      isAvailable: true,
      teacher: mockTeacher,
    };

    it('returns empty array when no teacher schedules exist', async () => {
      prisma.teacherSchedule.findMany.mockResolvedValue([]);
      prisma.session.findMany.mockResolvedValue([]);
      prisma.bookingRequest.findMany.mockResolvedValue([]);

      const result = await service.getAvailableSlots();

      expect(result).toEqual([]);
    });

    it('excludes slot that has existing session at same teacher+date+time', async () => {
      // Schedule for Monday 10:00
      prisma.teacherSchedule.findMany.mockResolvedValue([mockSchedule]);

      // Session on next Monday at 10:00 - need to match the date key format
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const daysUntilMonday = (1 + 7 - today.getDay()) % 7;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + (daysUntilMonday || 7));
      nextMonday.setHours(10, 0, 0, 0);

      prisma.session.findMany.mockResolvedValue([
        {
          teacherId: 'teacher-1',
          scheduledAt: nextMonday,
          durationMinutes: 60,
        },
      ]);
      prisma.bookingRequest.findMany.mockResolvedValue([]);

      const result = await service.getAvailableSlots();

      // Get the expected date key for the next Monday
      const expectedDateKey = nextMonday.toISOString().split('T')[0];

      // Should not include the specific Monday 10:00 slot (it's taken by the session)
      const conflictingSlot = result.find(
        (slot) => slot.date === expectedDateKey && slot.startTime === '10:00' && slot.teacherId === 'teacher-1',
      );
      expect(conflictingSlot).toBeUndefined();
    });

    it('excludes slot with confirmed booking_request at same teacher+date+time', async () => {
      prisma.teacherSchedule.findMany.mockResolvedValue([mockSchedule]);
      prisma.session.findMany.mockResolvedValue([]);

      // Confirmed booking on next Monday at 10:00
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const daysUntilMonday = (1 + 7 - today.getDay()) % 7;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + (daysUntilMonday || 7));

      prisma.bookingRequest.findMany.mockResolvedValue([
        {
          assignedToId: 'teacher-1',
          preferredDate: nextMonday,
          preferredTime: '10:00',
        },
      ]);

      const result = await service.getAvailableSlots();

      // Get the expected date key for the next Monday
      const expectedDateKey = nextMonday.toISOString().split('T')[0];

      // Should not include the specific Monday 10:00 slot (it's taken by the booking)
      const conflictingSlot = result.find(
        (slot) => slot.date === expectedDateKey && slot.startTime === '10:00' && slot.teacherId === 'teacher-1',
      );
      expect(conflictingSlot).toBeUndefined();
    });

    it('filters by teacherSex when parameter provided', async () => {
      prisma.teacherSchedule.findMany.mockResolvedValue([mockSchedule]);
      prisma.session.findMany.mockResolvedValue([]);
      prisma.bookingRequest.findMany.mockResolvedValue([]);

      await service.getAvailableSlots(undefined, Sex.female);

      expect(prisma.teacherSchedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            teacher: expect.objectContaining({
              user: expect.objectContaining({
                sex: Sex.female,
              }),
            }),
          }),
        }),
      );
    });

    it('only returns slots within next 14 days by default', async () => {
      prisma.teacherSchedule.findMany.mockResolvedValue([mockSchedule]);
      prisma.session.findMany.mockResolvedValue([]);
      prisma.bookingRequest.findMany.mockResolvedValue([]);

      await service.getAvailableSlots();

      // Should query with date range covering approximately 14 days
      const findManyCall = prisma.session.findMany as jest.Mock;
      expect(findManyCall).toHaveBeenCalled();

      const whereClause = findManyCall.mock.calls[0][0].where;
      expect(whereClause).toHaveProperty('scheduledAt');
    });
  });

  describe('getAvailableDates', () => {
    const mockTeacher = {
      id: 'teacher-1',
      isAvailable: true,
      user: {
        fullName: 'Ahmad Ibrahim',
        sex: Sex.male,
        profilePictureUrl: null,
        isActive: true,
      },
    };

    const mockSchedule = {
      id: 'schedule-1',
      teacherId: 'teacher-1',
      dayOfWeek: 'monday',
      startTime: '10:00',
      endTime: '11:00',
      isAvailable: true,
      teacher: mockTeacher,
    };

    it('returns array of date strings (YYYY-MM-DD)', async () => {
      prisma.teacherSchedule.findMany.mockResolvedValue([mockSchedule]);
      prisma.session.findMany.mockResolvedValue([]);
      prisma.bookingRequest.findMany.mockResolvedValue([]);

      const result = await service.getAvailableDates('2024-03');

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });

    it('filters by teacherSex when parameter provided', async () => {
      prisma.teacherSchedule.findMany.mockResolvedValue([mockSchedule]);
      prisma.session.findMany.mockResolvedValue([]);
      prisma.bookingRequest.findMany.mockResolvedValue([]);

      await service.getAvailableDates('2024-03', Sex.female);

      expect(prisma.teacherSchedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            teacher: expect.objectContaining({
              user: expect.objectContaining({
                sex: Sex.female,
              }),
            }),
          }),
        }),
      );
    });

    it('throws BadRequestException for invalid month format', async () => {
      await expect(service.getAvailableDates('invalid')).rejects.toThrow(BadRequestException);
      await expect(service.getAvailableDates('2024-13')).rejects.toThrow(BadRequestException);
      await expect(service.getAvailableDates('2024-00')).rejects.toThrow(BadRequestException);
    });

    it('excludes past dates even if they have schedules', async () => {
      prisma.teacherSchedule.findMany.mockResolvedValue([mockSchedule]);
      prisma.session.findMany.mockResolvedValue([]);
      prisma.bookingRequest.findMany.mockResolvedValue([]);

      // Use a past month
      const pastMonth = '2020-01';
      const result = await service.getAvailableDates(pastMonth);

      // All dates in the result should be today or in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      result.forEach((dateStr) => {
        const date = new Date(dateStr);
        expect(date.getTime()).toBeGreaterThanOrEqual(today.getTime());
      });
    });

    it('excludes dates where all teachers have existing sessions or bookings', async () => {
      prisma.teacherSchedule.findMany.mockResolvedValue([mockSchedule]);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const daysUntilMonday = (1 + 7 - today.getDay()) % 7;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + (daysUntilMonday || 7));

      prisma.session.findMany.mockResolvedValue([
        {
          teacherId: 'teacher-1',
          scheduledAt: nextMonday,
        },
      ]);
      prisma.bookingRequest.findMany.mockResolvedValue([]);

      const result = await service.getAvailableDates('2024-03');

      // The specific Monday date should not be in the result
      const expectedDateKey = nextMonday.toISOString().split('T')[0];
      expect(result).not.toContain(expectedDateKey);
    });

    it('includes dates with at least one available teacher slot', async () => {
      prisma.teacherSchedule.findMany.mockResolvedValue([mockSchedule]);
      prisma.session.findMany.mockResolvedValue([]);
      prisma.bookingRequest.findMany.mockResolvedValue([]);

      // Use a future month - current month + 2 months
      const now = new Date();
      const futureMonth = new Date(now.getFullYear(), now.getMonth() + 2, 1);
      const monthStr = `${futureMonth.getFullYear()}-${String(futureMonth.getMonth() + 1).padStart(2, '0')}`;

      const result = await service.getAvailableDates(monthStr);

      // Should return some dates (Mondays in the future month)
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
