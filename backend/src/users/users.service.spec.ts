import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { User, UserRole, Sex } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;
  let config: ConfigService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'BCRYPT_ROUNDS') return 12;
      return null;
    }),
  };

  const mockUser: User = {
    id: 'uuid-1',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    fullName: 'Test User',
    sex: Sex.male,
    role: UserRole.student,
    isActive: true,
    emailVerified: false,
    mustChangePassword: false,
    resetPasswordToken: null,
    resetPasswordExpiresAt: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    phoneNumber: null,
    whatsappNumber: null,
    country: null,
    profilePictureUrl: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    config = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('returns user without sensitive fields when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('uuid-1');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('resetPasswordToken');
      expect(result).not.toHaveProperty('resetPasswordExpiresAt');
      expect(result.id).toBe('uuid-1');
    });

    it('throws NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('returns user when found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });

    it('returns null when not found (no exception)', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates user with hashed password and mustChangePassword=true', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const createUserDto = {
        email: 'test@example.com',
        password: 'Password1',
        fullName: 'Test User',
        sex: Sex.male,
        role: UserRole.student,
      };

      await service.create(createUserDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
          mustChangePassword: true,
          passwordHash: expect.any(String),
        }),
      });
    });

    it('throws ConflictException on duplicate email', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const createUserDto = {
        email: 'test@example.com',
        password: 'Password1',
        fullName: 'Test User',
        sex: Sex.male,
        role: UserRole.student,
      };

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('deactivate', () => {
    it('sets isActive to false', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        isActive: true,
      });
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, isActive: false });

      await service.deactivate('uuid-1');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { isActive: false },
      });
    });

    it('throws BadRequestException when user is already inactive', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        isActive: false,
      });

      await expect(service.deactivate('uuid-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
