import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymentQueryDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

type PaginatedResponse<T> = Awaited<ReturnType<PaymentsService['findAll']>>;
type RevenueSummary = Awaited<ReturnType<PaymentsService['getRevenueSummary']>>;

@ApiTags('admin-payments')
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all payments (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'completed', 'failed', 'refunded'] })
  @ApiQuery({ name: 'paymentMethod', required: false, enum: ['paypal', 'bank_transfer'] })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async findAll(@Query() query: PaymentQueryDto): Promise<PaginatedResponse<any>> {
    return this.paymentsService.findAll(query);
  }

  @Get('summary/revenue')
  @ApiOperation({ summary: 'Get revenue summary (admin only)' })
  async getRevenueSummary(): Promise<RevenueSummary> {
    return this.paymentsService.getRevenueSummary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID (admin only)' })
  async findById(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a payment record (admin only)' })
  async create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'Mark bank transfer payment as verified (admin only)' })
  async markVerified(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body('transactionId') transactionId?: string,
  ) {
    return this.paymentsService.markVerified(id, user.id, transactionId);
  }
}
