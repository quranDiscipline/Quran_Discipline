import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, PaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, PaymentQueryDto } from './dto';

type PaymentWithDetails = Prisma.PaymentGetPayload<{
  include: {
    student: {
      include: {
        user: {
          select: { fullName: true; email: true };
        };
      };
    };
    enrollment: {
      include: {
        course: { select: { title: true } };
      };
    };
  };
}>;

interface RevenueSummary {
  totalThisMonth: number;
  totalThisQuarter: number;
  totalThisYear: number;
  byPaymentMethod: Record<PaymentMethod, number>;
  byPackageType: Record<string, number>;
}

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
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaymentQueryDto): Promise<PaginatedResponse<PaymentWithDetails>> {
    const { page = 1, limit = 20, status, paymentMethod, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      ...(status !== undefined && { status }),
      ...(paymentMethod !== undefined && { paymentMethod }),
      ...(startDate && { paymentDate: { gte: new Date(startDate) } }),
      ...(endDate && { paymentDate: { lte: new Date(endDate) } }),
    };

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          student: {
            include: {
              user: {
                select: { fullName: true, email: true },
              },
            },
          },
          enrollment: {
            include: {
              course: {
                select: { title: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { paymentDate: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments as PaymentWithDetails[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<PaymentWithDetails> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: { fullName: true, email: true },
            },
          },
        },
        enrollment: {
          include: {
            course: {
              select: { title: true },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment as PaymentWithDetails;
  }

  async create(dto: CreatePaymentDto): Promise<PaymentWithDetails> {
    // Verify student and enrollment exist
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: dto.enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const payment = await this.prisma.payment.create({
      data: {
        studentId: dto.studentId,
        enrollmentId: dto.enrollmentId,
        amount: new Prisma.Decimal(dto.amount),
        paymentMethod: dto.paymentMethod,
        transactionId: dto.transactionId,
        paymentDate: new Date(dto.paymentDate),
        status: PaymentStatus.completed, // Manual entry is assumed complete
      },
      include: {
        student: {
          include: {
            user: {
              select: { fullName: true, email: true },
            },
          },
        },
        enrollment: {
          include: {
            course: {
              select: { title: true },
            },
          },
        },
      },
    });

    return payment as PaymentWithDetails;
  }

  async markVerified(id: string, adminId: string, transactionId?: string): Promise<PaymentWithDetails> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.completed) {
      throw new BadRequestException('Payment already verified');
    }

    // Only bank_transfer payments should be manually verified
    if (payment.paymentMethod !== PaymentMethod.bank_transfer) {
      throw new BadRequestException('Only bank transfer payments can be manually verified');
    }

    const updated = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.completed,
        ...(transactionId && { transactionId }),
      },
      include: {
        student: {
          include: {
            user: {
              select: { fullName: true, email: true },
            },
          },
        },
        enrollment: {
          include: {
            course: {
              select: { title: true },
            },
          },
        },
      },
    });

    return updated as PaymentWithDetails;
  }

  async getRevenueSummary(): Promise<RevenueSummary> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalThisMonth,
      totalThisQuarter,
      totalThisYear,
      paymentsByMethod,
      paymentsByPackage,
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.completed,
          paymentDate: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.completed,
          paymentDate: { gte: startOfQuarter },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.completed,
          paymentDate: { gte: startOfYear },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: { status: PaymentStatus.completed },
        _sum: { amount: true },
      }),
      this.prisma.$queryRaw<Array<{ packageType: string; total: bigint }>>`
        SELECT e."packageType", SUM(p.amount) as total
        FROM "payments" p
        JOIN "enrollments" e ON e.id = p."enrollmentId"
        WHERE p.status = 'completed'
        GROUP BY e."packageType"
      `,
    ]);

    const byPaymentMethod: Record<PaymentMethod, number> = {
      [PaymentMethod.paypal]: 0,
      [PaymentMethod.bank_transfer]: 0,
    };

    paymentsByMethod.forEach((item) => {
      byPaymentMethod[item.paymentMethod] = Number(item._sum.amount || 0);
    });

    const byPackageType: Record<string, number> = {};
    paymentsByPackage.forEach((item: any) => {
      byPackageType[item.packageType] = Number(item.total);
    });

    return {
      totalThisMonth: Number(totalThisMonth._sum.amount || 0),
      totalThisQuarter: Number(totalThisQuarter._sum.amount || 0),
      totalThisYear: Number(totalThisYear._sum.amount || 0),
      byPaymentMethod,
      byPackageType: byPackageType,
    };
  }
}
