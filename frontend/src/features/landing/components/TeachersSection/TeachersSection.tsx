import { AnimatedTestimonials, type TestimonialItem } from '@/components/ui/animated-testimonials';
import { ShieldCheck, UserCheck, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { api } from '@/lib/axios';
import type { TeachersContent } from '../../types/landing.types';

// ─── Types ───────────────────────────────────────────────────────────────────
interface PublicTeacher {
  id: string;
  fullName: string;
  bio: string;
  qualifications: string;
  specializations: string[];
  profilePictureUrl: string | null;
  sex: 'male' | 'female';
  rating: number;
  totalStudents?: number;
}

const DEFAULT_TEACHERS_CONTENT: TeachersContent = {
  headline: 'Learn from the Source: Al-Azhar Certified Scholars',
  subheadline: 'All our teachers are graduates of Al-Azhar University in Cairo — the most prestigious Islamic learning institution in the world. Certified scholars trained in the traditional methods, fluent in English, and experienced with Western students.',
  stats: [
    { value: '100%', label: 'Al-Azhar Certified' },
    { value: '5+', label: 'Years Average Experience' },
    { value: '3', label: 'Languages Taught In' },
  ],
};

// ─── Fallback teacher data ────────────────────────────────────────────────────
const DEFAULT_TEACHERS: TestimonialItem[] = [
  {
    quote:
      'Al-Azhar University graduate specializing in Tajweed and Quran Memorization. 5+ years teaching English-speaking students with a structured, patient approach.',
    name: 'Abdulrahman Atef',
    designation: 'Tajweed & Hifz Specialist • Al-Azhar Graduate',
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop',
  },
  {
    quote:
      'Certified in Islamic Studies and Tafsir from Al-Azhar. Fluent in English with deep experience teaching new Muslims and complete beginners.',
    name: 'Mohamed Salah',
    designation: 'Islamic Studies & Tafsir • Al-Azhar Graduate',
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500&auto=format&fit=crop',
  },
  {
    quote:
      'Female scholar specializing in Quran recitation and memorization for sisters and children. Creates a comfortable, focused learning environment.',
    name: 'Aisha Hassan',
    designation: 'Female Quran & Tajweed Teacher • Al-Azhar Graduate',
    src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500&auto=format&fit=crop',
  },
];

// ─── Map API teacher to TestimonialItem ──────────────────────────────────────
function mapTeacherToTestimonial(teacher: PublicTeacher): TestimonialItem {
  const specs = teacher.specializations?.slice(0, 2).join(' & ') || 'Quran Teacher';
  return {
    quote: teacher.bio || 'Al-Azhar certified teacher with years of experience.',
    name: teacher.fullName,
    designation: `${specs} • Al-Azhar Graduate`,
    src:
      teacher.profilePictureUrl ||
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=500&auto=format&fit=crop',
  };
}

interface TeachersSectionProps {
  content?: TeachersContent;
}

export function TeachersSection({ content }: TeachersSectionProps) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  // Use CMS content if available, otherwise use defaults
  const headline = content?.headline || DEFAULT_TEACHERS_CONTENT.headline;
  const subheadline = content?.subheadline || DEFAULT_TEACHERS_CONTENT.subheadline;
  const stats = content?.stats?.length ? content.stats : DEFAULT_TEACHERS_CONTENT.stats;

  const { data: teachers, isLoading } = useQuery<PublicTeacher[]>({
    queryKey: ['public-teachers'],
    queryFn: async () => {
      const res = await api.get('/public/landing-content/teachers');
      return res.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });

  const teacherSlides: TestimonialItem[] =
    teachers?.length
      ? teachers.map(mapTeacherToTestimonial)
      : DEFAULT_TEACHERS;

  return (
    <section id="teachers" className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="grid lg:grid-cols-2 gap-16 items-center mb-8"
        >
          {/* Left: copy block */}
          <div>
            <p className="text-secondary font-bold tracking-widest uppercase text-sm mb-3">
              Our Faculty
            </p>
            <h2 className="text-4xl font-bold text-navy mb-6">
              {headline}
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
              {subheadline}
            </p>

            {/* Feature boxes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <ShieldCheck className="text-secondary mb-2 w-5 h-5" />
                <p className="font-bold text-navy text-sm">100% Al-Azhar</p>
                <p className="text-xs text-gray-500">Certified & verified scholars</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <UserCheck className="text-secondary mb-2 w-5 h-5" />
                <p className="font-bold text-navy text-sm">English Fluent</p>
                <p className="text-xs text-gray-500">Clear for Western students</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <Star className="text-secondary mb-2 w-5 h-5" />
                <p className="font-bold text-navy text-sm">4.9 / 5 Rating</p>
                <p className="text-xs text-gray-500">Based on 80+ reviews</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <UserCheck className="text-secondary mb-2 w-5 h-5" />
                <p className="font-bold text-navy text-sm">Gender-Matched</p>
                <p className="text-xs text-gray-500">Male & female scholars</p>
              </div>
            </div>
          </div>

          {/* Right: stat block */}
          <div className="hidden lg:flex flex-col justify-center gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-6 bg-white rounded-2xl px-8 py-5 shadow-sm border border-gray-100"
              >
                <span className="text-4xl font-extrabold text-navy min-w-[80px]">
                  {stat.value}
                </span>
                <span className="text-gray-500 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Teacher Animated Slider */}
        {isLoading ? (
          <div className="h-80 bg-gray-100 rounded-3xl animate-pulse" />
        ) : (
          <AnimatedTestimonials
            testimonials={teacherSlides}
            autoplay={false}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 py-10"
          />
        )}
      </div>
    </section>
  );
}
