import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CourseType } from '@prisma/client';
import { Prisma } from '@prisma/client';

const mockPrismaService = {
  course: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  enrollment: {
    count: jest.fn(),
  },
};

describe('CoursesService', () => {
  let service: CoursesService;
  let prisma: typeof mockPrismaService;

  const mockCourse = {
    id: 'course-uuid-1',
    title: 'Quran Memorization',
    description: 'Learn to memorize Quran',
    courseType: CourseType.memorization,
    durationMonths: 6,
    priceMonthly: new Prisma.Decimal(50),
    maxStudentsPerGroup: 5,
    isActive: true,
    createdById: 'admin-id',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    _count: { enrollments: 10 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns only active courses by default', async () => {
      prisma.course.findMany.mockResolvedValue([mockCourse]);

      const result = await service.findAll();

      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        }),
      );
      expect(result).toEqual([mockCourse]);
    });

    it('returns all courses when includeInactive is true', async () => {
      prisma.course.findMany.mockResolvedValue([mockCourse]);

      await service.findAll(true);

      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.not.objectContaining({
          where: { isActive: true },
        }),
      );
    });
  });

  describe('findById', () => {
    it('returns course when found', async () => {
      prisma.course.findUnique.mockResolvedValue(mockCourse);

      const result = await service.findById('course-uuid-1');

      expect(result).toEqual(mockCourse);
    });

    it('throws NotFoundException when not found', async () => {
      prisma.course.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates course with admin ID', async () => {
      const dto = {
        title: 'New Course',
        description: 'Description',
        courseType: CourseType.islamic_studies,
        durationMonths: 3,
        priceMonthly: 40,
      };
      prisma.course.create.mockResolvedValue(mockCourse);

      const result = await service.create(dto, 'admin-id');

      expect(prisma.course.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            createdById: 'admin-id',
            title: dto.title,
          }),
        }),
      );
      expect(result).toEqual(mockCourse);
    });
  });

  describe('deactivate', () => {
    it('sets isActive false when no active enrollments', async () => {
      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.enrollment.count.mockResolvedValue(0);
      prisma.course.update.mockResolvedValue({ ...mockCourse, isActive: false });

      await service.deactivate('course-uuid-1');

      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: 'course-uuid-1' },
        data: { isActive: false },
      });
    });

    it('throws BadRequestException when active enrollments exist', async () => {
      prisma.course.findUnique.mockResolvedValue(mockCourse);
      prisma.enrollment.count.mockResolvedValue(5);

      await expect(service.deactivate('course-uuid-1')).rejects.toThrow(BadRequestException);
      await expect(service.deactivate('course-uuid-1')).rejects.toThrow(
        'Cannot deactivate a course with active enrollments',
      );
    });
  });
});
