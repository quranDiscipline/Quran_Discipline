import { Injectable } from '@nestjs/common';
import { Prisma, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface DashboardStats {
  totalActiveStudents: number;
  totalTeachers: number;
  totalRevenueThisMonth: number;
  newEnrollmentsThisMonth: number;
  pendingBookingRequests: number;
  pendingProfileChanges: number;
  sessionsTodayCount: number;
  averageRating: number;
}

interface RevenueChartData {
  month: string;
  revenue: number;
  enrollments: number;
}

interface CountryBreakdown {
  country: string;
  count: number;
}

interface PackageBreakdown {
  packageType: string;
  count: number;
}

interface SubscriptionBreakdown {
  status: string;
  count: number;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const [
      totalActiveStudents,
      totalTeachers,
      totalRevenueThisMonth,
      newEnrollmentsThisMonth,
      pendingBookingRequests,
      pendingProfileChanges,
      sessionsTodayCount,
      averageRating,
    ] = await Promise.all([
      // Active students
      this.prisma.student.count({
        where: { subscriptionStatus: SubscriptionStatus.active },
      }),
      // Available teachers
      this.prisma.teacher.count({
        where: { isAvailable: true },
      }),
      // Revenue this month
      this.prisma.payment.aggregate({
        where: {
          status: 'completed',
          paymentDate: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      // New enrollments this month
      this.prisma.enrollment.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      // Pending booking requests
      this.prisma.bookingRequest.count({
        where: { status: 'pending' },
      }),
      // Pending profile changes
      this.prisma.teacherProfileChange.count({
        where: { status: 'pending' },
      }),
      // Sessions today
      this.prisma.session.count({
        where: {
          scheduledAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      // Average teacher rating
      this.prisma.teacher.aggregate({
        _avg: { rating: true },
      }),
    ]);

    return {
      totalActiveStudents,
      totalTeachers,
      totalRevenueThisMonth: Number(totalRevenueThisMonth._sum.amount || 0),
      newEnrollmentsThisMonth,
      pendingBookingRequests,
      pendingProfileChanges,
      sessionsTodayCount,
      averageRating: Number(averageRating._avg.rating || 0),
    };
  }

  async getRevenueChart(months = 12): Promise<RevenueChartData[]> {
    const data: RevenueChartData[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

      const [revenueResult, enrollmentsCount] = await Promise.all([
        this.prisma.payment.aggregate({
          where: {
            status: 'completed',
            paymentDate: { gte: startOfMonth, lt: endOfMonth },
          },
          _sum: { amount: true },
        }),
        this.prisma.enrollment.count({
          where: {
            createdAt: { gte: startOfMonth, lt: endOfMonth },
          },
        }),
      ]);

      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      data.push({
        month: monthLabel,
        revenue: Number(revenueResult._sum.amount || 0),
        enrollments: enrollmentsCount,
      });
    }

    return data;
  }

  async getStudentsByCountry(): Promise<CountryBreakdown[]> {
    // Get unique countries from users directly
    const students = await this.prisma.student.findMany({
      where: { user: { isActive: true } },
      include: { user: { select: { country: true } } },
    });

    const countryCount: Record<string, number> = {};
    students.forEach((student) => {
      const country = student.user.country || 'Unknown';
      countryCount[country] = (countryCount[country] || 0) + 1;
    });

    return Object.entries(countryCount)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getStudentsByPackage(): Promise<PackageBreakdown[]> {
    const enrollments = await this.prisma.enrollment.groupBy({
      by: ['packageType'],
      where: { status: 'active' },
      _count: true,
    });

    return enrollments.map((item) => ({
      packageType: item.packageType,
      count: item._count,
    }));
  }

  async getStudentsBySubscriptionStatus(): Promise<SubscriptionBreakdown[]> {
    const result = await this.prisma.student.groupBy({
      by: ['subscriptionStatus'],
      _count: true,
    });

    return result.map((item) => ({
      status: item.subscriptionStatus,
      count: item._count,
    }));
  }
}
