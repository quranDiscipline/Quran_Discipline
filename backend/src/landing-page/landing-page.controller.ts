import { Controller, Get, Patch, Param, UseGuards, Body, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LandingPageService } from './landing-page.service';
import { LandingSection } from '@prisma/client';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('landing-page')
@Controller('public/landing-content')
export class LandingPageController {
  constructor(private readonly landingPageService: LandingPageService) {}

  /**
   * PUBLIC ENDPOINTS
   */

  @ApiOperation({ summary: 'Get all landing page content' })
  @Get()
  async getAllContent() {
    return await this.landingPageService.getAllContent();
  }

  @ApiOperation({ summary: 'Get public teacher profiles for landing page' })
  @Get('teachers')
  async getPublicTeachers() {
    return await this.landingPageService.getPublicTeachers();
  }

  @ApiOperation({ summary: 'Get a specific section content' })
  @Get(':section')
  async getSectionContent(@Param('section') section: LandingSection) {
    return await this.landingPageService.getSectionContent(section);
  }
}

@ApiTags('admin-landing-page')
@Controller('admin/landing-page')
export class AdminLandingPageController {
  constructor(private readonly landingPageService: LandingPageService) {}

  /**
   * ADMIN ENDPOINTS
   */

  @ApiOperation({ summary: 'Get all landing page content for admin (including inactive)' })
  @ApiBearerAuth()
  @Get('content')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllContent() {
    return await this.landingPageService.getAllForAdmin();
  }

  @ApiOperation({ summary: 'Get a specific section content (admin only)' })
  @ApiBearerAuth()
  @Get('content/:section')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getSectionContent(@Param('section') section: LandingSection) {
    return await this.landingPageService.getSectionContent(section);
  }

  @ApiOperation({ summary: 'Update a landing page section (admin only)' })
  @ApiBearerAuth()
  @Patch('content/:section')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateSection(
    @Param('section') section: LandingSection,
    @CurrentUser() user: any,
    @Body() dto: UpdateSectionDto,
  ) {
    return await this.landingPageService.updateSection(section, dto, user.id);
  }

  @ApiOperation({ summary: 'Toggle section active status (admin only)' })
  @ApiBearerAuth()
  @Patch('content/:sectionName/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async toggleActive(
    @Param('sectionName') sectionName: LandingSection,
    @CurrentUser() user: any,
  ) {
    return await this.landingPageService.toggleActive(sectionName, user.id);
  }

  /**
   * TEACHER FEATURE MANAGEMENT
   */

  @ApiOperation({ summary: 'Get all teachers with featured status (admin only)' })
  @ApiBearerAuth()
  @Get('teachers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllTeachersForFeatured() {
    return await this.landingPageService.getAllTeachersForFeatured();
  }

  @ApiOperation({ summary: 'Update teacher featured status (admin only)' })
  @ApiBearerAuth()
  @Patch('teachers/:teacherId/featured')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateTeacherFeatured(
    @Param('teacherId') teacherId: string,
    @Body() body: { isFeatured: boolean; featuredOrder?: number; landingBio?: string },
  ) {
    return await this.landingPageService.updateTeacherFeatured(
      teacherId,
      body.isFeatured,
      body.featuredOrder,
      body.landingBio,
    );
  }

  @ApiOperation({ summary: 'Reorder featured teachers (admin only)' })
  @ApiBearerAuth()
  @Put('teachers/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async reorderFeaturedTeachers(@Body() body: { teacherIds: string[] }) {
    await this.landingPageService.reorderFeaturedTeachers(body.teacherIds);
    return { success: true };
  }
}
