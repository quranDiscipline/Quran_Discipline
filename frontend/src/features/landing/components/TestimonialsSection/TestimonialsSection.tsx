import { AnimatedTestimonials, type TestimonialItem } from '@/components/ui/animated-testimonials';
import { useLandingContent } from '../../hooks/useLandingContent';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import type { TestimonialsContent } from '../../types/landing.types';

// ─── Fallback data ───────────────────────────────────────────────────────────
// Real student photos from Unsplash (diverse, appropriate, non-AI)
const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    quote:
      'The structure at Quran Discipline helped me memorize Juz Amma in just 3 months. The teacher was patient and the accountability sessions kept me consistent.',
    name: 'Sarah M.',
    designation: 'Student from Canada 🇨🇦',
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500&auto=format&fit=crop',
  },
  {
    quote:
      'As a new Muslim, I was overwhelmed. My teacher broke everything down at my pace and never made me feel behind. My Tajweed improved dramatically.',
    name: 'James W.',
    designation: 'Student from United Kingdom 🇬🇧',
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop',
  },
  {
    quote:
      'I tried other platforms but the 1-on-1 attention here is unmatched. My teacher tracks every session and the portal shows my real progress week over week.',
    name: 'Omar K.',
    designation: 'Student from USA 🇺🇸',
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500&auto=format&fit=crop',
  },
  {
    quote:
      'Requesting a female teacher was simple, and she was incredibly knowledgeable. My children are also enrolled now — the family discount is a great bonus.',
    name: 'Fatima A.',
    designation: 'Student from Canada 🇨🇦',
    src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=500&auto=format&fit=crop',
  },
  {
    quote:
      'Discipline Transforms. Consistency Wins. — this is not just a motto, it is how the whole program is designed. Three months in and I can feel the difference.',
    name: 'Hassan R.',
    designation: 'Student from USA 🇺🇸',
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=500&auto=format&fit=crop',
  },
];

// Default header content
const DEFAULT_HEADER = {
  subheadline: 'What Students Say',
  headline: 'Real Results. Real Students.',
  description: 'Over 100 students from the USA, UK, and Canada have transformed their Quran journey through structured, consistent learning.',
};

// Function to check if image URL is from a supported domain
// Dropbox, Google Drive, and similar services don't allow direct image embedding
function isSupportedImageUrl(url: string): boolean {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    const supportedDomains = [
      'images.unsplash.com',
      'unsplash.com',
      'cloudinary.com',
      'imgur.com',
      'i.imgur.com',
      'images.pexels.com',
      'pexels.com',
      'cdn.pixabay.com',
      'pixabay.com',
    ];
    return supportedDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

interface TestimonialsSectionProps {
  content?: {
    testimonials?: TestimonialsContent;
    // Optional header content override
    testimonialsHeader?: {
      subheadline?: string;
      headline?: string;
      description?: string;
    };
  };
}

export function TestimonialsSection({ content }: TestimonialsSectionProps) {
  const { data } = useLandingContent();
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  // Use header from props, data, or default
  const header = content?.testimonialsHeader || DEFAULT_HEADER;

  // Merge CMS data over defaults - convert legacy format to new format
  const testimonials: TestimonialItem[] =
    data?.testimonials?.items?.length
      ? data.testimonials.items
          .filter((item: any) => item.name) // Filter out empty items
          .map((item: any) => ({
            quote: item.text || item.quote || '',
            name: item.name,
            designation: item.country ? `Student from ${item.country}` : (item.designation || 'Student'),
            // Only use photoUrl if it's from a supported domain (Unsplash, Cloudinary, Imgur, etc.)
            src:
              item.photoUrl && isSupportedImageUrl(item.photoUrl)
                ? item.photoUrl
                : item.profilePictureUrl && isSupportedImageUrl(item.profilePictureUrl)
                  ? item.profilePictureUrl
                  : item.src && isSupportedImageUrl(item.src)
                    ? item.src
                    : `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop`,
          }))
      : DEFAULT_TESTIMONIALS;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-4"
        >
          <p className="text-secondary font-bold tracking-widest uppercase text-sm mb-3">
            {header.subheadline}
          </p>
          <h2 className="text-4xl font-bold text-navy">
            {header.headline}
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            {header.description}
          </p>
        </motion.div>

        {/* Animated Testimonials — autoplay enabled */}
        <AnimatedTestimonials
          testimonials={testimonials}
          autoplay={true}
          className="py-8"
        />
      </div>
    </section>
  );
}
