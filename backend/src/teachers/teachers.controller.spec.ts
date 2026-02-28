import { Test, TestingModule } from '@nestjs/testing';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { Sex } from '@prisma/client';

const mockTeachersService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deactivate: jest.fn(),
  getTeacherStats: jest.fn(),
};

const mockTeacher = {
  id: 'teacher-uuid-1',
  user: {
    id: 'user-uuid-1',
    email: 'teacher@example.com',
    fullName: 'Ahmad Ibrahim',
    sex: Sex.male,
    isActive: true,
  },
  sex: Sex.male,
  bio: 'Experienced teacher',
  isAvailable: true,
  totalStudents: 5,
  rating: 4.5,
};

describe('TeachersController', () => {
  let controller: TeachersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachersController],
      providers: [
        { provide: TeachersService, useValue: mockTeachersService },
      ],
    }).compile();

    controller = module.get<TeachersController>(TeachersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('returns paginated teachers', async () => {
      const mockResponse = {
        data: [mockTeacher],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      mockTeachersService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({ page: 1, limit: 20 });

      expect(result).toEqual(mockResponse);
      expect(mockTeachersService.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });

  describe('findById', () => {
    it('returns teacher by id', async () => {
      mockTeachersService.findById.mockResolvedValue(mockTeacher);

      const result = await controller.findById('teacher-uuid-1');

      expect(result).toEqual(mockTeacher);
      expect(mockTeachersService.findById).toHaveBeenCalledWith('teacher-uuid-1');
    });
  });

  describe('getTeacherStats', () => {
    it('returns teacher statistics', async () => {
      const mockStats = {
        totalStudents: 10,
        activeSessions: 3,
        rating: 4.5,
        joinedDate: new Date('2024-01-01'),
      };
      mockTeachersService.getTeacherStats.mockResolvedValue(mockStats);

      const result = await controller.getTeacherStats('teacher-uuid-1');

      expect(result).toEqual(mockStats);
      expect(mockTeachersService.getTeacherStats).toHaveBeenCalledWith('teacher-uuid-1');
    });
  });

  describe('create', () => {
    it('creates a new teacher', async () => {
      const createDto = {
        email: 'newteacher@example.com',
        fullName: 'New Teacher',
        sex: Sex.male,
        temporaryPassword: 'TempPass123',
      };
      mockTeachersService.create.mockResolvedValue(mockTeacher);

      const result = await controller.create(createDto as any);

      expect(result).toEqual(mockTeacher);
      expect(mockTeachersService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('updates teacher', async () => {
      const updateDto = { fullName: 'Updated Name' };
      mockTeachersService.update.mockResolvedValue(mockTeacher);

      const result = await controller.update('teacher-uuid-1', updateDto);

      expect(result).toEqual(mockTeacher);
      expect(mockTeachersService.update).toHaveBeenCalledWith('teacher-uuid-1', updateDto);
    });
  });

  describe('deactivate', () => {
    it('deactivates teacher', async () => {
      mockTeachersService.deactivate.mockResolvedValue(undefined);

      const result = await controller.deactivate('teacher-uuid-1');

      expect(result).toEqual({
        success: true,
        data: { message: 'Teacher deactivated successfully' },
      });
      expect(mockTeachersService.deactivate).toHaveBeenCalledWith('teacher-uuid-1');
    });
  });
});
