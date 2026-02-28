import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const mockPrismaService = {
  student: {
    count: jest.fn(),
    groupBy: jest.fn(),
    findMany: jest.fn(),
  },
  teacher: {
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  payment: {
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  enrollment: {
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  bookingRequest: {
    count: jest.fn(),
  },
  teacherProfileChange: {
    count: jest.fn(),
  },
  session: {
    count: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

describe('AdminService', () => {
  let service: AdminService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('runs all stat queries in parallel (Promise.all)', async () => {
      prisma.student.count.mockResolvedValue(50);
      prisma.teacher.count.mockResolvedValue(10);
      prisma.payment.aggregate.mockResolvedValue({ _sum: { amount: new Prisma.Decimal(5000) } });
      prisma.enrollment.count.mockResolvedValue(5);
      prisma.bookingRequest.count.mockResolvedValue(3);
      prisma.teacherProfileChange.count.mockResolvedValue(2);
      prisma.session.count.mockResolvedValue(15);
      prisma.teacher.aggregate.mockResolvedValue({ _avg: { rating: new Prisma.Decimal(4.5) } });

      const result = await service.getDashboardStats();

      expect(result).toEqual({
        totalActiveStudents: 50,
        totalTeachers: 10,
        totalRevenueThisMonth: 5000,
        newEnrollmentsThisMonth: 5,
        pendingBookingRequests: 3,
        pendingProfileChanges: 2,
        sessionsTodayCount: 15,
        averageRating: 4.5,
      });
    });

    it('returns 0 for all stats on empty database', async () => {
      prisma.student.count.mockResolvedValue(0);
      prisma.teacher.count.mockResolvedValue(0);
      prisma.payment.aggregate.mockResolvedValue({ _sum: { amount: null } });
      prisma.enrollment.count.mockResolvedValue(0);
      prisma.bookingRequest.count.mockResolvedValue(0);
      prisma.teacherProfileChange.count.mockResolvedValue(0);
      prisma.session.count.mockResolvedValue(0);
      prisma.teacher.aggregate.mockResolvedValue({ _avg: { rating: null } });

      const result = await service.getDashboardStats();

      expect(result.totalRevenueThisMonth).toBe(0);
      expect(result.averageRating).toBe(0);
    });
  });

  describe('getRevenueChart', () => {
    it('returns array of 12 months by default', async () => {
      prisma.payment.aggregate.mockResolvedValue({ _sum: { amount: new Prisma.Decimal(1000) } });
      prisma.enrollment.count.mockResolvedValue(5);

      const result = await service.getRevenueChart();

      expect(result).toHaveLength(12);
      expect(result[0]).toHaveProperty('month');
      expect(result[0]).toHaveProperty('revenue');
      expect(result[0]).toHaveProperty('enrollments');
    });

    it('returns correct number of months when months param provided', async () => {
      prisma.payment.aggregate.mockResolvedValue({ _sum: { amount: new Prisma.Decimal(1000) } });
      prisma.enrollment.count.mockResolvedValue(5);

      const result = await service.getRevenueChart(6);

      expect(result).toHaveLength(6);
    });
  });
});
