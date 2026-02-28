import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  BadRequestException,
} from '@nestjs/common';
import { ChangeType, ProfileChangeStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileChangeDto, ReviewProfileChangeDto } from './dto';

type ProfileChangeWithTeacher = {
  id: string;
  teacherId: string;
  requestedChanges: Record<string, any>;
  changeType: ChangeType;
  reason: string;
  status: ProfileChangeStatus;
  requestedAt: Date;
  reviewedAt: Date | null;
  reviewedById: string | null;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  teacher: {
    user: {
      fullName: string;
      email: string;
    };
  };
};

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

@Injectable()
export class TeacherProfileChangesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 20,
    status?: ProfileChangeStatus,
    teacherId?: string,
  ): Promise<PaginatedResponse<ProfileChangeWithTeacher>> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== undefined) {
      where.status = status;
    }
    if (teacherId !== undefined) {
      where.teacherId = teacherId;
    }

    const [changes, total] = await Promise.all([
      this.prisma.teacherProfileChange.findMany({
        where,
        include: {
          teacher: {
            include: {
              user: {
                select: { fullName: true, email: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { requestedAt: 'desc' },
      }),
      this.prisma.teacherProfileChange.count({ where }),
    ]);

    return {
      data: changes as ProfileChangeWithTeacher[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<ProfileChangeWithTeacher> {
    const change = await this.prisma.teacherProfileChange.findUnique({
      where: { id },
      include: {
        teacher: {
          include: {
            user: {
              select: { fullName: true, email: true },
            },
          },
        },
      },
    });

    if (!change) {
      throw new NotFoundException('Profile change request not found');
    }

    return change as ProfileChangeWithTeacher;
  }

  async create(teacherId: string, dto: CreateProfileChangeDto): Promise<ProfileChangeWithTeacher> {
    // Check teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Check no PENDING request exists for this teacher
    const existingPending = await this.prisma.teacherProfileChange.findFirst({
      where: {
        teacherId,
        status: ProfileChangeStatus.pending,
      },
    });

    if (existingPending) {
      throw new UnprocessableEntityException(
        'You already have a pending change request. Wait for admin review.',
      );
    }

    // Determine changeType
    const changedFields = Object.keys(dto.requestedChanges);
    let changeType: ChangeType;

    if (changedFields.length === 0) {
      throw new BadRequestException('No changes requested');
    } else if (changedFields.length === 1) {
      const field = changedFields[0];
      if (field === 'bio') changeType = ChangeType.bio;
      else if (field === 'qualifications') changeType = ChangeType.qualifications;
      else if (field === 'specializations') changeType = ChangeType.specializations;
      else if (field === 'profilePictureUrl') changeType = ChangeType.photo;
      else changeType = ChangeType.multiple;
    } else {
      changeType = ChangeType.multiple;
    }

    const change = await this.prisma.teacherProfileChange.create({
      data: {
        teacherId,
        requestedChanges: dto.requestedChanges as any,
        changeType,
        reason: dto.reason,
        status: ProfileChangeStatus.pending,
        requestedAt: new Date(),
      },
      include: {
        teacher: {
          include: {
            user: {
              select: { fullName: true, email: true },
            },
          },
        },
      },
    });

    // TODO Phase 8: Send email notification to admin
    // await this.emailService.sendAdminProfileChangeNotification(change);

    return change as ProfileChangeWithTeacher;
  }

  async approve(id: string, adminId: string, dto: ReviewProfileChangeDto): Promise<ProfileChangeWithTeacher> {
    const changeRequest = await this.prisma.teacherProfileChange.findUnique({
      where: { id },
    });

    if (!changeRequest) {
      throw new NotFoundException('Profile change request not found');
    }

    if (changeRequest.status !== ProfileChangeStatus.pending) {
      throw new UnprocessableEntityException('Request already reviewed');
    }

    // Apply changes in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Apply requested changes to teacher profile
      const { bio, qualifications, specializations, profilePictureUrl } = changeRequest.requestedChanges as any;
      const teacherUpdateData: any = {};
      if (bio !== undefined) teacherUpdateData.bio = bio;
      if (qualifications !== undefined) teacherUpdateData.qualifications = qualifications;
      if (specializations !== undefined) teacherUpdateData.specializations = specializations;

      if (Object.keys(teacherUpdateData).length > 0) {
        await tx.teacher.update({
          where: { id: changeRequest.teacherId },
          data: teacherUpdateData,
        });
      }

      // Update user's profilePictureUrl if that was requested
      if (profilePictureUrl !== undefined) {
        await tx.user.update({
          where: { id: (await tx.teacher.findUnique({ where: { id: changeRequest.teacherId } }))!.userId },
          data: { profilePictureUrl },
        });
      }

      // Update the change request status
      const updated = await tx.teacherProfileChange.update({
        where: { id },
        data: {
          status: ProfileChangeStatus.approved,
          reviewedAt: new Date(),
          reviewedById: adminId,
          adminNotes: dto.notes || null,
        },
        include: {
          teacher: {
            include: {
              user: {
                select: { fullName: true, email: true },
              },
            },
          },
        },
      });

      return updated;
    });

    // TODO Phase 8: Send email to teacher about approval
    // await this.emailService.sendProfileChangeApprovedEmail(result.teacher.user.email, dto.notes);

    return result as ProfileChangeWithTeacher;
  }

  async reject(id: string, adminId: string, dto: ReviewProfileChangeDto): Promise<ProfileChangeWithTeacher> {
    const changeRequest = await this.prisma.teacherProfileChange.findUnique({
      where: { id },
    });

    if (!changeRequest) {
      throw new NotFoundException('Profile change request not found');
    }

    if (changeRequest.status !== ProfileChangeStatus.pending) {
      throw new UnprocessableEntityException('Request already reviewed');
    }

    // Admin notes are REQUIRED on rejection
    if (!dto.notes || dto.notes.trim().length === 0) {
      throw new BadRequestException('Admin notes are required when rejecting a request');
    }

    const updated = await this.prisma.teacherProfileChange.update({
      where: { id },
      data: {
        status: ProfileChangeStatus.rejected,
        reviewedAt: new Date(),
        reviewedById: adminId,
        adminNotes: dto.notes,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: { fullName: true, email: true },
            },
          },
        },
      },
    });

    // TODO Phase 8: Send email to teacher about rejection
    // await this.emailService.sendProfileChangeRejectedEmail(updated.teacher.user.email, dto.notes);

    return updated as ProfileChangeWithTeacher;
  }
}
