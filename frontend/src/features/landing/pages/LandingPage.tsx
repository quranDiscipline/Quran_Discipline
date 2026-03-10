import { Helmet } from 'react-helmet-async';
import { Spinner } from '../../../components/ui/Spinner';
import { useLandingContent } from '../hooks/useLandingContent';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { ProgramsSection } from '../components/ProgramsSection';
import { TeachersSection } from '../components/TeachersSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { FAQ } from '../components/FAQ';
import { Footer } from '../components/Footer';
import { TrustBar } from '../components/TrustBar';
import { ProblemSolution } from '../components/ProblemSolution';
import { HowItWorks } from '../components/HowItWorks';
import { BookingCTASection } from '../components/BookingCTASection';
import { Programs } from '../components/Programs';

const SITE_URL = 'https://qurandiscipline.academy';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Quran Discipline Academy',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    'Online Quran academy with certified Al-Azhar teachers offering live 1-on-1 Zoom sessions for Tajweed, Memorization, and Islamic Studies.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-xxx-xxx-xxxx',
    contactType: 'customer service',
    availableLanguage: ['English', 'Arabic'],
  },
  sameAs: [
    'https://www.facebook.com/qurandiscipline.academy',
    'https://www.instagram.com/qurandiscipline.academy',
    'https://www.youtube.com/@qurandiscipline.academy',
  ],
  educationalLevel: 'All Levels',
  teaches: ['Quran Recitation', 'Tajweed', 'Quran Memorization', 'Islamic Studies'],
  audience: {
    '@type': 'Audience',
    audienceType: ['Kids', 'Teens', 'Adults'],
  },
};

export function LandingPage() {
  const { data: content, isLoading, error } = useLandingContent();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load</h1>
          <p className="text-gray-600">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>
          Quran Discipline Academy | Learn Quran Online with Al-Azhar Teachers
        </title>
        <meta
          name="title"
          content="Quran Discipline Academy | Learn Quran Online with Al-Azhar Teachers"
        />
        <meta
          name="description"
          content="Certified Al-Azhar teachers. Live 1-on-1 Zoom sessions. Tajweed, Memorization, Islamic Studies. USA, UK, Canada & worldwide."
        />
        <link rel="canonical" href={SITE_URL} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta
          property="og:title"
          content="Quran Discipline Academy | Learn Quran Online with Al-Azhar Teachers"
        />
        <meta
          property="og:description"
          content="Certified Al-Azhar teachers. Live 1-on-1 Zoom sessions. Tajweed, Memorization, Islamic Studies. USA, UK, Canada & worldwide."
        />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:site_name" content="Quran Discipline Academy" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={SITE_URL} />
        <meta
          name="twitter:title"
          content="Quran Discipline Academy | Learn Quran Online with Al-Azhar Teachers"
        />
        <meta
          name="twitter:description"
          content="Certified Al-Azhar teachers. Live 1-on-1 Zoom sessions. Tajweed, Memorization, Islamic Studies. USA, UK, Canada & worldwide."
        />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />

        {/* Additional SEO Meta Tags */}
        <meta name="keywords" content="Quran online, Tajweed, Quran memorization, Islamic studies, Al-Azhar teachers, online Quran academy, learn Quran from home" />
        <meta name="author" content="Quran Discipline Academy" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen">
        <Navbar />

        <Hero content={content.hero} />

        {/* Trust Indicators */}
        <TrustBar content={content.trust_bar} />

        {/* Problem/Solution */}
        <ProblemSolution content={content.problem_solution} />

        {/* How It Works */}
        <HowItWorks content={content.how_it_works} />

        {/* Academic Programs (Hifz, Tajweed, Islamic Studies, Tafsir) */}
        <ProgramsSection />

        {/* Pricing Packages (Foundation, Mastery, Advanced, Group) */}
        {content.programs && <Programs content={content.programs} />}

        {/* Teachers */}
        <TeachersSection content={content.teachers} />

        {/* Testimonials */}
        <TestimonialsSection content={{ testimonials: content.testimonials }} />

        {/* CTA/Booking */}
        <BookingCTASection content={content.booking_cta} />

        {/* FAQ */}
        <FAQ content={content.faq} />

        {/* Footer */}
        <Footer content={content.footer} />
      </div>
    </>
  );
}
