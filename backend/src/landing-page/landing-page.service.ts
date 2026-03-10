import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LandingSection } from '@prisma/client';
import { UpdateSectionDto } from './dto/update-section.dto';

// Default content for each section - returned when DB is empty
export const DEFAULT_CONTENT = {
  hero: {
    headline: "Master the Quran Through Discipline",
    subheadline: "Al-Azhar trained teachers. Proven system. Real accountability.",
    ctaText: "Book Your Free Assessment",
    ctaSubtext: "No credit card required · 15-minute call",
    stats: [
      { value: "500+", label: "Students Taught" },
      { value: "12+", label: "Countries" },
      { value: "4.9", label: "Average Rating" },
      { value: "3+", label: "Years Experience" }
    ]
  },
  trust_bar: {
    items: [
      { icon: "shield-check", text: "Al-Azhar Certified Teachers" },
      { icon: "video", text: "Live 1-on-1 Zoom Sessions" },
      { icon: "book-open", text: "Structured Curriculum" },
      { icon: "users", text: "Small Group Options" }
    ]
  },
  programs: {
    packages: [
      {
        id: "foundation",
        name: "Foundation",
        price: 200,
        sessions: 8,
        duration: "60 min",
        frequency: "2x/week",
        level: "Beginner",
        features: ["Tajweed basics", "Quran reading", "Progress reports", "Recordings"],
        isPopular: false
      },
      {
        id: "mastery",
        name: "Mastery",
        price: 240,
        sessions: 8,
        duration: "60 min",
        frequency: "2x/week",
        level: "Intermediate",
        features: ["Advanced Tajweed", "Memorization track", "Priority scheduling", "Recordings"],
        isPopular: true
      },
      {
        id: "advanced",
        name: "Advanced",
        price: 280,
        sessions: 8,
        duration: "60 min",
        frequency: "2x/week",
        level: "Ijazah Prep",
        features: ["Ijazah preparation", "Sanad chain", "Scholar review", "Certificate"],
        isPopular: false
      },
      {
        id: "group_basic",
        name: "Group Basic",
        price: 100,
        sessions: 8,
        duration: "90 min",
        frequency: "2x/week",
        groupSize: "3-5 students",
        features: ["Peer learning", "Shared progress", "Group accountability"],
        isPopular: false
      },
      {
        id: "group_premium",
        name: "Group Premium",
        price: 150,
        sessions: 12,
        duration: "90 min",
        frequency: "3x/week",
        groupSize: "3-5 students",
        features: ["More sessions", "Faster progress", "Individual + group feedback"],
        isPopular: false
      }
    ],
    addOn: {
      name: "Islamic Studies Add-on",
      price: 50,
      sessions: 4,
      description: "Fiqh, Seerah, Aqeedah — 4 sessions/month"
    },
    discounts: [
      { label: "Family (2 members)", value: "10% off" },
      { label: "Family (3+ members)", value: "15% off" },
      { label: "Quarterly payment", value: "5% off" },
      { label: "Annual payment", value: "10% off" }
    ]
  },
  testimonials: {
    items: [
      {
        name: "Sarah M.",
        country: "USA",
        sex: "female",
        rating: 5,
        package: "Foundation",
        text: "I went from not knowing Arabic letters to reading Quran fluently in 6 months.",
        photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500&auto=format&fit=crop"
      },
      {
        name: "Ahmed K.",
        country: "UK",
        sex: "male",
        rating: 5,
        package: "Mastery",
        text: "The accountability system is what makes this different from everything else.",
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop"
      },
      {
        name: "Fatima R.",
        country: "Canada",
        sex: "female",
        rating: 5,
        package: "Foundation",
        text: "As a revert I was nervous. The teachers are incredibly patient and structured.",
        photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500&auto=format&fit=crop"
      }
    ]
  },
  faq: {
    items: [
      {
        q: "Do I need prior Arabic knowledge?",
        a: "No. Foundation starts from absolute zero."
      },
      {
        q: "How do online sessions work?",
        a: "Live via Zoom. You receive the link before each session."
      },
      {
        q: "Can I choose a male or female teacher?",
        a: "Yes, specify your preference when booking the free assessment."
      },
      {
        q: "What if I miss a session?",
        a: "Flexible rescheduling with 24 hours notice to your teacher."
      },
      {
        q: "Is there a contract?",
        a: "No. Month-to-month. Pause or cancel anytime."
      },
      {
        q: "Family discounts?",
        a: "10% for 2 family members, 15% for 3 or more."
      }
    ]
  },
  teachers: {
    items: [], // Dynamic from API
    // Header text for teachers section
    headline: 'Learn from the Source: Al-Azhar Certified Scholars',
    subheadline: 'All our teachers are graduates of Al-Azhar University in Cairo — the most prestigious Islamic learning institution in the world. Certified scholars trained in the traditional methods, fluent in English, and experienced with Western students.',
    stats: [
      { value: '100%', label: 'Al-Azhar Certified' },
      { value: '5+', label: 'Years Average Experience' },
      { value: '3', label: 'Languages Taught In' }
    ]
  },
  how_it_works: {
    headline: 'How It Works',
    subheadline: 'Start your Quran journey in three simple steps. No commitment required for the initial assessment.',
    steps: [
      {
        icon: 'book-open',
        number: 1,
        title: 'Book Free Assessment',
        description: 'Schedule a free 15-minute call with our team to assess your current level and goals.'
      },
      {
        icon: 'user-check',
        number: 2,
        title: 'Get Matched',
        description: 'We pair you with a qualified teacher who specializes in your learning needs and schedule.'
      },
      {
        icon: 'video',
        number: 3,
        title: 'Start Learning',
        description: 'Begin your personalized learning journey with live sessions, progress tracking, and accountability.'
      }
    ]
  },
  problem_solution: {
    problemHeadline: 'The Struggle Is Real',
    problemSubheadline: 'Sound Familiar?',
    problems: [
      'Started but lost motivation after weeks',
      'Nobody corrects your Tajweed mistakes',
      'Guilty you have not made progress in years',
      'Apps and videos do not stick',
      'Do not know your level or where to start'
    ],
    solutionHeadline: 'Discipline That Works',
    solutionSubheadline: 'The Difference',
    solutions: [
      'Personal teacher — accountability every session',
      'Live Zoom with real-time Tajweed correction',
      'Systematic curriculum — always know your next step',
      'Session recordings to review anytime',
      'Free assessment to find your exact level'
    ]
  },
  booking_cta: {
    headline: 'Ready to Start Your Quran Journey?',
    subheadline: 'Book a free 15-minute assessment call with our team. We\'ll discuss your goals, assess your level, and match you with the perfect teacher.',
    rating: '4.9/5 from 200+ reviews',
    buttonText: 'Book Free Call Now',
    trustText: 'Join 500+ students learning with Quran Discipline Academy',
    features: [
      { icon: 'calendar', text: 'No commitment required' },
      { icon: 'clock', text: 'Only 15 minutes' },
      { icon: 'shield-check', text: '100% free assessment' }
    ]
  },
  footer: {
    brandName: 'Quran Discipline Academy',
    brandDescription: 'Discipline Transforms. Consistency Wins. Master the Quran with qualified teachers and proven methods.',
    tagline: 'Discipline Transforms. Consistency Wins.',
    programLinks: [
      { name: 'Quran Memorization', href: '#programs' },
      { name: 'Tajweed & Recitation', href: '#programs' },
      { name: 'Islamic Studies', href: '#programs' },
      { name: 'Tafsir', href: '#programs' }
    ],
    companyLinks: [
      { name: 'About Us', href: '#about' },
      { name: 'Our Teachers', href: '#teachers' },
      { name: 'FAQ', href: '#faq' },
      { name: 'Contact', href: '#contact' }
    ],
    contactEmail: 'info@qurandiscipline.academy',
    contactLocation: 'Online Worldwide',
    socialLinks: {
      facebook: 'https://www.facebook.com/qurandiscipline.academy',
      instagram: 'https://www.instagram.com/qurandiscipline.academy',
      twitter: 'https://www.twitter.com/qurandiscipline.academy',
      youtube: 'https://www.youtube.com/@qurandiscipline.academy'
    }
  }
};

