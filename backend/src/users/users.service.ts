import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole, Sex } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export type UserWithoutSensitive = Omit<
  User,
  'passwordHash' | 'resetPasswordToken' | 'resetPasswordExpiresAt'
>;

export type UserSummary = Pick<
  User,
  'id' | 'email' | 'fullName' | 'role' | 'sex' | 'isActive' | 'createdAt'
>;

@Injectable()
export class UsersService {
  private readonly bcryptRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.bcryptRounds = Number(this.config.get<number>('BCRYPT_ROUNDS')) || 12;
  }

  async findById(id: string): Promise<UserWithoutSensitive> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    role?: UserRole;
  }) {
    const { skip = 0, take = 20, role } = params;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where: role ? { role } : undefined,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          sex: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: role ? { role } : undefined,
      }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async create(dto: CreateUserDto): Promise<UserWithoutSensitive> {
    // Check email uniqueness
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);

    const { password, ...userData } = dto;

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        passwordHash,
        mustChangePassword: true, // Admin-created accounts must change password
      },
    });

    return this.sanitizeUser(user);
  }

  async update(
    id: string,
    dto: UpdateUserDto & { email?: string },
  ): Promise<UserWithoutSensitive> {
    // Check if user exists
    await this.findById(id);

    // If email is being changed, check uniqueness
    if (dto.email) {
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    return this.sanitizeUser(user);
  }

  async deactivate(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isActive === false) {
      throw new BadRequestException('User is already inactive');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async delete(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Permanently delete the user
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async setResetToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    const tokenHash = await bcrypt.hash(token, this.bcryptRounds);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordToken: tokenHash,
        resetPasswordExpiresAt: expiresAt,
      },
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    const users = await this.prisma.user.findMany({
      where: {
        resetPasswordToken: { not: null },
      },
    });

    for (const user of users) {
      if (user.resetPasswordToken && await bcrypt.compare(token, user.resetPasswordToken)) {
        // Check if token is expired
        if (user.resetPasswordExpiresAt && user.resetPasswordExpiresAt < new Date()) {
          return null;
        }
        return user;
      }
    }

    return null;
  }

  async clearResetToken(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
        mustChangePassword: false,
      },
    });
  }

  private sanitizeUser(user: User): UserWithoutSensitive {
    const { passwordHash, resetPasswordToken, resetPasswordExpiresAt, ...sanitized } = user;
    return sanitized;
  }
}
