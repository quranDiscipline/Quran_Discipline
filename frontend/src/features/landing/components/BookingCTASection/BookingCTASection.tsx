import { ArrowRight, Calendar, Clock, ShieldCheck, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BookingCTAContent } from '../../types/landing.types';

const DEFAULT_CONTENT: BookingCTAContent = {
  headline: 'Ready to Start Your Quran Journey?',
  subheadline: "Book a free 15-minute assessment call with our team. We'll discuss your goals, assess your level, and match you with the perfect teacher.",
  rating: '4.9/5 from 200+ reviews',
  buttonText: 'Book Free Call Now',
  trustText: 'Join 500+ students learning with Quran Discipline Academy',
  features: [
    { icon: 'calendar', text: 'No commitment required' },
    { icon: 'clock', text: 'Only 15 minutes' },
    { icon: 'shield-check', text: '100% free assessment' },
  ],
};

// Icon mapping for CMS content
const ICON_MAP: Record<string, React.ElementType> = {
  'calendar': Calendar,
  'clock': Clock,
  'shield-check': ShieldCheck,
};

interface BookingCTASectionProps {
  content?: BookingCTAContent;
}

export function BookingCTASection({ content }: BookingCTASectionProps) {
  const navigate = useNavigate();

  const handleBookCall = () => {
    navigate('/booking');
  };

  // Use CMS content if available, otherwise use defaults
  const headline = content?.headline || DEFAULT_CONTENT.headline;
  const subheadline = content?.subheadline || DEFAULT_CONTENT.subheadline;
  const rating = content?.rating || DEFAULT_CONTENT.rating;
  const buttonText = content?.buttonText || DEFAULT_CONTENT.buttonText;
  const trustText = content?.trustText || DEFAULT_CONTENT.trustText;
  const features = content?.features?.length ? content.features : DEFAULT_CONTENT.features;

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl">
            {/* Left Panel - Features */}
            <div className="bg-gradient-to-br from-primary to-primary-800 p-8 md:p-12 text-white">
              {/* Trust Rating */}
              <div className="flex items-center gap-2 mb-8">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <span className="text-primary-100 text-sm">{rating}</span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {headline}
              </h2>

              <p className="text-primary-100 text-lg mb-8 leading-relaxed">
                {subheadline}
              </p>

              {/* Features List */}
              <div className="space-y-4">
                {features.map((feature, index) => {
                  const Icon = ICON_MAP[feature.icon] || Calendar;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-gold-400" />
                      </div>
                      <span className="font-medium">{feature.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Panel - CTA */}
            <div className="bg-white p-8 md:p-12 flex flex-col justify-center">
              {/* Large CTA */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {buttonText}
                </h3>
                <p className="text-gray-600 mb-8">
                  Choose a time that works for you. We'll confirm within 24 hours.
                </p>

                <button
                  onClick={handleBookCall}
                  className="group w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold py-5 px-8 rounded-xl hover:from-gold-600 hover:to-gold-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 mb-6 min-h-[60px] text-lg"
                >
                  Book Free Call Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Trust Text */}
                <p className="text-sm text-gray-500">
                  {trustText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