// Type for cache entries
interface CacheEntry {
  data: Record<string, any>;
  expiresAt: number;
}

@Injectable()
export class LandingPageService {
  private readonly logger = new Logger(LandingPageService.name);

  // Memory cache with 5-minute TTL
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly ALL_CONTENT_CACHE_KEY = 'landing_all';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all landing page sections content
   * Merges DB content with DEFAULT_CONTENT for missing sections
   * Includes dynamic teacher data
   * Uses memory cache with 5-minute TTL
   */
  async getAllContent(): Promise<Record<LandingSection, any>> {
    // Check cache first
    const cached = this.cache.get(this.ALL_CONTENT_CACHE_KEY);
    if (cached && cached.expiresAt > Date.now()) {
      this.logger.debug('Returning cached all content');
      return cached.data as Record<LandingSection, any>;
    }

    // Fetch all active content from DB
    const dbContent = await this.prisma.landingPageContent.findMany({
      where: { isActive: true },
    });

    // Build result: start with defaults, override with DB content
    const result: Record<string, any> = {};

    for (const section of Object.values(LandingSection)) {
      const dbRow = dbContent.find((row) => row.sectionName === section);
      result[section] = dbRow ? dbRow.contentJson : (DEFAULT_CONTENT as any)[section];
    }

    // Always include fresh teacher data (not cached with content, fetched separately)
    result.teachers = { items: await this.getPublicTeachers() };

    // Cache the result
    this.cache.set(this.ALL_CONTENT_CACHE_KEY, {
      data: result,
      expiresAt: Date.now() + this.CACHE_TTL,
    });

    return result as Record<LandingSection, any>;
  }

