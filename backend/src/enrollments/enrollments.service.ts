import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma, EnrollmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto';

type EnrollmentFull = Prisma.EnrollmentGetPayload<{
  include: {
    student: { include: { user: { select: { fullName: true } } } };
    course: { select: { title: true } };
    teacher: { include: { user: { select: { fullName: true } } } };
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

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 20,
    status?: EnrollmentStatus,
  ): Promise<PaginatedResponse<EnrollmentFull>> {
    const skip = (page - 1) * limit;

    const where: Prisma.EnrollmentWhereInput = {
      ...(status !== undefined && { status }),
    };

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        include: {
          student: {
            include: {
              user: {
                select: { fullName: true },
              },
            },
          },
          course: {
            select: { title: true },
          },
          teacher: {
            include: {
              user: {
                select: { fullName: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return {
      data: enrollments as EnrollmentFull[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<EnrollmentFull> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
        course: {
          select: { title: true },
        },
        teacher: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment as EnrollmentFull;
  }

  async create(dto: CreateEnrollmentDto): Promise<EnrollmentFull> {
    // Verify student exists and is active
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
      include: { user: true },
    });

    if (!student || !student.user.isActive) {
      throw new NotFoundException('Student not found or inactive');
    }

    // Verify course exists and is active
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course || !course.isActive) {
      throw new NotFoundException('Course not found or inactive');
    }

    // Verify teacher exists and is available
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: dto.teacherId },
      include: { user: true },
    });

    if (!teacher || !teacher.isAvailable) {
      throw new NotFoundException('Teacher not found or unavailable');
    }

    // Check: student not already active in same course
    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId: dto.studentId,
        courseId: dto.courseId,
        status: 'active',
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Student already enrolled in this course');
    }

    // Calculate endDate
    const startDate = new Date(dto.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + course.durationMonths);

    // Create enrollment and increment teacher totalStudents in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.create({
        data: {
          studentId: dto.studentId,
          courseId: dto.courseId,
          teacherId: dto.teacherId,
          packageType: dto.packageType,
          startDate,
          endDate,
          status: 'active',
        },
        include: {
          student: {
            include: {
              user: {
                select: { fullName: true },
              },
            },
          },
          course: {
            select: { title: true },
          },
          teacher: {
            include: {
              user: {
                select: { fullName: true },
              },
            },
          },
        },
      });

      // Increment teacher's total students
      await tx.teacher.update({
        where: { id: dto.teacherId },
        data: {
          totalStudents: {
            increment: 1,
          },
        },
      });

      return enrollment;
    });

    return result as EnrollmentFull;
  }

  async updateStatus(id: string, status: EnrollmentStatus): Promise<EnrollmentFull> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Validate status transitions
    const validTransitions: Record<EnrollmentStatus, EnrollmentStatus[]> = {
      active: ['paused', 'cancelled', 'completed'],
      paused: ['active', 'cancelled'],
      cancelled: [],
      completed: [],
    };

    const allowedTransitions = validTransitions[enrollment.status];
    if (!allowedTransitions.includes(status)) {
      throw new UnprocessableEntityException(
        `Cannot transition from ${enrollment.status} to ${status}`,
      );
    }

    const updated = await this.prisma.enrollment.update({
      where: { id },
      data: { status },
      include: {
        student: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
        course: {
          select: { title: true },
        },
        teacher: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    return updated as EnrollmentFull;
  }

  async updateProgress(id: string, progressPercentage: number): Promise<EnrollmentFull> {
    // Validate 0 ≤ percentage ≤ 100
    if (progressPercentage < 0 || progressPercentage > 100) {
      throw new UnprocessableEntityException('Progress percentage must be between 0 and 100');
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const updated = await this.prisma.enrollment.update({
      where: { id },
      data: { progressPercentage: new Prisma.Decimal(progressPercentage) },
      include: {
        student: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
        course: {
          select: { title: true },
        },
        teacher: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    return updated as EnrollmentFull;
  }
}
