import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StudentsService } from './students.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Sex, UserRole, StudentLevel } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockPrismaService = {
  student: {
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
  session: {
    count: jest.fn(),
  },
  enrollment: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'BCRYPT_ROUNDS') return '12';
    return undefined;
  }),
};

describe('StudentsService', () => {
  let service: StudentsService;
  let prisma: typeof mockPrismaService;

  const mockStudent = {
    id: 'student-uuid-1',
    userId: 'user-uuid-1',
    sex: Sex.male,
    currentLevel: StudentLevel.beginner,
    subscriptionStatus: 'active' as const,
    paymentMethod: 'paypal' as const,
    enrolledDate: new Date('2024-01-01'),
    totalSessionsCompleted: 5,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    user: {
      id: 'user-uuid-1',
      email: 'student@example.com',
      fullName: 'Ali Hassan',
      sex: Sex.male,
      phoneNumber: '+1234567890',
      whatsappNumber: '+1234567890',
      country: 'USA',
      profilePictureUrl: null,
      isActive: true,
      mustChangePassword: true,
      createdAt: new Date('2024-01-01'),
    },
    _count: {
      enrollments: 2,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    prisma = module.get(PrismaService);

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      email: 'newstudent@example.com',
      fullName: 'New Student',
      sex: Sex.male,
      temporaryPassword: 'TempPass123',
      currentLevel: StudentLevel.beginner,
    };

    it('creates user and student records in a transaction', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          user: {
            create: jest.fn().mockResolvedValue({
              id: 'new-user-id',
              email: createDto.email,
              fullName: createDto.fullName,
            }),
          },
          student: {
            create: jest.fn().mockResolvedValue(mockStudent),
          },
        });
      });

      const result = await service.create(createDto);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockStudent);
    });

    it('sets mustChangePassword to true', async () => {
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
          student: {
            create: jest.fn().mockResolvedValue(mockStudent),
          },
        };
        await callback(tx);
        return mockStudent;
      });

      await service.create(createDto);

      expect(capturedUserData.data.mustChangePassword).toBe(true);
      expect(capturedUserData.data.role).toBe(UserRole.student);
    });

    it('throws ConflictException on duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-id', email: createDto.email });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('returns student with user and enrollments', async () => {
      const studentWithEnrollments = {
        ...mockStudent,
        enrollments: [],
        payments: [],
      };
      prisma.student.findUnique.mockResolvedValue(studentWithEnrollments);

      const result = await service.findById('student-uuid-1');

      expect(result).toEqual(studentWithEnrollments);
    });

    it('throws NotFoundException when not found', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivate', () => {
    it('sets user.isActive false', async () => {
      prisma.student.findUnique.mockResolvedValue(mockStudent);
      prisma.user.update.mockResolvedValue({});

      await service.deactivate('student-uuid-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockStudent.userId },
        data: { isActive: false },
      });
    });

    it('throws NotFoundException when student not found', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      await expect(service.deactivate('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