  /**
   * Get a single section's content
   * Returns DEFAULT_CONTENT if section not in DB
   */
  async getSectionContent(section: LandingSection): Promise<any> {
    const dbRow = await this.prisma.landingPageContent.findUnique({
      where: { sectionName: section },
    });

    return dbRow?.contentJson || (DEFAULT_CONTENT as any)[section];
  }

  /**
   * Update a section's content (admin only)
   * Creates new row or updates existing (upsert)
   */
  async updateSection(
    section: LandingSection,
    dto: UpdateSectionDto,
    adminId: string,
  ): Promise<any> {
    const result = await this.prisma.landingPageContent.upsert({
      where: { sectionName: section },
      create: {
        sectionName: section,
        contentJson: dto.contentJson,
        updatedById: adminId,
      },
      update: {
        contentJson: dto.contentJson,
        updatedById: adminId,
      },
    });

    // Invalidate cache when content is updated
    this.cache.delete(this.ALL_CONTENT_CACHE_KEY);
    this.logger.log(`Section '${section}' updated by admin ${adminId}, cache invalidated`);

    return result.contentJson;
  }

  /**
   * Get public teacher profiles for the landing page
   * Returns featured teachers first (ordered by featuredOrder), then fills remaining slots with top-rated teachers
   * Max 6 teachers total
   * Filters: isAvailable=true, user.isActive=true
   */
  async getPublicTeachers(): Promise<any[]> {
    // Get featured teachers first
    const featuredTeachers = await this.prisma.teacher.findMany({
      where: {
        isFeatured: true,
        isAvailable: true,
        user: {
          isActive: true,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePictureUrl: true,
            sex: true,
          },
        },
      },
      orderBy: [
        { featuredOrder: 'asc' },
        { rating: 'desc' },
      ],
      take: 6,
    });

    // If we have 6 featured teachers, return them
    if (featuredTeachers.length >= 6) {
      return featuredTeachers.map((teacher) => this.transformPublicTeacher(teacher));
    }

    // Otherwise, fill remaining slots with top non-featured teachers
    const remainingSlots = 6 - featuredTeachers.length;
    const featuredIds = featuredTeachers.map((t) => t.id);

