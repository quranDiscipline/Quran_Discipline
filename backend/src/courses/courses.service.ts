import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';

type CourseWithEnrollments = Prisma.CourseGetPayload<{
  include: { _count: { select: { enrollments: true } } };
}>;

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(includeInactive = false): Promise<CourseWithEnrollments[]> {
    return this.prisma.course.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }) as Promise<CourseWithEnrollments[]>;
  }

  async findById(id: string): Promise<CourseWithEnrollments> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course as CourseWithEnrollments;
  }

  async create(dto: CreateCourseDto, adminId: string): Promise<CourseWithEnrollments> {
    const course = await this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        courseType: dto.courseType,
        durationMonths: dto.durationMonths,
        priceMonthly: new Prisma.Decimal(dto.priceMonthly),
        maxStudentsPerGroup: dto.maxStudentsPerGroup,
        createdById: adminId,
      },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    return course as CourseWithEnrollments;
  }

  async update(id: string, dto: UpdateCourseDto): Promise<CourseWithEnrollments> {
    const existing = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Course not found');
    }

    const course = await this.prisma.course.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.courseType !== undefined && { courseType: dto.courseType }),
        ...(dto.durationMonths !== undefined && { durationMonths: dto.durationMonths }),
        ...(dto.priceMonthly !== undefined && { priceMonthly: new Prisma.Decimal(dto.priceMonthly) }),
        ...(dto.maxStudentsPerGroup !== undefined && { maxStudentsPerGroup: dto.maxStudentsPerGroup }),
      },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    return course as CourseWithEnrollments;
  }

  async deactivate(id: string): Promise<void> {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check for active enrollments
    const activeEnrollmentsCount = await this.prisma.enrollment.count({
      where: {
        courseId: id,
        status: 'active',
      },
    });

    if (activeEnrollmentsCount > 0) {
      throw new BadRequestException(
        'Cannot deactivate a course with active enrollments',
      );
    }

    await this.prisma.course.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
