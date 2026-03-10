// Landing Page Content Types

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaSubtext: string;
  stats: Array<{
    value: string;
    label: string;
  }>;
}

export interface TrustBarContent {
  items: Array<{
    icon: string;
    text: string;
  }>;
}

export interface Package {
  id: string;
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

export interface ProgramsContent {
  packages: Package[];
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

export interface TestimonialItem {
  name: string;
  country: string;
  sex: 'male' | 'female';
  rating: number;
  package: string;
  text: string;
  photoUrl?: string; // Optional photo URL for the testimonial
}

export interface TestimonialsContent {
  items: TestimonialItem[];
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface FAQContent {
  items: FAQItem[];
}

export interface HowItWorksStep {
  icon: string;
  number: number;
  title: string;
  description: string;
}

export interface HowItWorksContent {
  headline: string;
  subheadline: string;
  steps: HowItWorksStep[];
}

export interface ProblemSolutionContent {
  problemHeadline: string;
  problemSubheadline: string;
  problems: string[];
  solutionHeadline: string;
  solutionSubheadline: string;
  solutions: string[];
}

export interface BookingCTAFeature {
  icon: string;
  text: string;
}

export interface BookingCTAContent {
  headline: string;
  subheadline: string;
  rating: string;
  buttonText: string;
  trustText: string;
  features: BookingCTAFeature[];
}

export interface FooterLink {
  name: string;
  href: string;
}

export interface FooterContent {
  brandName: string;
  brandDescription: string;
  tagline: string;
  programLinks: FooterLink[];
  companyLinks: FooterLink[];
  contactEmail: string;
  contactLocation: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
  };
}

export interface TeachersContent {
  headline: string;
  subheadline: string;
  stats: Array<{
    value: string;
    label: string;
  }>;
}

export interface LandingPageContent {
  hero: HeroContent;
  trust_bar: TrustBarContent;
  programs: ProgramsContent;
  testimonials: TestimonialsContent;
  faq: FAQContent;
  teachers: TeachersContent & {
    items: TeacherProfile[];
  };
  how_it_works?: HowItWorksContent;
  problem_solution?: ProblemSolutionContent;
  booking_cta?: BookingCTAContent;
  footer?: FooterContent;
}

export interface TeacherProfile {
  id: string;
  fullName: string;
  sex: 'male' | 'female';
  profilePictureUrl: string | null;
  bio: string | null;
  qualifications: string | null;
  specializations: string | null;
  rating: number;
  totalStudents: number;
}

// Booking Types
export interface AvailableSlot {
  teacherId: string;
  teacherName: string;
  teacherSex: 'male' | 'female';
  teacherProfilePicture: string | null;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  dayOfWeek: string;
}

export type TeacherPreference = 'any' | 'male' | 'female';

export interface BookingFormData {
  fullName: string;
  email: string;
  whatsapp: string;
  sex: 'male' | 'female';
  country: string;
  currentLevel: 'complete_beginner' | 'can_read_arabic' | 'can_recite' | 'advanced';
  preferredPackage: 'not_sure' | 'foundation' | 'mastery' | 'advanced' | 'group';
  message?: string;
}

export interface CreateBookingRequestDto extends BookingFormData {
  teacherId: string;
  preferredDate: string;
  preferredTime: string;
  selectedSlotId?: string;
  timezone: string;
}
