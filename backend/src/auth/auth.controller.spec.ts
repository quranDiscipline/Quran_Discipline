import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { UserRole, Sex } from '@prisma/client';
import type { Response } from 'express';

const mockAuthService = {
  login: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  changePassword: jest.fn(),
};

const mockUser = {
  id: 'uuid-1',
  email: 'admin@qurandiscipline.academy',
  fullName: 'Admin User',
  role: UserRole.admin,
  sex: Sex.male,
  profilePictureUrl: null,
  mustChangePassword: false,
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthGuard('local'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('calls authService.login and returns token', async () => {
      mockAuthService.login.mockResolvedValue({
        accessToken: 'access.token',
        user: mockUser,
      });

      const res: any = {
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn(),
      };

      await controller.login(mockUser, res);

      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser, res);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          accessToken: 'access.token',
          user: mockUser,
        },
      });
    });
  });

  describe('logout', () => {
    it('calls authService.logout', async () => {
      const res: any = {
        clearCookie: jest.fn(),
        json: jest.fn().mockReturnThis(),
      };

      await controller.logout(res);

      expect(mockAuthService.logout).toHaveBeenCalledWith(res);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    });
  });

  describe('refreshToken', () => {
    it('returns new accessToken', async () => {
      mockAuthService.refreshToken.mockResolvedValue({
        accessToken: 'new.access.token',
      });

      const req: any = { cookies: {} };

      const result = await controller.refreshToken(req);

      expect(result).toEqual({ accessToken: 'new.access.token' });
    });
  });

  describe('forgotPassword', () => {
    it('returns success message', async () => {
      mockAuthService.forgotPassword.mockResolvedValue({
        message: 'If this email exists, a reset link has been sent.',
      });

      const result = await controller.forgotPassword({ email: 'test@example.com' });

      expect(result).toEqual({
        message: 'If this email exists, a reset link has been sent.',
      });
    });
  });

  describe('changePassword', () => {
    it('calls authService.changePassword', async () => {
      mockAuthService.changePassword.mockResolvedValue({
        message: 'Password changed successfully',
      });

      const result = await controller.changePassword(mockUser, {
        currentPassword: 'OldPassword1',
        newPassword: 'NewPassword1',
      });

      expect(mockAuthService.changePassword).toHaveBeenCalledWith('uuid-1', {
        currentPassword: 'OldPassword1',
        newPassword: 'NewPassword1',
      });
      expect(result).toEqual({ message: 'Password changed successfully' });
    });
  });
});
