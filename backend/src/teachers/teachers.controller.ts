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
import { TeachersService } from './teachers.service';
import { CreateTeacherDto, UpdateTeacherDto, TeacherQueryDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

// Types for return values
type PaginatedResponse<T> = Awaited<ReturnType<TeachersService['findAll']>>;
type TeacherById = Awaited<ReturnType<TeachersService['findById']>>;
type TeacherStats = Awaited<ReturnType<TeachersService['getTeacherStats']>>;
type CreatedTeacher = Awaited<ReturnType<TeachersService['create']>>;
type UpdatedTeacher = Awaited<ReturnType<TeachersService['update']>>;

@ApiTags('admin-teachers')
@Controller('admin/teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all teachers (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sex', required: false, enum: ['male', 'female'] })
  @ApiQuery({ name: 'isAvailable', required: false, type: Boolean })
  async findAll(@Query() query: TeacherQueryDto): Promise<PaginatedResponse<any>> {
    return this.teachersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get teacher by ID (admin only)' })
  async findById(@Param('id') id: string): Promise<TeacherById> {
    return this.teachersService.findById(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get teacher statistics (admin only)' })
  async getTeacherStats(@Param('id') id: string): Promise<TeacherStats> {
    return this.teachersService.getTeacherStats(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new teacher (admin only)' })
  async create(@Body() dto: CreateTeacherDto): Promise<CreatedTeacher> {
    return this.teachersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update teacher (admin only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateTeacherDto): Promise<UpdatedTeacher> {
    return this.teachersService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate teacher (admin only)' })
  async deactivate(@Param('id') id: string) {
    await this.teachersService.deactivate(id);
    return {
      success: true,
      data: { message: 'Teacher deactivated successfully' },
    };
  }
}