    const otherTeachers = await this.prisma.teacher.findMany({
      where: {
        id: { notIn: featuredIds },
        isAvailable: true,
        user: {
          isActive: true,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePictureUrl: true,
            sex: true,
          },
        },
      },
      orderBy: {
        rating: 'desc',
      },
      take: remainingSlots,
    });

    // Combine featured and other teachers
    const allTeachers = [...featuredTeachers, ...otherTeachers];

    return allTeachers.map((teacher) => this.transformPublicTeacher(teacher));
  }

  /**
   * Transform teacher DB model to public profile format
   */
  private transformPublicTeacher(teacher: any): any {
    return {
      id: teacher.id,
      fullName: teacher.user.fullName,
      sex: teacher.user.sex,
      profilePictureUrl: teacher.user.profilePictureUrl,
      bio: teacher.landingBio || teacher.bio, // Use landing-specific bio if available
      qualifications: teacher.qualifications,
      specializations: teacher.specializations,
      rating: teacher.rating,
      totalStudents: teacher.totalStudents,
      isFeatured: teacher.isFeatured,
      featuredOrder: teacher.featuredOrder,
    };
  }

  /**
   * Get all teachers with their featured status (for admin management)
   */
  async getAllTeachersForFeatured(): Promise<any[]> {
    const teachers = await this.prisma.teacher.findMany({
      where: {
        user: {
          isActive: true,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePictureUrl: true,
            sex: true,
            isActive: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { featuredOrder: 'asc' },
        { user: { fullName: 'asc' } },
      ],
    });

    return teachers.map((teacher) => ({
      id: teacher.id,
      fullName: teacher.user.fullName,
      email: teacher.user.email,
      profilePictureUrl: teacher.user.profilePictureUrl,
      sex: teacher.user.sex,
      isActive: teacher.user.isActive,
      bio: teacher.bio,
      landingBio: teacher.landingBio,
      specializations: teacher.specializations,
      rating: teacher.rating,
      isFeatured: teacher.isFeatured,
      featuredOrder: teacher.featuredOrder,
      isAvailable: teacher.isAvailable,
    }));
  }

  /**
   * Update teacher's featured status and order
   */
  async updateTeacherFeatured(
    teacherId: string,
    isFeatured: boolean,
    featuredOrder?: number,
    landingBio?: string,
  ): Promise<any> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const updateData: any = { isFeatured };

    if (isFeatured && featuredOrder !== undefined) {
      updateData.featuredOrder = featuredOrder;
    }

    if (landingBio !== undefined) {
      updateData.landingBio = landingBio;
    }

    const updated = await this.prisma.teacher.update({
      where: { id: teacherId },
      data: updateData,
    });

    // Invalidate cache
    this.cache.delete(this.ALL_CONTENT_CACHE_KEY);
    this.logger.log(`Teacher ${teacherId} featured status updated to ${isFeatured}`);

    return {
      id: updated.id,
      isFeatured: updated.isFeatured,
      featuredOrder: updated.featuredOrder,
      landingBio: updated.landingBio,
    };
  }

  /**
   * Reorder featured teachers
   */
  async reorderFeaturedTeachers(teacherIds: string[]): Promise<void> {
    // Verify all teachers exist and are featured
    const teachers = await this.prisma.teacher.findMany({
      where: { id: { in: teacherIds } },
    });

    if (teachers.length !== teacherIds.length) {
      throw new BadRequestException('One or more teachers not found');
    }

    // Update order for each teacher
    await Promise.all(
      teacherIds.map((id, index) =>
        this.prisma.teacher.update({
          where: { id },
          data: { featuredOrder: index, isFeatured: true },
        }),
      ),
    );

    // Invalidate cache
    this.cache.delete(this.ALL_CONTENT_CACHE_KEY);
    this.logger.log(`Featured teachers reordered`);
  }

  /**
   * Get all landing page content for admin (including inactive sections)
   * Returns all sections with their isActive status
   */
  async getAllForAdmin(): Promise<Record<LandingSection, any>> {
    const allSections = await this.prisma.landingPageContent.findMany({
      orderBy: { sectionName: 'asc' },
    });

    // Build result with isActive status for each section
    const result: Record<string, any> = {};

    for (const section of Object.values(LandingSection)) {
      const dbRow = allSections.find((row) => row.sectionName === section);
      result[section] = {
        content: dbRow ? dbRow.contentJson : (DEFAULT_CONTENT as any)[section],
        isActive: dbRow?.isActive ?? true, // Default to active if not in DB
        exists: !!dbRow,
        updatedAt: dbRow?.updatedAt ?? null,
        updatedById: dbRow?.updatedById ?? null,
      };
    }

    // Always include fresh teacher data (not cached with content, fetched separately)
    result.teachers = {
      content: { items: await this.getPublicTeachers() },
      isActive: true,
      exists: false, // Dynamic data, not stored in DB
      updatedAt: null,
      updatedById: null,
    };

    return result as Record<LandingSection, any>;
  }

  /**
   * Toggle the active status of a landing page section
   * Hero and footer sections cannot be deactivated
   */
  async toggleActive(sectionName: LandingSection, adminId: string): Promise<any> {
    // Prevent deactivating hero or footer sections
    if (sectionName === LandingSection.hero || sectionName === LandingSection.footer) {
      throw new BadRequestException('Hero and footer sections cannot be deactivated');
    }

    // Get current state
    const current = await this.prisma.landingPageContent.findUnique({
      where: { sectionName },
    });

    if (!current) {
      throw new NotFoundException(`Section '${sectionName}' not found. Create it first.`);
    }

    // Toggle isActive status
    const updated = await this.prisma.landingPageContent.update({
      where: { sectionName },
      data: { isActive: !current.isActive },
    });

    // Invalidate cache
    this.cache.delete(this.ALL_CONTENT_CACHE_KEY);
    this.logger.log(`Section '${sectionName}' active status toggled to ${!current.isActive} by admin ${adminId}`);

    return {
      sectionName: updated.sectionName,
      isActive: updated.isActive,
    };
  }
}
