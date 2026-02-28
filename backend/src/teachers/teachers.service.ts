import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Prisma, UserRole, Sex } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto, UpdateTeacherDto, TeacherQueryDto } from './dto';

// Types for response objects
type TeacherWithUser = Prisma.TeacherGetPayload<{ include: { user: true } }>;

interface UserWithoutSensitive {
  id: string;
  email: string;
  fullName: string;
  sex: Sex;
  phoneNumber: string | null;
  whatsappNumber: string | null;
  country: string | null;
  profilePictureUrl: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
}

type TeacherWithUserSafe = Omit<TeacherWithUser, 'user'> & {
  user: UserWithoutSensitive;
};

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface TeacherStats {
  totalStudents: number;
  activeSessions: number;
  rating: number;
  joinedDate: Date;
}

@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name);
  private readonly bcryptRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.bcryptRounds = Number(this.config.get('BCRYPT_ROUNDS')) || 12;
  }

  async findAll(query: TeacherQueryDto): Promise<PaginatedResponse<TeacherWithUserSafe>> {
    const { page = 1, limit = 20, search, sex, isAvailable } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TeacherWhereInput = {
      user: {
        isActive: true,
        ...(search && {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            { email: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          ],
        }),
      },
      ...(sex !== undefined && { sex }),
      ...(isAvailable !== undefined && { isAvailable }),
    };

    const [teachers, total] = await Promise.all([
      this.prisma.teacher.findMany({
        where,
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
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.teacher.count({ where }),
    ]);

    return {
      data: teachers as TeacherWithUserSafe[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<TeacherWithUserSafe> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
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

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return teacher as TeacherWithUserSafe;
  }

  async create(dto: CreateTeacherDto): Promise<TeacherWithUserSafe> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the temporary password
    const passwordHash = await bcrypt.hash(dto.temporaryPassword, this.bcryptRounds);

    // Extract user fields and teacher fields
    const { email, fullName, sex, temporaryPassword, bio, qualifications, specializations, phoneNumber, whatsappNumber, country, hourlyRate, ...rest } = dto;

    // Use transaction to create user and teacher
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user with role 'teacher'
      const user = await tx.user.create({
        data: {
          email,
          fullName,
          sex,
          passwordHash,
          phoneNumber,
          whatsappNumber,
          country,
          role: UserRole.teacher,
          mustChangePassword: true,
        },
      });

      // Create teacher profile
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          sex,
          bio,
          qualifications: qualifications || [],
          specializations: specializations || [],
          hourlyRate: hourlyRate ? new Prisma.Decimal(hourlyRate) : null,
        },
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

      return teacher;
    });

    this.logger.log(`Created new teacher: ${result.user.email}`);

    // TODO Phase 8: Send welcome email with temporary credentials
    // await this.emailService.sendTeacherWelcomeEmail(result.user.email, dto.temporaryPassword);

    return result as TeacherWithUserSafe;
  }

  async update(id: string, dto: UpdateTeacherDto): Promise<TeacherWithUserSafe> {
    // Check if teacher exists
    const existing = await this.prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existing) {
      throw new NotFoundException('Teacher not found');
    }

    // If email is being updated, check uniqueness
    if (dto.email && dto.email !== existing.user.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }

    // Separate user fields from teacher fields
    const userFields: Prisma.UserUpdateInput = {
      ...(dto.email && { email: dto.email }),
      ...(dto.fullName !== undefined && { fullName: dto.fullName }),
      ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
      ...(dto.whatsappNumber !== undefined && { whatsappNumber: dto.whatsappNumber }),
      ...(dto.country !== undefined && { country: dto.country }),
    };

    const teacherFields: Prisma.TeacherUpdateInput = {
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.qualifications !== undefined && { qualifications: dto.qualifications }),
      ...(dto.specializations !== undefined && { specializations: dto.specializations }),
      ...(dto.hourlyRate !== undefined && { hourlyRate: dto.hourlyRate ? new Prisma.Decimal(dto.hourlyRate) : null }),
    };

    // Update both user and teacher in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      if (Object.keys(userFields).length > 0) {
        await tx.user.update({
          where: { id: existing.userId },
          data: userFields,
        });
      }

      const teacher = await tx.teacher.update({
        where: { id },
        data: teacherFields,
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

      return teacher;
    });

    return result as TeacherWithUserSafe;
  }

  async deactivate(id: string): Promise<void> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Check for active enrollments
    const activeEnrollmentsCount = await this.prisma.enrollment.count({
      where: {
        teacherId: id,
        status: 'active',
      },
    });

    if (activeEnrollmentsCount > 0) {
      throw new BadRequestException(
        'Cannot deactivate teacher with active student enrollments',
      );
    }

    // Soft delete by setting isActive to false
    await this.prisma.user.update({
      where: { id: teacher.userId },
      data: { isActive: false },
    });

    this.logger.log(`Deactivated teacher: ${teacher.user.email}`);
  }

  async getTeacherStats(id: string): Promise<TeacherStats> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const [totalStudents, activeSessions] = await Promise.all([
      this.prisma.enrollment.count({
        where: { teacherId: id, status: 'active' },
      }),
      this.prisma.session.count({
        where: {
          teacherId: id,
          status: 'scheduled',
          scheduledAt: { gte: new Date() },
        },
      }),
    ]);

    return {
      totalStudents,
      activeSessions,
      rating: Number(teacher.rating),
      joinedDate: teacher.createdAt,
    };
  }
}
