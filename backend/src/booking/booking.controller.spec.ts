import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService, AvailableSlot } from './booking.service';
import { Sex } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

const mockBookingService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  assign: jest.fn(),
  confirm: jest.fn(),
  cancel: jest.fn(),
  getAvailableSlots: jest.fn(),
  getAvailableDates: jest.fn(),
};

const mockJwtAuthGuard = {
  canActivate: () => true,
};

const mockRolesGuard = {
  canActivate: () => true,
};

describe('BookingController', () => {
  let controller: BookingController;
  let service: typeof mockBookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        { provide: BookingService, useValue: mockBookingService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<BookingController>(BookingController);
    service = module.get(BookingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /public/booking-requests', () => {
    it('creates a booking request and returns 201', async () => {
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

      const mockResult = {
        id: 'booking-1',
        ...dto,
        status: 'pending',
      };

      mockBookingService.create.mockResolvedValue(mockResult);

      const result = await controller.create(dto as any);

      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('GET /public/available-slots', () => {
    it('returns available slots for all teachers when no filters', async () => {
      const mockSlots: AvailableSlot[] = [
        {
          teacherId: 'teacher-1',
          teacherName: 'Ahmad Ibrahim',
          teacherSex: Sex.male,
          teacherProfilePicture: null,
          date: '2024-03-15',
          startTime: '10:00',
          endTime: '11:00',
          dayOfWeek: 'friday',
        },
      ];

      mockBookingService.getAvailableSlots.mockResolvedValue(mockSlots);

      const result = await controller.getAvailableSlots();

      expect(result).toEqual(mockSlots);
      expect(service.getAvailableSlots).toHaveBeenCalledWith(undefined, undefined);
    });

    it('passes date and teacherSex filters to service', async () => {
      const date = '2024-03-15';
      const teacherSex = Sex.female;

      mockBookingService.getAvailableSlots.mockResolvedValue([]);

      await controller.getAvailableSlots(date, teacherSex);

      expect(service.getAvailableSlots).toHaveBeenCalledWith(date, teacherSex);
    });
  });

  describe('GET /public/available-dates', () => {
    it('returns available dates for a month', async () => {
      const month = '2024-03';
      const mockDates = ['2024-03-04', '2024-03-11', '2024-03-18', '2024-03-25'];

      mockBookingService.getAvailableDates.mockResolvedValue(mockDates);

      const result = await controller.getAvailableDates(month);

      expect(result).toEqual(mockDates);
      expect(service.getAvailableDates).toHaveBeenCalledWith(month, undefined);
    });

    it('passes teacherSex filter to service', async () => {
      const month = '2024-03';
      const teacherSex = Sex.female;

      mockBookingService.getAvailableDates.mockResolvedValue([]);

      await controller.getAvailableDates(month, teacherSex);

      expect(service.getAvailableDates).toHaveBeenCalledWith(month, teacherSex);
    });
  });

  describe('PATCH /admin/booking-requests/:id/cancel', () => {
    it('cancels booking and returns success response', async () => {
      mockBookingService.cancel.mockResolvedValue(undefined);

      const result = await controller.cancel('booking-1');

      expect(result).toEqual({
        success: true,
        data: { message: 'Booking request cancelled successfully' },
      });
      expect(service.cancel).toHaveBeenCalledWith('booking-1');
    });
  });
});
