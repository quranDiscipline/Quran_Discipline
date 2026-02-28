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
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingRequestDto, AssignBookingDto, ConfirmBookingDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

type PaginatedResponse<T> = Awaited<ReturnType<BookingService['findAll']>>;

@ApiTags('booking')
@Controller()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // Public endpoint - no auth required
  @Post('public/booking-requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a booking request (public)' })
  async create(@Body() dto: CreateBookingRequestDto) {
    return this.bookingService.create(dto);
  }

  // Admin endpoints
  @Get('admin/booking-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all booking requests (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'confirmed', 'completed', 'cancelled'] })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ): Promise<PaginatedResponse<any>> {
    return this.bookingService.findAll(page, limit, status as any);
  }

  @Get('admin/booking-requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get booking request by ID (admin only)' })
  async findById(@Param('id') id: string) {
    return this.bookingService.findById(id);
  }

  @Patch('admin/booking-requests/:id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Assign teacher to booking request (admin only)' })
  async assign(@Param('id') id: string, @Body() dto: AssignBookingDto) {
    return this.bookingService.assign(id, dto);
  }

  @Patch('admin/booking-requests/:id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Confirm booking with Zoom link (admin only)' })
  async confirm(@Param('id') id: string, @Body() dto: ConfirmBookingDto) {
    return this.bookingService.confirm(id, dto);
  }

  @Patch('admin/booking-requests/:id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Cancel booking request (admin only)' })
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string) {
    await this.bookingService.cancel(id);
    return {
      success: true,
      data: { message: 'Booking request cancelled successfully' },
    };
  }
}
