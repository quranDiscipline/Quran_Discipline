import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  BlockDateDto,
  BulkScheduleDto,
} from './dto';

// Types for return values
export interface TeacherScheduleWithTeacher {
  id: string;
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxStudents: number | null;
  createdAt: Date;
  updatedAt: Date;
  teacher: {
    id: string;
    user: {
      fullName: string;
      email: string;
      sex: string;
    };
  };
}

export interface BlockedDateWithTeacher {
  id: string;
  teacherId: string | null;
  date: Date;
  reason: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  teacher: {
    id: string;
    user: {
      fullName: string;
    };
  } | null;
}

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
export class TeacherSchedulesService {
  private readonly logger = new Logger(TeacherSchedulesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all teacher schedules with optional filters
   */
  async findAll(
    page = 1,
    limit = 20,
    teacherId?: string,
    isAvailable?: boolean,
  ): Promise<PaginatedResponse<TeacherScheduleWithTeacher>> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (teacherId) {
      where.teacherId = teacherId;
    }
    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }

    const [schedules, total] = await Promise.all([
      this.prisma.teacherSchedule.findMany({
        where,
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                  sex: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: [{ teacherId: 'asc' }, { dayOfWeek: 'asc' }, { startTime: 'asc' }],
      }),
      this.prisma.teacherSchedule.count({ where }),
    ]);

