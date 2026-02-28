import { IsUUID, IsNotEmpty, IsString, IsNumber, IsDateString, IsEnum, IsOptional, Min } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  enrollmentId!: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount!: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod!: PaymentMethod;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  paymentDate!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  transactionId?: string;
}

export class PaymentQueryDto {
  @ApiPropertyOptional({ enum: PaymentStatus })
  status?: PaymentStatus;

  @ApiPropertyOptional({ enum: PaymentMethod })
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  startDate?: string;

  @ApiPropertyOptional()
  endDate?: string;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  limit?: number;
}
