import { Test, TestingModule } from '@nestjs/testing';
import { TeacherSchedulesService } from './teacher-schedules.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DayOfWeek } from '@prisma/client';

// Mock PrismaService
const mockPrismaService = {
  teacherSchedule: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  blockedDate: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  teacher: {
    findUnique: jest.fn(),
  },
};

describe('TeacherSchedulesService', () => {
  let service: TeacherSchedulesService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherSchedulesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TeacherSchedulesService>(TeacherSchedulesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated schedules', async () => {
      const mockSchedules = [
        {
          id: 'schedule-1',
          teacherId: 'teacher-1',
          dayOfWeek: DayOfWeek.monday,
          startTime: '10:00',
          endTime: '11:00',
          isAvailable: true,
          maxStudents: null,
          teacher: {
            user: { fullName: 'Teacher One', email: 'teacher1@test.com', sex: 'male' },
          },
        },
      ];
      prisma.teacherSchedule.findMany.mockResolvedValue(mockSchedules);
      prisma.teacherSchedule.count.mockResolvedValue(1);

      const result = await service.findAll(1, 20);

      expect(result.data).toEqual(mockSchedules);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });

    it('should apply filters when provided', async () => {
      prisma.teacherSchedule.findMany.mockResolvedValue([]);
      prisma.teacherSchedule.count.mockResolvedValue(0);

      await service.findAll(1, 20, 'teacher-1', true);

      expect(prisma.teacherSchedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { teacherId: 'teacher-1', isAvailable: true },
        }),
      );
    });
  });

  describe('getTeacherSchedules', () => {
    it('should return schedules for a teacher', async () => {
      const mockSchedules = [
        {
          id: 'schedule-1',
          teacherId: 'teacher-1',
          dayOfWeek: DayOfWeek.monday,
          startTime: '10:00',
          endTime: '11:00',
          isAvailable: true,
          maxStudents: 3,
          teacher: { user: { fullName: 'Teacher One', email: 'teacher1@test.com', sex: 'male' } },
        },
      ];
      prisma.teacherSchedule.findMany.mockResolvedValue(mockSchedules);

      const result = await service.getTeacherSchedules('teacher-1');

      expect(result).toEqual(mockSchedules);
      expect(prisma.teacherSchedule.findMany).toHaveBeenCalledWith({
        where: { teacherId: 'teacher-1' },
        include: expect.any(Object),
        orderBy: expect.any(Array),
      });
    });
  });

  describe('findById', () => {
    it('should return a schedule when found', async () => {
      const mockSchedule = {
        id: 'schedule-1',
        teacherId: 'teacher-1',
        dayOfWeek: DayOfWeek.monday,
        startTime: '10:00',
        endTime: '11:00',
        isAvailable: true,
        maxStudents: null,
        teacher: { user: { fullName: 'Teacher One', email: 'teacher1@test.com', sex: 'male' } },
      };
      prisma.teacherSchedule.findUnique.mockResolvedValue(mockSchedule);

      const result = await service.findById('schedule-1');

      expect(result).toEqual(mockSchedule);
    });

    it('should throw NotFoundException when schedule not found', async () => {
      prisma.teacherSchedule.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new schedule', async () => {
      const dto = {
        teacherId: 'teacher-1',
        dayOfWeek: DayOfWeek.monday,
        startTime: '10:00',
        endTime: '11:00',
        isAvailable: true,
      };
      const mockTeacher = { id: 'teacher-1' };
      const mockSchedule = {
        id: 'schedule-1',
        ...dto,
        maxStudents: null,
        teacher: { user: { fullName: 'Teacher One', email: 'teacher1@test.com', sex: 'male' } },
      };

      prisma.teacher.findUnique.mockResolvedValue(mockTeacher);
      prisma.teacherSchedule.findFirst.mockResolvedValue(null);
      prisma.teacherSchedule.create.mockResolvedValue(mockSchedule);

      const result = await service.create(dto as any);

      expect(result).toEqual(mockSchedule);
      expect(prisma.teacherSchedule.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if teacher does not exist', async () => {
      const dto = {
        teacherId: 'nonexistent',
        dayOfWeek: DayOfWeek.monday,
        startTime: '10:00',
        endTime: '11:00',
      };

      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(service.create(dto as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if end time is before start time', async () => {
      const dto = {
        teacherId: 'teacher-1',
        dayOfWeek: DayOfWeek.monday,
        startTime: '11:00',
        endTime: '10:00',
      };
      const mockTeacher = { id: 'teacher-1' };

      prisma.teacher.findUnique.mockResolvedValue(mockTeacher);
      prisma.teacherSchedule.findFirst.mockResolvedValue(null);

      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if schedules overlap', async () => {
      const dto = {
        teacherId: 'teacher-1',
        dayOfWeek: DayOfWeek.monday,
        startTime: '10:00',
        endTime: '11:00',
      };
      const mockTeacher = { id: 'teacher-1' };
      const existingSchedule = {
        id: 'existing-1',
        teacherId: 'teacher-1',
        dayOfWeek: DayOfWeek.monday,
        startTime: '10:30',
        endTime: '11:30',
      };

      prisma.teacher.findUnique.mockResolvedValue(mockTeacher);
      prisma.teacherSchedule.findFirst.mockResolvedValue(existingSchedule);

      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple schedules for a teacher', async () => {
      const dto = {
        teacherId: 'teacher-1',
        schedules: [
          { dayOfWeek: DayOfWeek.monday, startTime: '10:00', endTime: '11:00', isAvailable: true },
          { dayOfWeek: DayOfWeek.tuesday, startTime: '10:00', endTime: '11:00', isAvailable: true },
        ],
      };
      const mockTeacher = { id: 'teacher-1' };
      const mockSchedules = dto.schedules.map((s, i) => ({
        id: `schedule-${i}`,
        teacherId: 'teacher-1',
        ...s,
        maxStudents: null,
        teacher: { user: { fullName: 'Teacher One', email: 'teacher1@test.com', sex: 'male' } },
      }));

      prisma.teacher.findUnique.mockResolvedValue(mockTeacher);
      prisma.teacherSchedule.deleteMany.mockResolvedValue({ count: 2 });
      prisma.teacherSchedule.create.mockImplementation((data) =>
        Promise.resolve({ id: `schedule-${Math.random()}`, ...data.data, teacher: mockTeacher, maxStudents: null }),
      );

      const result = await service.bulkCreate(dto as any);

      expect(result).toHaveLength(2);
      expect(prisma.teacherSchedule.deleteMany).toHaveBeenCalledWith({
        where: { teacherId: 'teacher-1' },
      });
    });

    it('should throw NotFoundException if teacher does not exist', async () => {
      const dto = {
        teacherId: 'nonexistent',
        schedules: [{ dayOfWeek: DayOfWeek.monday, startTime: '10:00', endTime: '11:00' }],
      };

      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(service.bulkCreate(dto as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a schedule', async () => {
      const existingSchedule = {
        id: 'schedule-1',
        teacherId: 'teacher-1',
        dayOfWeek: DayOfWeek.monday,
        startTime: '10:00',
        endTime: '11:00',
        isAvailable: true,
        maxStudents: null,
      };
      const updatedSchedule = {
        ...existingSchedule,
        isAvailable: false,
        teacher: { user: { fullName: 'Teacher One', email: 'teacher1@test.com', sex: 'male' } },
      };

      prisma.teacherSchedule.findUnique.mockResolvedValue(existingSchedule);
      prisma.teacherSchedule.update.mockResolvedValue(updatedSchedule);

      const result = await service.update('schedule-1', { isAvailable: false });

      expect(result.isAvailable).toBe(false);
      expect(prisma.teacherSchedule.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if schedule not found', async () => {
      prisma.teacherSchedule.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', {})).rejects.toThrow(NotFoundException);
    });

    it('should validate time range when updating times', async () => {
      const existingSchedule = {
        id: 'schedule-1',
        teacherId: 'teacher-1',
        dayOfWeek: DayOfWeek.monday,
        startTime: '10:00',
        endTime: '11:00',
        isAvailable: true,
      };

      prisma.teacherSchedule.findUnique.mockResolvedValue(existingSchedule);

      await expect(
        service.update('schedule-1', { startTime: '12:00', endTime: '11:00' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a schedule', async () => {
      const existingSchedule = { id: 'schedule-1' };
      prisma.teacherSchedule.findUnique.mockResolvedValue(existingSchedule);
      prisma.teacherSchedule.delete.mockResolvedValue(existingSchedule);

      await service.delete('schedule-1');

      expect(prisma.teacherSchedule.delete).toHaveBeenCalledWith({ where: { id: 'schedule-1' } });
    });

    it('should throw NotFoundException if schedule not found', async () => {
      prisma.teacherSchedule.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBlockedDates', () => {
    it('should return blocked dates with filters', async () => {
      const mockBlockedDates = [
        {
          id: 'block-1',
          teacherId: 'teacher-1',
          date: new Date('2026-12-25'),
          reason: 'Christmas',
          createdBy: 'admin-1',
          teacher: { user: { fullName: 'Teacher One' } },
        },
      ];
      prisma.blockedDate.findMany.mockResolvedValue(mockBlockedDates);

      const result = await service.getBlockedDates(
        new Date('2026-12-01'),
        new Date('2026-12-31'),
        'teacher-1',
      );

      expect(result).toEqual(mockBlockedDates);
      expect(prisma.blockedDate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: expect.any(Object),
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('blockDate', () => {
    it('should block a date', async () => {
      const dto = {
        teacherId: 'teacher-1',
        date: '2026-12-25',
        reason: 'Holiday',
      };
      const mockTeacher = { id: 'teacher-1' };
      const mockBlockedDate = {
        id: 'block-1',
        teacherId: 'teacher-1',
        date: new Date('2026-12-25'),
        reason: 'Holiday',
        createdBy: null,
        teacher: { user: { fullName: 'Teacher One' } },
      };

      prisma.teacher.findUnique.mockResolvedValue(mockTeacher);
      prisma.blockedDate.findFirst.mockResolvedValue(null);
      prisma.blockedDate.create.mockResolvedValue(mockBlockedDate);

      const result = await service.blockDate(dto as any);

      expect(result).toEqual(mockBlockedDate);
      expect(prisma.blockedDate.create).toHaveBeenCalled();
    });

    it('should create global block when teacherId is not provided', async () => {
      const dto = {
        date: '2026-12-25',
        reason: 'Global Holiday',
      };
      const mockBlockedDate = {
        id: 'block-1',
        teacherId: null,
        date: new Date('2026-12-25'),
        reason: 'Global Holiday',
        createdBy: null,
        teacher: null,
      };

      prisma.blockedDate.findFirst.mockResolvedValue(null);
      prisma.blockedDate.create.mockResolvedValue(mockBlockedDate);

      const result = await service.blockDate(dto as any);

      expect(result.teacherId).toBeNull();
      expect(prisma.teacher.findUnique).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if date is already blocked', async () => {
      const dto = {
        teacherId: 'teacher-1',
        date: '2026-12-25',
      };
      const mockTeacher = { id: 'teacher-1' };
      const existingBlock = { id: 'existing-block' };

      prisma.teacher.findUnique.mockResolvedValue(mockTeacher);
      prisma.blockedDate.findFirst.mockResolvedValue(existingBlock);

      await expect(service.blockDate(dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('unblockDate', () => {
    it('should unblock a date', async () => {
      const existingBlock = { id: 'block-1' };
      prisma.blockedDate.findUnique.mockResolvedValue(existingBlock);
      prisma.blockedDate.delete.mockResolvedValue(existingBlock);

      await service.unblockDate('block-1');

      expect(prisma.blockedDate.delete).toHaveBeenCalledWith({ where: { id: 'block-1' } });
    });

    it('should throw NotFoundException if block not found', async () => {
      prisma.blockedDate.findUnique.mockResolvedValue(null);

      await expect(service.unblockDate('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('copySchedules', () => {
    it('should copy schedules from one teacher to another', async () => {
      const sourceSchedules = [
        {
          id: 'schedule-1',
          teacherId: 'teacher-1',
          dayOfWeek: DayOfWeek.monday,
          startTime: '10:00',
          endTime: '11:00',
          isAvailable: true,
          maxStudents: null,
        },
      ];
      const mockSourceTeacher = { id: 'teacher-1' };
      const mockTargetTeacher = { id: 'teacher-2' };
      const newSchedules = [
        {
          ...sourceSchedules[0],
          id: 'new-schedule-1',
          teacherId: 'teacher-2',
          teacher: { user: { fullName: 'Teacher Two', email: 'teacher2@test.com', sex: 'male' } },
        },
      ];

      prisma.teacher.findUnique.mockResolvedValue(mockSourceTeacher);
      prisma.teacherSchedule.findMany.mockResolvedValue(sourceSchedules);
      prisma.teacherSchedule.deleteMany.mockResolvedValue({ count: 0 });
      prisma.teacherSchedule.create.mockResolvedValue(newSchedules[0]);

      const result = await service.copySchedules('teacher-1', 'teacher-2');

      expect(result).toHaveLength(1);
      expect(prisma.teacherSchedule.deleteMany).toHaveBeenCalledWith({
        where: { teacherId: 'teacher-2' },
      });
    });

    it('should throw NotFoundException if source teacher not found', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(service.copySchedules('nonexistent', 'teacher-2')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if target teacher not found', async () => {
      const mockSourceTeacher = { id: 'teacher-1' };

      prisma.teacher.findUnique.mockImplementation((args) => {
        if (args.where.id === 'teacher-1') return Promise.resolve(mockSourceTeacher);
        return Promise.resolve(null);
      });

      await expect(service.copySchedules('teacher-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
