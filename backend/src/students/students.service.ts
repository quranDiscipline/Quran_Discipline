import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './dto';

type StudentWithUser = Prisma.StudentGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        email: true;
        fullName: true;
        sex: true;
        phoneNumber: true;
        whatsappNumber: true;
        country: true;
        profilePictureUrl: true;
        isActive: true;
        mustChangePassword: true;
        createdAt: true;
      };
    };
  };
}>;

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface StudentStats {
  totalSessions: number;
  completedSessions: number;
  currentStreak: number;
  progressOverview: {
    totalCourses: number;
    activeCourses: number;
    completedCourses: number;
    averageProgress: number;
  };
}

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);
  private readonly bcryptRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.bcryptRounds = Number(this.config.get('BCRYPT_ROUNDS')) || 12;
  }

  async findAll(query: StudentQueryDto): Promise<PaginatedResponse<StudentWithUser>> {
    const { page = 1, limit = 20, search, subscriptionStatus, currentLevel, sex } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {
      user: {
        isActive: true,
        ...(search && {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            { email: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          ],
        }),
      },
      ...(subscriptionStatus !== undefined && { subscriptionStatus }),
      ...(currentLevel !== undefined && { currentLevel }),
      ...(sex !== undefined && { sex }),
    };

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
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
          _count: {
            select: { enrollments: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: students as StudentWithUser[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<StudentWithUser & { enrollments?: any[]; payments?: any[] }> {
    const student = await this.prisma.student.findUnique({
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
        enrollments: {
          include: {
            course: {
              select: { title: true, courseType: true },
            },
            teacher: {
              include: {
                user: {
                  select: { fullName: true },
                },
              },
            },
          },
        },
        payments: {
          take: 10,
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student as any;
  }

  async create(dto: CreateStudentDto): Promise<StudentWithUser> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the temporary password
    const passwordHash = await bcrypt.hash(dto.temporaryPassword, this.bcryptRounds);

    const { email, fullName, sex, temporaryPassword, currentLevel, country, phoneNumber, whatsappNumber, paymentMethod } = dto;

    // Use transaction to create user and student
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user with role 'student'
      const user = await tx.user.create({
        data: {
          email,
          fullName,
          sex,
          passwordHash,
          phoneNumber,
          whatsappNumber,
          country,
          role: UserRole.student,
          mustChangePassword: true,
        },
      });

      // Create student profile
      const studentData: any = {
        userId: user.id,
        sex,
        currentLevel: currentLevel || 'beginner', // Default to beginner if not provided
      };
      if (paymentMethod !== undefined) {
        studentData.paymentMethod = paymentMethod;
      }

      const student = await tx.student.create({
        data: studentData,
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

      return student;
    });

    // Access email through the included user relation
    const resultWithUser = result as any;
    this.logger.log(`Created new student: ${resultWithUser.user?.email}`);

    // TODO Phase 8: Send welcome email with temporary credentials
    // await this.emailService.sendStudentWelcomeEmail(result.user.email, dto.temporaryPassword);

    return result as StudentWithUser;
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentWithUser> {
    // Check if student exists
    const existing = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existing) {
      throw new NotFoundException('Student not found');
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

    // Separate user fields from student fields
    const userFields: Prisma.UserUpdateInput = {
      ...(dto.email && { email: dto.email }),
      ...(dto.fullName !== undefined && { fullName: dto.fullName }),
      ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
      ...(dto.whatsappNumber !== undefined && { whatsappNumber: dto.whatsappNumber }),
      ...(dto.country !== undefined && { country: dto.country }),
    };

    const studentFields: Prisma.StudentUpdateInput = {
      ...(dto.currentLevel !== undefined && { currentLevel: dto.currentLevel }),
      ...(dto.paymentMethod !== undefined && { paymentMethod: dto.paymentMethod }),
    };

    // Update both user and student in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      if (Object.keys(userFields).length > 0) {
        await tx.user.update({
          where: { id: existing.userId },
          data: userFields,
        });
      }

      const student = await tx.student.update({
        where: { id },
        data: studentFields,
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

      return student;
    });

    return result as StudentWithUser;
  }

  async deactivate(id: string): Promise<void> {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Warn if student has active subscription (but don't block)
    if (student.subscriptionStatus === 'active') {
      this.logger.warn(`Deactivating student with active subscription: ${student.user.email}`);
    }

    // Soft delete by setting isActive to false
    await this.prisma.user.update({
      where: { id: student.userId },
      data: { isActive: false },
    });

    this.logger.log(`Deactivated student: ${student.user.email}`);
  }

  async activate(id: string): Promise<void> {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Activate by setting isActive to true
    await this.prisma.user.update({
      where: { id: student.userId },
      data: { isActive: true },
    });

    this.logger.log(`Activated student: ${student.user.email}`);
  }

  async getStats() {
    const [totalStudents, activeStudents, byStatus] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.student.count({ where: { user: { isActive: true } } }),
      this.prisma.student.findMany({
        select: { subscriptionStatus: true, user: { select: { country: true } } },
        where: { user: { isActive: true } },
      }),
    ]);

    // Count by subscription status
    const statusCounts: Record<string, number> = {};
    byStatus.forEach((student) => {
      const status = student.subscriptionStatus || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Count by country
    const countryCounts: Record<string, number> = {};
    byStatus.forEach((student) => {
      const country = student.user.country || 'unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    return {
      total: totalStudents,
      active: activeStudents,
      bySubscriptionStatus: statusCounts,
      byCountry: countryCounts,
    };
  }

  async getStudentStats(id: string): Promise<StudentStats> {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const [totalSessions, completedSessions, enrollments] = await Promise.all([
      this.prisma.session.count({
        where: { studentId: id },
      }),
      this.prisma.session.count({
        where: { studentId: id, status: 'completed' },
      }),
      this.prisma.enrollment.findMany({
        where: { studentId: id },
        select: { status: true, progressPercentage: true },
      }),
    ]);

    const activeCourses = enrollments.filter((e) => e.status === 'active').length;
    const completedCourses = enrollments.filter((e) => e.status === 'completed').length;
    const averageProgress =
      enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + Number(e.progressPercentage), 0) / enrollments.length
        : 0;

    return {
      totalSessions,
      completedSessions,
      currentStreak: 0, // TODO: Calculate streak based on session attendance
      progressOverview: {
        totalCourses: enrollments.length,
        activeCourses,
        completedCourses,
        averageProgress: Math.round(averageProgress),
      },
    };
  }
}
