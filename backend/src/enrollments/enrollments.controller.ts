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
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto, UpdateEnrollmentStatusDto, UpdateEnrollmentProgressDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

type PaginatedResponse<T> = Awaited<ReturnType<EnrollmentsService['findAll']>>;

@ApiTags('admin-enrollments')
@Controller('admin/enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all enrollments (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'completed', 'paused', 'cancelled'] })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ): Promise<PaginatedResponse<any>> {
    return this.enrollmentsService.findAll(page, limit, status as any);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment by ID (admin only)' })
  async findById(@Param('id') id: string) {
    return this.enrollmentsService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new enrollment (admin only)' })
  async create(@Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update enrollment status (admin only)' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateEnrollmentStatusDto) {
    return this.enrollmentsService.updateStatus(id, dto.status);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update enrollment progress (admin only)' })
  async updateProgress(@Param('id') id: string, @Body() dto: UpdateEnrollmentProgressDto) {
    return this.enrollmentsService.updateProgress(id, dto.progressPercentage);
  }
}
