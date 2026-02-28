import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TeachersService } from './teachers.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Sex, UserRole } from '@prisma/client';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockPrismaService = {
  teacher: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  enrollment: {
    count: jest.fn(),
  },
  session: {
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'BCRYPT_ROUNDS') return '12';
    return undefined;
  }),
};

describe('TeachersService', () => {
  let service: TeachersService;
  let prisma: typeof mockPrismaService;

  const mockTeacher = {
    id: 'teacher-uuid-1',
    userId: 'user-uuid-1',
    sex: Sex.male,
    bio: 'Experienced teacher',
    qualifications: ['Ijazah'],
    specializations: ['Tajweed'],
    hourlyRate: new Prisma.Decimal(25),
    totalStudents: 5,
    rating: new Prisma.Decimal(4.5),
    isAvailable: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    user: {
      id: 'user-uuid-1',
      email: 'teacher@example.com',
      fullName: 'Ahmad Ibrahim',
      sex: Sex.male,
      phoneNumber: '+1234567890',
      whatsappNumber: '+1234567890',
      country: 'Egypt',
      profilePictureUrl: null,
      isActive: true,
      mustChangePassword: true,
      createdAt: new Date('2024-01-01'),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
    prisma = module.get(PrismaService);

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns paginated teachers with user relation', async () => {
      prisma.teacher.findMany.mockResolvedValue([mockTeacher]);
      prisma.teacher.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.totalPages).toBe(1);
    });

    it('filters by sex when sex param provided', async () => {
      prisma.teacher.findMany.mockResolvedValue([mockTeacher]);
      prisma.teacher.count.mockResolvedValue(1);

      await service.findAll({ page: 1, limit: 20, sex: Sex.male });

      expect(prisma.teacher.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            sex: Sex.male,
          }),
        }),
      );
    });

    it('filters by isAvailable when param provided', async () => {
      prisma.teacher.findMany.mockResolvedValue([mockTeacher]);
      prisma.teacher.count.mockResolvedValue(1);

      await service.findAll({ page: 1, limit: 20, isAvailable: true });

      expect(prisma.teacher.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isAvailable: true,
          }),
        }),
      );
    });

    it('search filters by fullName and email', async () => {
      prisma.teacher.findMany.mockResolvedValue([mockTeacher]);
      prisma.teacher.count.mockResolvedValue(1);

      await service.findAll({ page: 1, limit: 20, search: 'Ahmad' });

      expect(prisma.teacher.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user: expect.objectContaining({
              OR: [
                { fullName: { contains: 'Ahmad', mode: 'insensitive' } },
                { email: { contains: 'Ahmad', mode: 'insensitive' } },
              ],
            }),
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('returns teacher with user when found', async () => {
      prisma.teacher.findUnique.mockResolvedValue(mockTeacher);

      const result = await service.findById('teacher-uuid-1');

      expect(result).toEqual(mockTeacher);
      expect(prisma.teacher.findUnique).toHaveBeenCalledWith({
        where: { id: 'teacher-uuid-1' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              sex: true,
              phoneNumber: true,
              whatsappNumber: true,
              country: true,
              profilePictureUrl: true,
              isActive: true,
              mustChangePassword: true,
              createdAt: true,
            },
          },
        },
      });
    });

    it('throws NotFoundException when teacher not found', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findById('nonexistent-id')).rejects.toThrow('Teacher not found');
    });
  });

  describe('create', () => {
    const createDto = {
      email: 'newteacher@example.com',
      fullName: 'New Teacher',
      sex: Sex.male,
      temporaryPassword: 'TempPass123',
      bio: 'Experienced teacher',
      qualifications: ['Ijazah'],
      specializations: ['Tajweed'],
    };

    it('creates user and teacher in a single transaction', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          user: {
            create: jest.fn().mockResolvedValue({
              id: 'new-user-id',
              email: createDto.email,
              fullName: createDto.fullName,
              sex: createDto.sex,
            }),
          },
          teacher: {
            create: jest.fn().mockResolvedValue(mockTeacher),
          },
        });
      });

      const result = await service.create(createDto);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.temporaryPassword, 12);
      expect(result).toEqual(mockTeacher);
    });

    it('sets mustChangePassword to true on user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      let capturedUserData: any = {};

      prisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          user: {
            create: jest.fn().mockImplementation((data) => {
              capturedUserData = data;
              return Promise.resolve({ id: 'new-user-id' });
            }),
          },
          teacher: {
            create: jest.fn().mockResolvedValue(mockTeacher),
          },
        };
        await callback(tx);
        return mockTeacher;
      });

      await service.create(createDto);

      expect(capturedUserData.data.mustChangePassword).toBe(true);
      expect(capturedUserData.data.role).toBe(UserRole.teacher);
    });

    it('throws ConflictException when email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-id', email: createDto.email });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto)).rejects.toThrow('User with this email already exists');
    });

    it('hashes password before storing', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          user: {
            create: jest.fn().mockResolvedValue({ id: 'new-user-id' }),
          },
          teacher: {
            create: jest.fn().mockResolvedValue(mockTeacher),
          },
        });
      });

      await service.create(createDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('TempPass123', 12);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const updateDto = {
      fullName: 'Updated Name',
      bio: 'Updated bio',
    };

    it('updates teacher and user fields', async () => {
      prisma.teacher.findUnique.mockResolvedValue(mockTeacher);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          user: {
            update: jest.fn().mockResolvedValue({}),
          },
          teacher: {
            update: jest.fn().mockResolvedValue(mockTeacher),
          },
        });
      });

      const result = await service.update('teacher-uuid-1', updateDto);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockTeacher);
    });

    it('throws NotFoundException when teacher not found', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when email already in use', async () => {
      prisma.teacher.findUnique.mockResolvedValue(mockTeacher);
      prisma.user.findUnique.mockResolvedValue({ id: 'another-user-id' });

      await expect(
        service.update('teacher-uuid-1', { email: 'another@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deactivate', () => {
    it('sets isActive false when no active enrollments', async () => {
      prisma.teacher.findUnique.mockResolvedValue(mockTeacher);
      prisma.enrollment.count.mockResolvedValue(0);
      prisma.user.update.mockResolvedValue({});

      await service.deactivate('teacher-uuid-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockTeacher.userId },
        data: { isActive: false },
      });
    });

    it('throws BadRequestException when teacher has active enrollments', async () => {
      prisma.teacher.findUnique.mockResolvedValue(mockTeacher);
      prisma.enrollment.count.mockResolvedValue(3);

      await expect(service.deactivate('teacher-uuid-1')).rejects.toThrow(BadRequestException);
      await expect(service.deactivate('teacher-uuid-1')).rejects.toThrow(
        'Cannot deactivate teacher with active student enrollments',
      );
    });

    it('throws NotFoundException when teacher not found', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(service.deactivate('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTeacherStats', () => {
    it('returns teacher statistics', async () => {
      prisma.teacher.findUnique.mockResolvedValue(mockTeacher);
      prisma.enrollment.count.mockResolvedValue(10);
      prisma.session.count.mockResolvedValue(5);

      const result = await service.getTeacherStats('teacher-uuid-1');

      expect(result).toEqual({
        totalStudents: 10,
        activeSessions: 5,
        rating: 4.5,
        joinedDate: mockTeacher.createdAt,
      });
    });

    it('throws NotFoundException when teacher not found', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);

      await expect(service.getTeacherStats('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
