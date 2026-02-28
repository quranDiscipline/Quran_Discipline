import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { TeacherProfileChangesService } from './teacher-profile-changes.service';
import { ReviewProfileChangeDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

type PaginatedResponse<T> = Awaited<ReturnType<TeacherProfileChangesService['findAll']>>;

@ApiTags('teacher-profile-changes')
@Controller('admin/teacher-profile-changes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class TeacherProfileChangesController {
  constructor(private readonly service: TeacherProfileChangesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all profile change requests (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected'] })
  @ApiQuery({ name: 'teacherId', required: false, type: String })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('teacherId') teacherId?: string,
  ): Promise<PaginatedResponse<any>> {
    return this.service.findAll(page, limit, status as any, teacherId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get profile change request by ID (admin only)' })
  async findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve profile change request (admin only)' })
  async approve(
    @Param('id') id: string,
    @Body() dto: ReviewProfileChangeDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.approve(id, user.id, dto);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject profile change request (admin only)' })
  async reject(
    @Param('id') id: string,
    @Body() dto: ReviewProfileChangeDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.reject(id, user.id, dto);
  }
}
