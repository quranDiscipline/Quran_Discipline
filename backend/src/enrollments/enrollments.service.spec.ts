import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsService } from './enrollments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException, UnprocessableEntityException } from '@nestjs/common';
import { Sex, PackageType, EnrollmentStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

const mockPrismaService = {
  enrollment: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  student: {
    findUnique: jest.fn(),
  },
  course: {
    findUnique: jest.fn(),
  },
  teacher: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let prisma: typeof mockPrismaService;

  const mockEnrollment = {
    id: 'enrollment-uuid-1',
    studentId: 'student-1',
    courseId: 'course-1',
    teacherId: 'teacher-1',
    packageType: PackageType.mastery,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-07-01'),
    status: EnrollmentStatus.active,
    progressPercentage: new Prisma.Decimal(50),
    student: {
      user: { fullName: 'Ali Hassan' },
    },
    course: { title: 'Quran Memorization' },
    teacher: {
      user: { fullName: 'Ahmad Ibrahim' },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      studentId: 'student-1',
      courseId: 'course-1',
      teacherId: 'teacher-1',
      packageType: PackageType.mastery,
      startDate: '2024-01-01',
    };

    it('creates enrollment and increments teacher totalStudents', async () => {
      prisma.student.findUnique.mockResolvedValue({
        id: 'student-1',
        user: { isActive: true },
      });
      prisma.course.findUnique.mockResolvedValue({
        id: 'course-1',
        isActive: true,
        durationMonths: 6,
      });
      prisma.teacher.findUnique.mockResolvedValue({
        id: 'teacher-1',
        isAvailable: true,
      });
      prisma.enrollment.findFirst.mockResolvedValue(null);
      prisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          enrollment: {
            create: jest.fn().mockResolvedValue(mockEnrollment),
          },
          teacher: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(tx);
      });

      const result = await service.create(createDto);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockEnrollment);
    });

    it('throws ConflictException when student already enrolled in course', async () => {
      prisma.student.findUnique.mockResolvedValue({
        id: 'student-1',
        user: { isActive: true },
      });
      prisma.course.findUnique.mockResolvedValue({
        id: 'course-1',
        isActive: true,
        durationMonths: 6,
      });
      prisma.teacher.findUnique.mockResolvedValue({
        id: 'teacher-1',
        isAvailable: true,
      });
      prisma.enrollment.findFirst.mockResolvedValue(mockEnrollment);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when student does not exist', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when course does not exist or inactive', async () => {
      prisma.student.findUnique.mockResolvedValue({
        id: 'student-1',
        user: { isActive: true },
      });
      prisma.course.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when teacher does not exist', async () => {
      prisma.student.findUnique.mockResolvedValue({
        id: 'student-1',
        user: { isActive: true },
      });
      prisma.course.findUnique.mockResolvedValue({
        id: 'course-1',
        isActive: true,
        durationMonths: 6,
      });
      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('calculates endDate correctly (startDate + durationMonths)', async () => {
      prisma.student.findUnique.mockResolvedValue({
        id: 'student-1',
        user: { isActive: true },
      });
      prisma.course.findUnique.mockResolvedValue({
        id: 'course-1',
        isActive: true,
        durationMonths: 6,
      });
      prisma.teacher.findUnique.mockResolvedValue({
        id: 'teacher-1',
        isAvailable: true,
      });
      prisma.enrollment.findFirst.mockResolvedValue(null);

      let capturedData: any = {};
      prisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          enrollment: {
            create: jest.fn().mockImplementation((data) => {
              capturedData = data;
              return Promise.resolve(mockEnrollment);
            }),
          },
          teacher: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(tx);
      });

      await service.create(createDto);

      // endDate should be approximately 6 months after startDate (accounting for timezone)
      const expectedDate = new Date('2024-07-01');
      const actualDate = capturedData.data.endDate;
      expect(actualDate.getMonth()).toBe(expectedDate.getMonth());
      expect(actualDate.getFullYear()).toBe(expectedDate.getFullYear());
    });
  });

  describe('updateStatus', () => {
    it('allows valid transition active to paused', async () => {
      prisma.enrollment.findUnique.mockResolvedValue({
        ...mockEnrollment,
        status: EnrollmentStatus.active,
      });
      prisma.enrollment.update.mockResolvedValue(mockEnrollment);

      const result = await service.updateStatus('enrollment-1', EnrollmentStatus.paused);

      expect(prisma.enrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: EnrollmentStatus.paused },
        }),
      );
    });

    it('allows valid transition active to completed', async () => {
      prisma.enrollment.findUnique.mockResolvedValue({
        ...mockEnrollment,
        status: EnrollmentStatus.active,
      });
      prisma.enrollment.update.mockResolvedValue(mockEnrollment);

      await service.updateStatus('enrollment-1', EnrollmentStatus.completed);

      expect(prisma.enrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: EnrollmentStatus.completed },
        }),
      );
    });

    it('throws UnprocessableEntityException for invalid transition completed to active', async () => {
      prisma.enrollment.findUnique.mockResolvedValue({
        ...mockEnrollment,
        status: EnrollmentStatus.completed,
      });

      await expect(
        service.updateStatus('enrollment-1', EnrollmentStatus.active),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });
});
