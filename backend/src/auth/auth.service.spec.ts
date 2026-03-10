import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole, Sex } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

const uuidv4Mock = uuidv4 as jest.MockedFunction<typeof uuidv4>;

jest.mock('uuid');
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let config: ConfigService;

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

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    updatePassword: jest.fn(),
    setResetToken: jest.fn(),
    findByResetToken: jest.fn(),
    clearResetToken: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, unknown> = {
        BCRYPT_ROUNDS: 12,
        JWT_ACCESS_EXPIRATION: '15m',
        JWT_REFRESH_EXPIRATION: '7d',
        JWT_REFRESH_SECRET: 'refresh_secret',
        NODE_ENV: 'development',
      };
      return config[key] || null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    config = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('returns sanitized user when credentials are valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const prisma = service['prisma'] as any;
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toHaveProperty('id', 'uuid-1');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it('returns null when user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('returns null when password does not match', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser('test@example.com', 'wrong');

      expect(result).toBeNull();
    });

    it('returns null when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUsersService.findByEmail.mockResolvedValue(inactiveUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('returns accessToken and sets httpOnly cookie', async () => {
      const mockAuthUser = {
        id: 'uuid-1',
        email: 'test@example.com',
        fullName: 'Test User',
        role: UserRole.student,
        sex: Sex.male,
        profilePictureUrl: null,
        mustChangePassword: false,
      };

      const res: any = {
        cookie: jest.fn(),
      };

      mockJwtService.sign.mockReturnValueOnce('access.token').mockReturnValueOnce('refresh.token');

      const result = await service.login(mockAuthUser, res);

      expect(result).toHaveProperty('accessToken', 'access.token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refresh.token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    });
  });

  describe('logout', () => {
    it('clears the refresh_token cookie', () => {
      const res: any = {
        clearCookie: jest.fn(),
      };

      service.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      });
    });
  });

  describe('refreshToken', () => {
    it('returns new accessToken when refresh cookie is valid', async () => {
      const req: any = {
        cookies: { refresh_token: 'valid.refresh.token' },
      };

      mockJwtService.verify.mockReturnValue({ sub: 'uuid-1' });
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new.access.token');

      const result = await service.refreshToken(req);

      expect(result).toEqual({
        accessToken: 'new.access.token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.fullName,
          role: mockUser.role,
          sex: mockUser.sex,
          profilePictureUrl: mockUser.profilePictureUrl,
          mustChangePassword: mockUser.mustChangePassword,
        },
      });
    });

    it('throws UnauthorizedException when no cookie present', async () => {
      const req: any = { cookies: {} };

      await expect(service.refreshToken(req)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('always returns success message regardless of email existence', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const mockUuid = 'reset-token-uuid';
      uuidv4Mock.mockReturnValue(mockUuid as unknown as never);

      const result = await service.forgotPassword({ email: 'nonexistent@example.com' });

      expect(result).toEqual({
        message: 'If this email exists, a reset link has been sent.',
      });
    });

    it('stores reset token when user is found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      const mockUuid = 'reset-token-uuid';
      uuidv4Mock.mockReturnValue(mockUuid as unknown as never);

      await service.forgotPassword({ email: 'test@example.com' });

      expect(mockUsersService.setResetToken).toHaveBeenCalledWith('uuid-1', mockUuid, expect.any(Date));
    });
  });

  describe('resetPassword', () => {
    it('updates password and clears token on valid reset', async () => {
      mockUsersService.findByResetToken.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new.hashed.password' as never);

      await service.resetPassword({ token: 'valid-token', newPassword: 'NewPassword1' });

      expect(mockUsersService.clearResetToken).toHaveBeenCalledWith('uuid-1');
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith('uuid-1', 'new.hashed.password');
    });

    it('throws UnauthorizedException when token not found', async () => {
      mockUsersService.findByResetToken.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'invalid', newPassword: 'NewPassword1' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('updates password when currentPassword is correct', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new.hashed.password' as never);

      const result = await service.changePassword('uuid-1', {
        currentPassword: 'CurrentPassword1',
        newPassword: 'NewPassword1',
      });

      expect(result).toEqual({ message: 'Password changed successfully' });
    });

    it('throws UnauthorizedException when currentPassword is wrong', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.changePassword('uuid-1', {
          currentPassword: 'WrongPassword1',
          newPassword: 'NewPassword1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws BadRequestException when new and current passwords are same', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await expect(
        service.changePassword('uuid-1', {
          currentPassword: 'Password1',
          newPassword: 'Password1',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
