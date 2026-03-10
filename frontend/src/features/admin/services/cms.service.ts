import { api } from '@/lib/axios';

export interface HeroUpdateDto {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaSubtext: string;
  stats: Array<{ value: string; label: string }>;
}

export interface TrustBarUpdateDto {
  items: Array<{ icon: string; text: string }>;
}

export interface PackageUpdateDto {
  name: string;
  price: number;
  sessions: number;
  duration: string;
  frequency: string;
  level: string;
  features: string[];
  isPopular: boolean;
  groupSize?: string;
}

export interface ProgramsUpdateDto {
  packages: PackageUpdateDto[];
  addOn: {
    name: string;
    price: number;
    sessions: number;
    description: string;
  };
  discounts: Array<{
    label: string;
    value: string;
  }>;
}

export interface TestimonialUpdateDto {
  name: string;
  country: string;
  sex: 'male' | 'female';
  rating: number;
  package: string;
  text: string;
  photoUrl?: string;
}

export interface TestimonialsUpdateDto {
  items: TestimonialUpdateDto[];
}

export interface FAQItemUpdateDto {
  q: string;
  a: string;
}

export interface FAQUpdateDto {
  items: FAQItemUpdateDto[];
}

export interface FeaturedTeacher {
  id: string;
  fullName: string;
  email: string;
  profilePictureUrl: string | null;
  sex: 'male' | 'female';
  isActive: boolean;
  bio: string | null;
  landingBio: string | null;
  specializations: string[];
  rating: number;
  totalStudents: number;
  isFeatured: boolean;
  featuredOrder: number | null;
  isAvailable: boolean;
}

export const cmsService = {
  async updateHero(data: HeroUpdateDto): Promise<void> {
    await api.patch('/admin/landing-page/content/hero', { contentJson: data });
  },

  async updateTrustBar(data: TrustBarUpdateDto): Promise<void> {
    await api.patch('/admin/landing-page/content/trust_bar', { contentJson: data });
  },

  async updatePrograms(data: ProgramsUpdateDto): Promise<void> {
    await api.patch('/admin/landing-page/content/programs', { contentJson: data });
  },

  async updateTestimonials(data: TestimonialsUpdateDto): Promise<void> {
    await api.patch('/admin/landing-page/content/testimonials', { contentJson: data });
  },

  async updateFAQ(data: FAQUpdateDto): Promise<void> {
    await api.patch('/admin/landing-page/content/faq', { contentJson: data });
  },

  // Featured Teachers Management
  async getAllTeachersForFeatured(): Promise<FeaturedTeacher[]> {
    const response = await api.get('/admin/landing-page/teachers');
    return response.data;
  },

  async updateTeacherFeatured(
    teacherId: string,
    data: { isFeatured: boolean; featuredOrder?: number; landingBio?: string },
  ): Promise<void> {
    await api.patch(`/admin/landing-page/teachers/${teacherId}/featured`, data);
  },

  async reorderFeaturedTeachers(teacherIds: string[]): Promise<void> {
    await api.put('/admin/landing-page/teachers/reorder', { teacherIds });
  },

  // Generic section update for new sections
  async updateSection(section: string, data: any): Promise<void> {
    await api.patch(`/admin/landing-page/content/${section}`, { contentJson: data });
  },
};
