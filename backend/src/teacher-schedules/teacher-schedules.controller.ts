import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { TeacherSchedulesService } from './teacher-schedules.service';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  BlockDateDto,
  BulkScheduleDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

type PaginatedResponse<T> = Awaited<ReturnType<TeacherSchedulesService['findAll']>>;

@ApiTags('teacher-schedules')
@Controller('admin/teacher-schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class TeacherSchedulesController {
  constructor(private readonly schedulesService: TeacherSchedulesService) {}

  /**
   * Get all teacher schedules with pagination and filters
   */
  @Get()
  @ApiOperation({ summary: 'Get all teacher schedules (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'teacherId', required: false, type: String })
  @ApiQuery({ name: 'isAvailable', required: false, type: Boolean })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('teacherId') teacherId?: string,
    @Query('isAvailable') isAvailable?: string,
  ): Promise<PaginatedResponse<any>> {
    return this.schedulesService.findAll(
      page,
      limit,
      teacherId,
      isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined,
    );
  }

  /**
   * Get schedules for a specific teacher
   */
  @Get(':teacherId')
  @ApiOperation({ summary: 'Get schedules for a specific teacher (admin only)' })
  @ApiParam({ name: 'teacherId', description: 'Teacher ID' })
  async getTeacherSchedules(@Param('teacherId') teacherId: string) {
    return this.schedulesService.getTeacherSchedules(teacherId);
  }

  /**
   * Get a single schedule by ID
   */
  @Get('by-id/:id')
  @ApiOperation({ summary: 'Get a schedule by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  async findById(@Param('id') id: string) {
    return this.schedulesService.findById(id);
  }

  /**
   * Create a new schedule
   */
  @Post()
  @ApiOperation({ summary: 'Create a new schedule (admin only)' })
  async create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }

  /**
   * Bulk create schedules for a teacher
   */
  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create schedules for a teacher (admin only)' })
  async bulkCreate(@Body() dto: BulkScheduleDto) {
    return this.schedulesService.bulkCreate(dto);
  }

  /**
   * Update a schedule
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a schedule (admin only)' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    return this.schedulesService.update(id, dto);
  }

  /**
   * Delete a schedule
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a schedule (admin only)' })
  @ApiParam({ name: 'id', description: 'Schedule ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.schedulesService.delete(id);
  }

  /**
   * Copy schedules from one teacher to another
   */
  @Post('copy/:fromTeacherId/:toTeacherId')
  @ApiOperation({ summary: 'Copy schedules from one teacher to another (admin only)' })
  @ApiParam({ name: 'fromTeacherId', description: 'Source teacher ID' })
  @ApiParam({ name: 'toTeacherId', description: 'Destination teacher ID' })
  async copySchedules(
    @Param('fromTeacherId') fromTeacherId: string,
    @Param('toTeacherId') toTeacherId: string,
  ) {
    return this.schedulesService.copySchedules(fromTeacherId, toTeacherId);
  }
}

@ApiTags('blocked-dates')
@Controller('admin/blocked-dates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class BlockedDatesController {
  constructor(private readonly schedulesService: TeacherSchedulesService) {}

  /**
   * Get all blocked dates
   */
  @Get()
  @ApiOperation({ summary: 'Get all blocked dates (admin only)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'teacherId', required: false, type: String })
  async getBlockedDates(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.schedulesService.getBlockedDates(start, end, teacherId);
  }

  /**
   * Block a date
   */
  @Post()
  @ApiOperation({ summary: 'Block a date (admin only)' })
  async blockDate(@Body() dto: BlockDateDto) {
    return this.schedulesService.blockDate(dto);
  }

  /**
   * Unblock a date
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Unblock a date (admin only)' })
  @ApiParam({ name: 'id', description: 'Blocked date ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async unblockDate(@Param('id') id: string) {
    await this.schedulesService.unblockDate(id);
  }
}