    return {
      data: schedules as TeacherScheduleWithTeacher[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get schedules for a specific teacher
   */
  async getTeacherSchedules(teacherId: string): Promise<TeacherScheduleWithTeacher[]> {
    const schedules = await this.prisma.teacherSchedule.findMany({
      where: { teacherId },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                sex: true,
              },
            },
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return schedules as TeacherScheduleWithTeacher[];
  }

  /**
   * Get a single schedule by ID
   */
  async findById(id: string): Promise<TeacherScheduleWithTeacher> {
    const schedule = await this.prisma.teacherSchedule.findUnique({
      where: { id },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                sex: true,
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule as TeacherScheduleWithTeacher;
  }

  /**
   * Create a new teacher schedule
   */
  async create(dto: CreateScheduleDto): Promise<TeacherScheduleWithTeacher> {
    // Verify teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: dto.teacherId },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Validate time range
    const startMinutes = this.timeToMinutes(dto.startTime);
    const endMinutes = this.timeToMinutes(dto.endTime);

    if (endMinutes <= startMinutes) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for overlapping schedules
    const overlapping = await this.prisma.teacherSchedule.findFirst({
      where: {
        teacherId: dto.teacherId,
        dayOfWeek: dto.dayOfWeek,
        OR: [
          {
            // New schedule starts during an existing schedule
            AND: [
              { startTime: { lte: dto.startTime } },
              { endTime: { gt: dto.startTime } },
            ],
          },
          {
            // New schedule ends during an existing schedule
            AND: [
              { startTime: { lt: dto.endTime } },
              { endTime: { gte: dto.endTime } },
            ],
          },
          {
            // New schedule completely covers an existing schedule
            AND: [
              { startTime: { gte: dto.startTime } },
              { endTime: { lte: dto.endTime } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        'Schedule overlaps with an existing schedule for this day',
      );
    }

    const schedule = await this.prisma.teacherSchedule.create({
      data: {
        teacherId: dto.teacherId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        isAvailable: dto.isAvailable ?? true,
        maxStudents: dto.maxStudents,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                sex: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Created schedule ${schedule.id} for teacher ${dto.teacherId}`);

    return schedule as TeacherScheduleWithTeacher;
  }

  /**
   * Bulk create schedules for a teacher
   */
  async bulkCreate(dto: BulkScheduleDto): Promise<TeacherScheduleWithTeacher[]> {
    // Verify teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: dto.teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Delete existing schedules for this teacher
    await this.prisma.teacherSchedule.deleteMany({
      where: { teacherId: dto.teacherId },
    });

    // Create new schedules
    const schedules = await Promise.all(
      dto.schedules.map((scheduleData) =>
        this.prisma.teacherSchedule.create({
          data: {
            teacherId: dto.teacherId,
            dayOfWeek: scheduleData.dayOfWeek,
            startTime: scheduleData.startTime,
            endTime: scheduleData.endTime,
            isAvailable: scheduleData.isAvailable ?? true,
            maxStudents: scheduleData.maxStudents,
          },
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                    sex: true,
                  },
                },
              },
            },
          },
        }),
      ),
    );

    this.logger.log(
      `Bulk created ${schedules.length} schedules for teacher ${dto.teacherId}`,
    );

    return schedules as TeacherScheduleWithTeacher[];
  }

  /**
   * Update a schedule
   */
  async update(
    id: string,
    dto: UpdateScheduleDto,
  ): Promise<TeacherScheduleWithTeacher> {
    const existing = await this.prisma.teacherSchedule.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Schedule not found');
    }

    // If updating times, validate them
    if (dto.startTime && dto.endTime) {
      const startMinutes = this.timeToMinutes(dto.startTime);
      const endMinutes = this.timeToMinutes(dto.endTime);

      if (endMinutes <= startMinutes) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    const schedule = await this.prisma.teacherSchedule.update({
      where: { id },
      data: dto,
      include: {
        teacher: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                sex: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Updated schedule ${id}`);

    return schedule as TeacherScheduleWithTeacher;
  }

  /**
   * Delete a schedule
   */
  async delete(id: string): Promise<void> {
    const existing = await this.prisma.teacherSchedule.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Schedule not found');
    }

    await this.prisma.teacherSchedule.delete({
      where: { id },
    });

    this.logger.log(`Deleted schedule ${id}`);
  }

  /**
   * Get blocked dates
   */
  async getBlockedDates(
    startDate?: Date,
    endDate?: Date,
    teacherId?: string,
  ): Promise<BlockedDateWithTeacher[]> {
    const where: any = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startDate;
      }
      if (endDate) {
        where.date.lte = endDate;
      }
    }

    if (teacherId) {
      // Get both teacher-specific and global blocks
      where.OR = [
        { teacherId },
        { teacherId: null },
      ];
    }

    const blockedDates = await this.prisma.blockedDate.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    return blockedDates as BlockedDateWithTeacher[];
  }

  /**
   * Block a date (globally or for a specific teacher)
   */
  async blockDate(dto: BlockDateDto): Promise<BlockedDateWithTeacher> {
    // If teacherId is provided, verify teacher exists
    if (dto.teacherId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: dto.teacherId },
      });

      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }
    }

    // Check if date is already blocked
    const existing = await this.prisma.blockedDate.findFirst({
      where: {
        date: new Date(dto.date),
        teacherId: dto.teacherId || null,
      },
    });

    if (existing) {
      throw new BadRequestException('This date is already blocked');
    }

    const blockedDate = await this.prisma.blockedDate.create({
      data: {
        teacherId: dto.teacherId,
        date: new Date(dto.date),
        reason: dto.reason,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(
      `Blocked date ${dto.date} ${dto.teacherId ? `for teacher ${dto.teacherId}` : '(global)'}`,
    );

    return blockedDate as BlockedDateWithTeacher;
  }

  /**
   * Unblock a date
   */
  async unblockDate(id: string): Promise<void> {
    const existing = await this.prisma.blockedDate.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Blocked date not found');
    }

    await this.prisma.blockedDate.delete({
      where: { id },
    });

    this.logger.log(`Unblocked date ${id}`);
  }

  /**
   * Copy schedules from one teacher to another
   */
  async copySchedules(fromTeacherId: string, toTeacherId: string): Promise<TeacherScheduleWithTeacher[]> {
    // Verify both teachers exist
    const [fromTeacher, toTeacher] = await Promise.all([
      this.prisma.teacher.findUnique({ where: { id: fromTeacherId } }),
      this.prisma.teacher.findUnique({ where: { id: toTeacherId } }),
    ]);

    if (!fromTeacher) {
      throw new NotFoundException('Source teacher not found');
    }

    if (!toTeacher) {
      throw new NotFoundException('Destination teacher not found');
    }

    // Get source schedules
    const sourceSchedules = await this.prisma.teacherSchedule.findMany({
      where: { teacherId: fromTeacherId },
    });

    // Delete existing schedules for target teacher
    await this.prisma.teacherSchedule.deleteMany({
      where: { teacherId: toTeacherId },
    });

    // Create new schedules for target teacher
    const newSchedules = await Promise.all(
      sourceSchedules.map((schedule) =>
        this.prisma.teacherSchedule.create({
          data: {
            teacherId: toTeacherId,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            isAvailable: schedule.isAvailable,
            maxStudents: schedule.maxStudents,
          },
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                    sex: true,
                  },
                },
              },
            },
          },
        }),
      ),
    );

    this.logger.log(
      `Copied ${newSchedules.length} schedules from ${fromTeacherId} to ${toTeacherId}`,
    );

    return newSchedules as TeacherScheduleWithTeacher[];
  }

  /**
   * Helper method to convert time string (HH:MM) to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
