import { Test, TestingModule } from '@nestjs/testing';
import { TeacherProfileChangesService } from './teacher-profile-changes.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, UnprocessableEntityException, BadRequestException } from '@nestjs/common';
import { ChangeType, ProfileChangeStatus, Sex } from '@prisma/client';
import { Prisma } from '@prisma/client';

const mockPrismaService = {
  teacherProfileChange: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  teacher: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  user: {
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('TeacherProfileChangesService', () => {
  let service: TeacherProfileChangesService;
  let prisma: typeof mockPrismaService;

  const mockChange = {
    id: 'change-uuid-1',
    teacherId: 'teacher-1',
    requestedChanges: { bio: 'Updated bio' },
    changeType: ChangeType.bio,
    reason: 'I want to update my bio',
    status: ProfileChangeStatus.pending,
    requestedAt: new Date('2024-01-01'),
    reviewedAt: null,
    reviewedById: null,
    adminNotes: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    teacher: {
      user: {
        fullName: 'Ahmad Ibrahim',
        email: 'teacher@example.com',
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherProfileChangesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TeacherProfileChangesService>(TeacherProfileChangesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates change request with status pending', async () => {
      prisma.teacher.findUnique.mockResolvedValue({ id: 'teacher-1' });
      prisma.teacherProfileChange.findFirst.mockResolvedValue(null);
      prisma.teacherProfileChange.create.mockResolvedValue(mockChange);

      const dto = {
        requestedChanges: { bio: 'Updated bio' },
        reason: 'I want to update my bio with my new certification',
      };

      const result = await service.create('teacher-1', dto);

      expect(result.status).toBe(ProfileChangeStatus.pending);
      expect(prisma.teacherProfileChange.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: ProfileChangeStatus.pending,
          }),
        }),
      );
    });

    it('throws UnprocessableEntityException when pending request already exists', async () => {
      prisma.teacher.findUnique.mockResolvedValue({ id: 'teacher-1' });
      prisma.teacherProfileChange.findFirst.mockResolvedValue(mockChange);

      const dto = {
        requestedChanges: { bio: 'Another change' },
        reason: 'I want to change again',
      };

      await expect(service.create('teacher-1', dto)).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws NotFoundException when teacher not found', async () => {
      prisma.teacher.findUnique.mockResolvedValue(null);

      const dto = {
        requestedChanges: { bio: 'Updated bio' },
        reason: 'I want to update my bio',
      };

      await expect(service.create('nonexistent-teacher', dto)).rejects.toThrow(NotFoundException);
    });

    it('sets changeType to "multiple" when more than one field changed', async () => {
      prisma.teacher.findUnique.mockResolvedValue({ id: 'teacher-1' });
      prisma.teacherProfileChange.findFirst.mockResolvedValue(null);
      prisma.teacherProfileChange.create.mockResolvedValue({
        ...mockChange,
        changeType: ChangeType.multiple,
      });

      const dto = {
        requestedChanges: { bio: 'Updated bio', qualifications: ['New cert'] },
        reason: 'I want to update multiple fields',
      };

      const result = await service.create('teacher-1', dto);

      expect(result.changeType).toBe(ChangeType.multiple);
    });

    it('sets changeType to "bio" when only bio field changed', async () => {
      prisma.teacher.findUnique.mockResolvedValue({ id: 'teacher-1' });
      prisma.teacherProfileChange.findFirst.mockResolvedValue(null);
      prisma.teacherProfileChange.create.mockResolvedValue(mockChange);

      const dto = {
        requestedChanges: { bio: 'Updated bio' },
        reason: 'I want to update my bio',
      };

      const result = await service.create('teacher-1', dto);

      expect(result.changeType).toBe(ChangeType.bio);
    });
  });

  describe('approve', () => {
    it('applies requestedChanges to teacher profile in a transaction', async () => {
      prisma.teacherProfileChange.findUnique.mockResolvedValue(mockChange);

      prisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          teacher: {
            findUnique: jest.fn().mockResolvedValue({ userId: 'user-1' }),
            update: jest.fn().mockResolvedValue({}),
          },
          user: {
            update: jest.fn().mockResolvedValue({}),
          },
          teacherProfileChange: {
            update: jest.fn().mockResolvedValue({
              ...mockChange,
              status: ProfileChangeStatus.approved,
            }),
          },
        };
        return await callback(tx);
      });

      const result = await service.approve('change-1', 'admin-1', {});

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.status).toBe(ProfileChangeStatus.approved);
    });

    it('throws UnprocessableEntityException when request already reviewed', async () => {
      const reviewedChange = { ...mockChange, status: ProfileChangeStatus.approved };
      prisma.teacherProfileChange.findUnique.mockResolvedValue(reviewedChange);

      await expect(
        service.approve('change-1', 'admin-1', {}),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('throws NotFoundException when change request not found', async () => {
      prisma.teacherProfileChange.findUnique.mockResolvedValue(null);

      await expect(
        service.approve('nonexistent-change', 'admin-1', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reject', () => {
    it('sets status rejected with admin notes', async () => {
      prisma.teacherProfileChange.findUnique.mockResolvedValue(mockChange);
      prisma.teacherProfileChange.update.mockResolvedValue({
        ...mockChange,
        status: ProfileChangeStatus.rejected,
        adminNotes: 'Reason provided',
      });

      const result = await service.reject('change-1', 'admin-1', {
        notes: 'Reason provided',
      });

      expect(result.status).toBe(ProfileChangeStatus.rejected);
      expect(result.adminNotes).toBe('Reason provided');
    });

    it('throws BadRequestException when adminNotes is empty on rejection', async () => {
      prisma.teacherProfileChange.findUnique.mockResolvedValue(mockChange);

      await expect(
        service.reject('change-1', 'admin-1', { notes: '' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.reject('change-1', 'admin-1', { notes: '' }),
      ).rejects.toThrow('Admin notes are required when rejecting a request');
    });

    it('throws BadRequestException when adminNotes is not provided on rejection', async () => {
      prisma.teacherProfileChange.findUnique.mockResolvedValue(mockChange);

      await expect(
        service.reject('change-1', 'admin-1', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws UnprocessableEntityException when request already reviewed', async () => {
      const reviewedChange = { ...mockChange, status: ProfileChangeStatus.rejected };
      prisma.teacherProfileChange.findUnique.mockResolvedValue(reviewedChange);

      await expect(
        service.reject('change-1', 'admin-1', { notes: 'Already rejected' }),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });
});
