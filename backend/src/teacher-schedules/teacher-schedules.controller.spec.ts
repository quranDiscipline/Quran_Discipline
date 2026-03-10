import { Test, TestingModule } from '@nestjs/testing';
import { TeacherSchedulesController, BlockedDatesController } from './teacher-schedules.controller';
import { TeacherSchedulesService } from './teacher-schedules.service';
import { DayOfWeek } from '@prisma/client';

// Mock TeacherSchedulesService
const mockTeacherSchedulesService = {
  findAll: jest.fn(),
  getTeacherSchedules: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  bulkCreate: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  copySchedules: jest.fn(),
  getBlockedDates: jest.fn(),
  blockDate: jest.fn(),
  unblockDate: jest.fn(),
};

describe('TeacherSchedulesController', () => {
  let controller: TeacherSchedulesController;
  let service: typeof mockTeacherSchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeacherSchedulesController],
      providers: [
        { provide: TeacherSchedulesService, useValue: mockTeacherSchedulesService },
      ],
    }).compile();

    controller = module.get<TeacherSchedulesController>(TeacherSchedulesController);
    service = module.get(TeacherSchedulesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /admin/teacher-schedules', () => {
    it('should return paginated schedules', async () => {
      const mockResult = {
        data: [
          {
            id: 'schedule-1',
            teacherId: 'teacher-1',
            dayOfWeek: DayOfWeek.monday,
            startTime: '10:00',
            endTime: '11:00',
            isAvailable: true,
            maxStudents: null,
          },
        ],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      service.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(1, 20, 'teacher-1', 'true');

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith(1, 20, 'teacher-1', true);
    });
  });

  describe('GET /admin/teacher-schedules/:teacherId', () => {
    it('should return schedules for a teacher', async () => {
      const mockSchedules = [
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
      service.getTeacherSchedules.mockResolvedValue(mockSchedules);

      const result = await controller.getTeacherSchedules('teacher-1');

      expect(result).toEqual(mockSchedules);
      expect(service.getTeacherSchedules).toHaveBeenCalledWith('teacher-1');
    });
  });

  describe('GET /admin/teacher-schedules/by-id/:id', () => {
    it('should return a schedule by ID', async () => {
      const mockSchedule = {
        id: 'schedule-1',
        teacherId: 'teacher-1',
        dayOfWeek: DayOfWeek.monday,
        startTime: '10:00',
        endTime: '11:00',
        isAvailable: true,
        maxStudents: null,
      };
      service.findById.mockResolvedValue(mockSchedule);

      const result = await controller.findById('schedule-1');

      expect(result).toEqual(mockSchedule);
      expect(service.findById).toHaveBeenCalledWith('schedule-1');
    });
  });

  describe('POST /admin/teacher-schedules', () => {
    it('should create a new schedule', async () => {
      const dto = {
        teacherId: 'teacher-1',
        dayOfWeek: DayOfWeek.monday,
        startTime: '10:00',
        endTime: '11:00',
        isAvailable: true,
      };
      const mockSchedule = {
        id: 'schedule-1',
        ...dto,
        maxStudents: null,
      };

      service.create.mockResolvedValue(mockSchedule as any);

      const result = await controller.create(dto as any);

      expect(result).toEqual(mockSchedule);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('POST /admin/teacher-schedules/bulk', () => {
    it('should bulk create schedules', async () => {
      const dto = {
        teacherId: 'teacher-1',
        schedules: [
          {
            dayOfWeek: DayOfWeek.monday,
            startTime: '10:00',
            endTime: '11:00',
            isAvailable: true,
          },
        ],
      };
      const mockSchedules = [
        {
          id: 'schedule-1',
          teacherId: 'teacher-1',
          ...dto.schedules[0],
          maxStudents: null,
        },
      ];

      service.bulkCreate.mockResolvedValue(mockSchedules as any);

      const result = await controller.bulkCreate(dto as any);

      expect(result).toEqual(mockSchedules);
      expect(service.bulkCreate).toHaveBeenCalledWith(dto);
    });
  });

  describe('PATCH /admin/teacher-schedules/:id', () => {
    it('should update a schedule', async () => {
      const dto = { isAvailable: false };
      const mockSchedule = {
        id: 'schedule-1',
        teacherId: 'teacher-1',
        dayOfWeek: DayOfWeek.monday,
        startTime: '10:00',
        endTime: '11:00',
        isAvailable: false,
        maxStudents: null,
      };

      service.update.mockResolvedValue(mockSchedule as any);

      const result = await controller.update('schedule-1', dto);

      expect(result.isAvailable).toBe(false);
      expect(service.update).toHaveBeenCalledWith('schedule-1', dto);
    });
  });

  describe('DELETE /admin/teacher-schedules/:id', () => {
    it('should delete a schedule', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete('schedule-1');

      expect(service.delete).toHaveBeenCalledWith('schedule-1');
    });
  });

  describe('POST /admin/teacher-schedules/copy/:fromTeacherId/:toTeacherId', () => {
    it('should copy schedules between teachers', async () => {
      const mockSchedules = [
        {
          id: 'new-schedule-1',
          teacherId: 'teacher-2',
          dayOfWeek: DayOfWeek.monday,
          startTime: '10:00',
          endTime: '11:00',
          isAvailable: true,
          maxStudents: null,
        },
      ];

      service.copySchedules.mockResolvedValue(mockSchedules as any);

      const result = await controller.copySchedules('teacher-1', 'teacher-2');

      expect(result).toEqual(mockSchedules);
      expect(service.copySchedules).toHaveBeenCalledWith('teacher-1', 'teacher-2');
    });
  });
});

describe('BlockedDatesController', () => {
  let controller: BlockedDatesController;
  let service: typeof mockTeacherSchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockedDatesController],
      providers: [
        { provide: TeacherSchedulesService, useValue: mockTeacherSchedulesService },
      ],
    }).compile();

    controller = module.get<BlockedDatesController>(BlockedDatesController);
    service = module.get(TeacherSchedulesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /admin/blocked-dates', () => {
    it('should return blocked dates with filters', async () => {
      const mockBlockedDates = [
        {
          id: 'block-1',
          teacherId: 'teacher-1',
          date: new Date('2026-12-25'),
          reason: 'Holiday',
          createdBy: 'admin-1',
          teacher: { user: { fullName: 'Teacher One' } },
        },
      ];
      service.getBlockedDates.mockResolvedValue(mockBlockedDates);

      const result = await controller.getBlockedDates('2026-12-01', '2026-12-31', 'teacher-1');

      expect(result).toEqual(mockBlockedDates);
      expect(service.getBlockedDates).toHaveBeenCalledWith(
        new Date('2026-12-01'),
        new Date('2026-12-31'),
        'teacher-1',
      );
    });
  });

  describe('POST /admin/blocked-dates', () => {
    it('should block a date', async () => {
      const dto = {
        teacherId: 'teacher-1',
        date: '2026-12-25',
        reason: 'Holiday',
      };
      const mockBlockedDate = {
        id: 'block-1',
        teacherId: 'teacher-1',
        date: new Date('2026-12-25'),
        reason: 'Holiday',
        createdBy: null,
        teacher: { user: { fullName: 'Teacher One' } },
      };

      service.blockDate.mockResolvedValue(mockBlockedDate as any);

      const result = await controller.blockDate(dto as any);

      expect(result).toEqual(mockBlockedDate);
      expect(service.blockDate).toHaveBeenCalledWith(dto);
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

      service.blockDate.mockResolvedValue(mockBlockedDate as any);

      const result = await controller.blockDate(dto as any);

      expect(result.teacherId).toBeNull();
      expect(service.blockDate).toHaveBeenCalledWith(dto);
    });
  });

  describe('DELETE /admin/blocked-dates/:id', () => {
    it('should unblock a date', async () => {
      service.unblockDate.mockResolvedValue(undefined);

      await controller.unblockDate('block-1');

      expect(service.unblockDate).toHaveBeenCalledWith('block-1');
    });
  });
});
