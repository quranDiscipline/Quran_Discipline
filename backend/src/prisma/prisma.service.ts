import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // Clean in correct order due to foreign key constraints
    const models = [
      'chatMessage',
      'conversation',
      'certificate',
      'landingPageContent',
      'teacherProfileChange',
      'bookingRequest',
      'assessmentSubmission',
      'assessment',
      'progressTracking',
      'session',
      'enrollment',
      'teacherSchedule',
      'payment',
      'student',
      'teacher',
      'course',
      'user',
    ] as const;

    return Promise.all(
      models.map((model) => {
        // Use type assertion to access the Prisma models
        const modelKey = model.charAt(0).toLowerCase() + model.slice(1) as keyof PrismaClient;
        const prismaModel = this[modelKey] as { deleteMany?: () => Promise<unknown> };
        return prismaModel.deleteMany?.() ?? this.$executeRawUnsafe(`DELETE FROM "${model}"`);
      }),
    );
  }
}
