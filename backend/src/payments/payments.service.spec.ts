import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus, Sex } from '@prisma/client';
import { Prisma } from '@prisma/client';

const mockPrismaService = {
  payment: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  student: {
    findUnique: jest.fn(),
  },
  enrollment: {
    findUnique: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: typeof mockPrismaService;

  const mockPayment = {
    id: 'payment-uuid-1',
    studentId: 'student-1',
    enrollmentId: 'enrollment-1',
    amount: new Prisma.Decimal(100),
    currency: 'USD',
    paymentMethod: PaymentMethod.paypal,
    transactionId: 'txn-123',
    paymentDate: new Date('2024-01-01'),
    status: PaymentStatus.completed,
    receiptUrl: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    student: {
      user: { fullName: 'Ali Hassan', email: 'ali@example.com' },
    },
    enrollment: {
      course: { title: 'Quran Memorization' },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns paginated payments with filters', async () => {
      prisma.payment.findMany.mockResolvedValue([mockPayment]);
      prisma.payment.count.mockResolvedValue(1);

      const result = await service.findAll({
        page: 1,
        limit: 20,
        status: PaymentStatus.completed,
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('create', () => {
    it('creates a payment record', async () => {
      prisma.student.findUnique.mockResolvedValue({ id: 'student-1' });
      prisma.enrollment.findUnique.mockResolvedValue({ id: 'enrollment-1' });
      prisma.payment.create.mockResolvedValue(mockPayment);

      const dto = {
        studentId: 'student-1',
        enrollmentId: 'enrollment-1',
        amount: 100,
        paymentMethod: PaymentMethod.bank_transfer,
        paymentDate: '2024-01-01',
      };

      const result = await service.create(dto);

      expect(prisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: new Prisma.Decimal(100),
            paymentMethod: PaymentMethod.bank_transfer,
            status: PaymentStatus.completed,
          }),
        }),
      );
    });
  });

  describe('markVerified', () => {
    it('marks payment as completed', async () => {
      const pendingPayment = { ...mockPayment, status: PaymentStatus.pending, paymentMethod: PaymentMethod.bank_transfer };
      prisma.payment.findUnique.mockResolvedValue(pendingPayment);
      prisma.payment.update.mockResolvedValue(mockPayment);

      const result = await service.markVerified('payment-1', 'admin-1', 'txn-456');

      expect(prisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            status: PaymentStatus.completed,
            transactionId: 'txn-456',
          },
        }),
      );
    });

    it('throws BadRequestException when payment already completed', async () => {
      prisma.payment.findUnique.mockResolvedValue(mockPayment);

      await expect(
        service.markVerified('payment-1', 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when payment method is not bank_transfer', async () => {
      const paypalPayment = { ...mockPayment, status: PaymentStatus.pending, paymentMethod: PaymentMethod.paypal };
      prisma.payment.findUnique.mockResolvedValue(paypalPayment);

      await expect(
        service.markVerified('payment-1', 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
