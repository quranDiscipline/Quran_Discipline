import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

// Types for return values - unwrap array types correctly
type DashboardStats = Awaited<ReturnType<AdminService['getDashboardStats']>>;
type RevenueChartResponse = Awaited<ReturnType<AdminService['getRevenueChart']>>;
type CountryResponse = Awaited<ReturnType<AdminService['getStudentsByCountry']>>;
type PackageResponse = Awaited<ReturnType<AdminService['getStudentsByPackage']>>;

@ApiTags('admin-dashboard')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics (admin only)' })
  async getDashboardStats(): Promise<DashboardStats> {
    return this.adminService.getDashboardStats();
  }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Get revenue chart data (admin only)' })
  @ApiQuery({ name: 'months', required: false, type: Number, example: 12 })
  async getRevenueChart(
    @Query('months', new DefaultValuePipe(12), ParseIntPipe) months: number,
  ): Promise<RevenueChartResponse> {
    return this.adminService.getRevenueChart(months);
  }

  @Get('students-by-country')
  @ApiOperation({ summary: 'Get students by country breakdown (admin only)' })
  async getStudentsByCountry(): Promise<CountryResponse> {
    return this.adminService.getStudentsByCountry();
  }

  @Get('students-by-package')
  @ApiOperation({ summary: 'Get students by package type (admin only)' })
  async getStudentsByPackage(): Promise<PackageResponse> {
    return this.adminService.getStudentsByPackage();
  }
}
