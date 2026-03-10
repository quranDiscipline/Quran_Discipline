import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto, StudentQueryDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

// Types for return values
type PaginatedResponse<T> = Awaited<ReturnType<StudentsService['findAll']>>;
type StudentStats = Awaited<ReturnType<StudentsService['getStudentStats']>>;

@ApiTags('admin-students')
@Controller('admin/students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all students (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'subscriptionStatus', required: false, enum: ['trial', 'active', 'paused', 'cancelled'] })
  @ApiQuery({ name: 'currentLevel', required: false, enum: ['beginner', 'intermediate', 'advanced'] })
  @ApiQuery({ name: 'sex', required: false, enum: ['male', 'female'] })
  async findAll(@Query() query: StudentQueryDto): Promise<PaginatedResponse<any>> {
    return this.studentsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get students statistics (admin only)' })
  async getStats() {
    return this.studentsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID (admin only)' })
  async findById(@Param('id') id: string): Promise<any> {
    return this.studentsService.findById(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get student statistics (admin only)' })
  async getStudentStats(@Param('id') id: string): Promise<StudentStats> {
    return this.studentsService.getStudentStats(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new student (admin only)' })
  async create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update student (admin only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate student (admin only)' })
  async deactivate(@Param('id') id: string) {
    await this.studentsService.deactivate(id);
    return {
      success: true,
      data: { message: 'Student deactivated successfully' },
    };
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate student (admin only)' })
  async activate(@Param('id') id: string) {
    await this.studentsService.activate(id);
    return {
      success: true,
      data: { message: 'Student activated successfully' },
    };
  }
}
