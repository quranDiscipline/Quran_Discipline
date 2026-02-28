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
    it('creates booking request with status pending', async () => {
      const dto = {
        fullName: 'John Doe',
        email: 'john@example.com',
        whatsappNumber: '+1234567890',
        sex: Sex.male,
        country: 'USA',
        currentLevel: 'beginner',
        preferredPackage: 'mastery',
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

    it('accepts request without preferredDate (optional field)', async () => {
      const dto = {
        fullName: 'John Doe',
        email: 'john@example.com',
        whatsappNumber: '+1234567890',
        sex: Sex.male,
        country: 'USA',
        currentLevel: 'beginner',
        preferredPackage: 'mastery',
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
});
