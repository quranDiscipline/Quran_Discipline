import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { ErrorMessageCode } from '../common/filters/error-message-code.enum';
import { ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly bcryptRounds: number;
  private readonly accessExpiration: string;
  private readonly refreshExpiration: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.bcryptRounds = Number(this.config.get('BCRYPT_ROUNDS')) || 12;
    this.accessExpiration = this.config.get<string>('JWT_ACCESS_EXPIRATION') || '15m';
    this.refreshExpiration = this.config.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
  }

  async validateUser(email: string, password: string): Promise<AuthUser | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    // Update lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      sex: user.sex,
      profilePictureUrl: user.profilePictureUrl,
      mustChangePassword: user.mustChangePassword,
    } as AuthUser;
  }

  async login(user: AuthUser, res: Response) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role as 'admin' | 'teacher' | 'student',
      sex: user.sex as 'male' | 'female',
    };

    const accessToken = this.jwtService.sign(payload as any, {
      expiresIn: this.accessExpiration,
    } as any);

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.config.get('JWT_REFRESH_SECRET') || 'default_refresh_secret',
        expiresIn: this.refreshExpiration,
      } as any,
    );

    // Set refresh token as httpOnly cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth',
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        sex: user.sex,
        profilePictureUrl: user.profilePictureUrl,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  logout(res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/api/auth',
    });
  }

  async refreshToken(req: Request & { cookies?: { refresh_token?: string } }) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException({
        message: 'No refresh token provided',
        code: ErrorMessageCode.TOKEN_INVALID,
      });
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET') || 'default_refresh_secret',
      });

      const user = await this.usersService.findById(payload.sub);

      if (!user.isActive) {
        throw new UnauthorizedException({
          message: 'User account is inactive',
          code: ErrorMessageCode.USER_INACTIVE,
        });
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role as 'admin' | 'teacher' | 'student',
        sex: user.sex as 'male' | 'female',
      };

      const accessToken = this.jwtService.sign(newPayload as any, {
        expiresIn: this.accessExpiration,
      } as any);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Invalid or expired refresh token',
        code: ErrorMessageCode.TOKEN_EXPIRED,
      });
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (user) {
      const resetToken = uuidv4();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.usersService.setResetToken(user.id, resetToken, expiresAt);

      // DEV: Log the reset token (in prod, this would be sent via email)
      this.logger.log(`Reset token for ${dto.email}: ${resetToken}`);
      this.logger.log(
        `Reset link: http://localhost:5173/reset-password?token=${resetToken}`,
      );

      // TODO Phase 8: Send email via EmailService
      // await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    }

    // Always return success message to prevent email enumeration
    return {
      message: 'If this email exists, a reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(dto.token);

    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid or expired reset token',
        code: ErrorMessageCode.INVALID_RESET_TOKEN,
      });
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, this.bcryptRounds);

    await this.usersService.clearResetToken(user.id);
    await this.usersService.updatePassword(user.id, passwordHash);

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findByEmail(
      (await this.usersService.findById(userId)).email,
    );

    if (!user) {
      throw new UnauthorizedException({
        message: 'User not found',
        code: ErrorMessageCode.USER_NOT_FOUND,
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException({
        message: 'Current password is incorrect',
        code: ErrorMessageCode.INVALID_CREDENTIALS,
      });
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException({
        message: 'New password must be different from current password',
        code: ErrorMessageCode.PASSWORD_SAME_AS_CURRENT,
      });
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, this.bcryptRounds);
    await this.usersService.updatePassword(userId, newPasswordHash);

    return { message: 'Password changed successfully' };
  }
}
