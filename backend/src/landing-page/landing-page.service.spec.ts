import { Test, TestingModule } from '@nestjs/testing';
import { LandingPageService } from './landing-page.service';
import { PrismaService } from '../prisma/prisma.service';
import { LandingSection } from '@prisma/client';
import { DEFAULT_CONTENT } from './landing-page.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock PrismaService
const mockPrismaService = {
  landingPageContent: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
  teacher: {
    findMany: jest.fn(),
  },
};

describe('LandingPageService', () => {
  let service: LandingPageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LandingPageService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<LandingPageService>(LandingPageService);

    // Clear mocks and cache before each test
    jest.clearAllMocks();
    (service as any).cache.clear();
  });

  describe('getAllContent', () => {
    const mockTeachers = [
      {
        id: 't1',
        bio: 'Great teacher',
        qualifications: ['Ijazah'],
        specializations: ['Tajweed', 'Memorization'],
        rating: 4.9,
        totalStudents: 50,
        isAvailable: true,
        isFeatured: true,
        featuredOrder: 0,
        user: {
          id: 'u1',
          fullName: 'Teacher One',
          email: 'teacher1@test.com',
          profilePictureUrl: null,
          sex: 'male',
          isActive: true,
        },
      },
    ];

    beforeEach(() => {
      // Default teacher mock for getAllContent tests
      // Mock to return featured teachers on first call, empty on second call
      mockPrismaService.teacher.findMany
        .mockResolvedValueOnce(mockTeachers) // Featured teachers
        .mockResolvedValueOnce([]); // No other teachers needed
    });

    it('returns all section keys with defaults when DB is empty', async () => {
      mockPrismaService.landingPageContent.findMany.mockResolvedValue([]);

      const result = await service.getAllContent();

      // Check that sections with default content are defined
      const sectionsWithDefaults = ['hero', 'trust_bar', 'programs', 'testimonials', 'faq', 'teachers'];
      sectionsWithDefaults.forEach((section: string) => {
        expect(result[section as LandingSection]).toBeDefined();
      });
      expect(mockPrismaService.landingPageContent.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });

    it('DB row overrides default for its section, others remain default', async () => {
      const customHero = {
        headline: 'Custom Headline',
        subheadline: 'Custom Subheadline',
      };

      mockPrismaService.landingPageContent.findMany.mockResolvedValue([
        {
          sectionName: LandingSection.hero,
          contentJson: customHero,
        },
      ]);

      const result = await service.getAllContent();

      expect(result[LandingSection.hero]).toEqual(customHero);
      expect(result[LandingSection.programs]).toEqual(DEFAULT_CONTENT.programs);
      expect(result[LandingSection.testimonials]).toEqual(DEFAULT_CONTENT.testimonials);
    });

    it('includes teachers in the response', async () => {
      mockPrismaService.landingPageContent.findMany.mockResolvedValue([]);

      const result = await service.getAllContent();

      expect(result.teachers).toBeDefined();
      expect(result.teachers.items).toEqual([
        {
          id: 't1',
          fullName: 'Teacher One',
          sex: 'male',
          profilePictureUrl: null,
          bio: 'Great teacher',
          qualifications: ['Ijazah'],
          specializations: ['Tajweed', 'Memorization'],
          rating: 4.9,
          totalStudents: 50,
          isFeatured: true,
          featuredOrder: 0,
        },
      ]);
    });

    it('second call within 5 min uses cache (prisma.findMany called once)', async () => {
      mockPrismaService.landingPageContent.findMany.mockResolvedValue([]);

      // First call
      await service.getAllContent();

      // Second call immediately (should use cache)
      await service.getAllContent();

      // findMany should only be called once (first call)
      expect(mockPrismaService.landingPageContent.findMany).toHaveBeenCalledTimes(1);
    });

    it('cache bypassed after updateSection() invalidates it', async () => {
      mockPrismaService.landingPageContent.findMany.mockResolvedValue([]);
      mockPrismaService.landingPageContent.upsert.mockResolvedValue({
        contentJson: { headline: 'Updated' },
      });

      // First call - populates cache
      await service.getAllContent();

      // Update section - invalidates cache
      await service.updateSection(
        LandingSection.hero,
        { contentJson: { headline: 'Updated' } },
        'admin-1',
      );

      // Reset findMany mock to track calls after update
      mockPrismaService.landingPageContent.findMany.mockClear();

      // Re-set teacher mock for the second getAllContent call
      mockPrismaService.teacher.findMany
        .mockResolvedValueOnce(mockTeachers) // Featured teachers
        .mockResolvedValueOnce([]); // No other teachers needed

      // Second call - should bypass cache and call findMany
      await service.getAllContent();

      expect(mockPrismaService.landingPageContent.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSectionContent', () => {
    it('returns content from DB when section exists', async () => {
      const customContent = { headline: 'Custom' };
      mockPrismaService.landingPageContent.findUnique.mockResolvedValue({
        contentJson: customContent,
      });

      const result = await service.getSectionContent(LandingSection.hero);

      expect(result).toEqual(customContent);
      expect(mockPrismaService.landingPageContent.findUnique).toHaveBeenCalledWith({
        where: { sectionName: LandingSection.hero },
      });
    });

    it('returns DEFAULT_CONTENT when section not in DB', async () => {
      mockPrismaService.landingPageContent.findUnique.mockResolvedValue(null);

      const result = await service.getSectionContent(LandingSection.hero);

      expect(result).toEqual(DEFAULT_CONTENT.hero);
    });
  });

  describe('updateSection', () => {
    const mockTeachers = [
      {
        id: 't1',
        bio: 'Great teacher',
        qualifications: ['Ijazah'],
        specializations: ['Tajweed', 'Memorization'],
        rating: 4.9,
        totalStudents: 50,
        isAvailable: true,
        isFeatured: true,
        featuredOrder: 0,
        user: {
          id: 'u1',
          fullName: 'Teacher One',
          email: 'teacher1@test.com',
          profilePictureUrl: null,
          sex: 'male',
          isActive: true,
        },
      },
    ];

    beforeEach(() => {
      // Mock to return featured teachers on first call, empty on second call
      mockPrismaService.teacher.findMany
        .mockResolvedValueOnce(mockTeachers) // Featured teachers
        .mockResolvedValueOnce([]); // No other teachers needed
    });

    it('calls prisma upsert with correct sectionName, contentJson, updatedById', async () => {
      const contentJson = { headline: 'New Headline' };
      const adminId = 'admin-123';

      mockPrismaService.landingPageContent.upsert.mockResolvedValue({
        contentJson,
      });

      await service.updateSection(LandingSection.hero, { contentJson }, adminId);

      expect(mockPrismaService.landingPageContent.upsert).toHaveBeenCalledWith({
        where: { sectionName: LandingSection.hero },
        create: {
          sectionName: LandingSection.hero,
          contentJson,
          updatedById: adminId,
        },
        update: {
          contentJson,
          updatedById: adminId,
        },
      });
    });

    it('clears memory cache after successful upsert', async () => {
      const contentJson = { headline: 'New Headline' };
      const adminId = 'admin-123';

      mockPrismaService.landingPageContent.findMany.mockResolvedValue([]);
      mockPrismaService.landingPageContent.upsert.mockResolvedValue({
        contentJson,
      });

      // Populate cache
      await service.getAllContent();
      expect((service as any).cache.has('landing_all')).toBe(true);

      // Update section - should clear cache
      await service.updateSection(LandingSection.hero, { contentJson }, adminId);

      expect((service as any).cache.has('landing_all')).toBe(false);
    });
  });

  describe('getPublicTeachers', () => {
    const mockTeachers = [
      {
        id: 't1',
        bio: 'Great teacher',
        qualifications: ['Ijazah'],
        specializations: ['Tajweed', 'Memorization'],
        rating: 4.9,
        totalStudents: 50,
        isAvailable: true,
        user: {
          id: 'u1',
          fullName: 'Teacher One',
          email: 'teacher1@test.com',
          profilePictureUrl: null,
          sex: 'male',
          isActive: true,
        },
      },
      {
        id: 't2',
        bio: 'Another teacher',
        qualifications: ['Al-Azhar'],
        specializations: ['Quran'],
        rating: 4.8,
        totalStudents: 30,
        isAvailable: true,
        user: {
          id: 'u2',
          fullName: 'Teacher Two',
          email: 'teacher2@test.com',
          profilePictureUrl: 'https://example.com/photo.jpg',
          sex: 'female',
          isActive: true,
        },
      },
    ];

    it('calls prisma with take: 6 limit', async () => {
      mockPrismaService.teacher.findMany.mockResolvedValue(mockTeachers);

      await service.getPublicTeachers();

      expect(mockPrismaService.teacher.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 6,
        }),
      );
    });

    it('excludes teachers where user.isActive = false', async () => {
      mockPrismaService.teacher.findMany.mockResolvedValue(mockTeachers);

      await service.getPublicTeachers();

      // First call: Get featured teachers
      expect(mockPrismaService.teacher.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isAvailable: true,
            isFeatured: true,
            user: {
              isActive: true,
            },
          },
        }),
      );
    });

    it('result items never contain passwordHash field', async () => {
      mockPrismaService.teacher.findMany.mockResolvedValue(mockTeachers);

      const result = await service.getPublicTeachers();

      result.forEach((teacher) => {
        expect(teacher).not.toHaveProperty('passwordHash');
        expect(teacher).not.toHaveProperty('resetPasswordToken');
      });
    });

    it('returns teachers sorted by featuredOrder asc, then rating desc', async () => {
      mockPrismaService.teacher.findMany.mockResolvedValue(mockTeachers);

      await service.getPublicTeachers();

      // Featured teachers query orders by featuredOrder first, then rating
      expect(mockPrismaService.teacher.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            { featuredOrder: 'asc' },
            { rating: 'desc' },
          ],
        }),
      );
    });
  });

  describe('getAllForAdmin', () => {
    const mockTeachers = [
      {
        id: 't1',
        bio: 'Great teacher',
        qualifications: ['Ijazah'],
        specializations: ['Tajweed', 'Memorization'],
        rating: 4.9,
        totalStudents: 50,
        isAvailable: true,
        isFeatured: true,
        featuredOrder: 0,
        user: {
          id: 'u1',
          fullName: 'Teacher One',
          email: 'teacher1@test.com',
          profilePictureUrl: null,
          sex: 'male',
          isActive: true,
        },
      },
    ];

    beforeEach(() => {
      // Mock to return featured teachers on first call, empty on second call
      mockPrismaService.teacher.findMany
        .mockResolvedValueOnce(mockTeachers) // Featured teachers
        .mockResolvedValueOnce([]); // No other teachers needed
    });

    it('returns all sections including inactive ones', async () => {
      const mockContent = [
        {
          sectionName: LandingSection.hero,
          contentJson: { headline: 'Custom Hero' },
          isActive: true,
          updatedAt: new Date('2024-01-01'),
          updatedById: 'admin-1',
        },
        {
          sectionName: LandingSection.programs,
          contentJson: { packages: [] },
          isActive: false, // Inactive section
          updatedAt: new Date('2024-01-02'),
          updatedById: 'admin-1',
        },
      ];

      mockPrismaService.landingPageContent.findMany.mockResolvedValue(mockContent);

      const result = await service.getAllForAdmin();

      // Should include both active and inactive sections
      expect(result[LandingSection.hero]).toBeDefined();
      expect(result[LandingSection.hero].isActive).toBe(true);
      expect(result[LandingSection.programs]).toBeDefined();
      expect(result[LandingSection.programs].isActive).toBe(false);

      // Should include metadata
      expect(result[LandingSection.hero].exists).toBe(true);
      expect(result[LandingSection.hero].updatedAt).toEqual(new Date('2024-01-01'));
      expect(result[LandingSection.hero].updatedById).toBe('admin-1');
    });

    it('returns isActive: true for sections not in DB (defaults)', async () => {
      mockPrismaService.landingPageContent.findMany.mockResolvedValue([
        {
          sectionName: LandingSection.hero,
          contentJson: { headline: 'Custom Hero' },
          isActive: true,
          updatedAt: new Date('2024-01-01'),
          updatedById: 'admin-1',
        },
      ]);

      const result = await service.getAllForAdmin();

      // Hero exists in DB
      expect(result[LandingSection.hero].exists).toBe(true);

      // Programs uses default (not in DB)
      expect(result[LandingSection.programs].exists).toBe(false);
      expect(result[LandingSection.programs].isActive).toBe(true);
      expect(result[LandingSection.programs].content).toEqual(DEFAULT_CONTENT.programs);
    });

    it('includes teachers section with dynamic data', async () => {
      mockPrismaService.landingPageContent.findMany.mockResolvedValue([]);

      const result = await service.getAllForAdmin();

      expect(result.teachers).toBeDefined();
      expect(result.teachers.exists).toBe(false); // Dynamic data
      expect(result.teachers.content).toBeDefined();
      expect(result.teachers.content.items).toEqual([
        {
          id: 't1',
          fullName: 'Teacher One',
          sex: 'male',
          profilePictureUrl: null,
          bio: 'Great teacher',
          qualifications: ['Ijazah'],
          specializations: ['Tajweed', 'Memorization'],
          rating: 4.9,
          totalStudents: 50,
          isFeatured: true,
          featuredOrder: 0,
        },
      ]);
    });
  });

  describe('toggleActive', () => {
    const mockTeachers = [
      {
        id: 't1',
        bio: 'Great teacher',
        qualifications: ['Ijazah'],
        specializations: ['Tajweed', 'Memorization'],
        rating: 4.9,
        totalStudents: 50,
        isAvailable: true,
        isFeatured: true,
        featuredOrder: 0,
        user: {
          id: 'u1',
          fullName: 'Teacher One',
          email: 'teacher1@test.com',
          profilePictureUrl: null,
          sex: 'male',
          isActive: true,
        },
      },
    ];

    beforeEach(() => {
      // Mock to return featured teachers on first call, empty on second call
      mockPrismaService.teacher.findMany
        .mockResolvedValueOnce(mockTeachers) // Featured teachers
        .mockResolvedValueOnce([]); // No other teachers needed
    });

    it('toggles active status from true to false', async () => {
      const section = LandingSection.programs;
      mockPrismaService.landingPageContent.findUnique.mockResolvedValue({
        sectionName: section,
        isActive: true,
      });
      mockPrismaService.landingPageContent.update.mockResolvedValue({
        sectionName: section,
        isActive: false,
      });

      const result = await service.toggleActive(section, 'admin-1');

      expect(result.isActive).toBe(false);
      expect(mockPrismaService.landingPageContent.update).toHaveBeenCalledWith({
        where: { sectionName: section },
        data: { isActive: false },
      });
    });

    it('toggles active status from false to true', async () => {
      const section = LandingSection.programs;
      mockPrismaService.landingPageContent.findUnique.mockResolvedValue({
        sectionName: section,
        isActive: false,
      });
      mockPrismaService.landingPageContent.update.mockResolvedValue({
        sectionName: section,
        isActive: true,
      });

      const result = await service.toggleActive(section, 'admin-1');

      expect(result.isActive).toBe(true);
    });

    it('throws BadRequestException when trying to deactivate hero section', async () => {
      await expect(
        service.toggleActive(LandingSection.hero, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.toggleActive(LandingSection.hero, 'admin-1'),
      ).rejects.toThrow('Hero and footer sections cannot be deactivated');
    });

    it('throws BadRequestException when trying to deactivate footer section', async () => {
      await expect(
        service.toggleActive(LandingSection.footer, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.toggleActive(LandingSection.footer, 'admin-1'),
      ).rejects.toThrow('Hero and footer sections cannot be deactivated');
    });

    it('throws NotFoundException when section does not exist in DB', async () => {
      mockPrismaService.landingPageContent.findUnique.mockResolvedValue(null);

      await expect(
        service.toggleActive(LandingSection.programs, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.toggleActive(LandingSection.programs, 'admin-1'),
      ).rejects.toThrow("Section 'programs' not found");
    });

    it('clears cache after toggling', async () => {
      const section = LandingSection.programs;
      mockPrismaService.landingPageContent.findUnique.mockResolvedValue({
        sectionName: section,
        isActive: true,
      });
      mockPrismaService.landingPageContent.findMany.mockResolvedValue([]);
      mockPrismaService.landingPageContent.update.mockResolvedValue({
        sectionName: section,
        isActive: false,
      });

      // Populate cache
      await service.getAllContent();
      expect((service as any).cache.has('landing_all')).toBe(true);

      // Toggle section - should clear cache
      await service.toggleActive(section, 'admin-1');

      expect((service as any).cache.has('landing_all')).toBe(false);
    });
  });
});
