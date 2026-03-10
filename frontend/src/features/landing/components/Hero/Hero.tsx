import { useState, useEffect } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { useCountUp } from '../../hooks/useCountUp';
import { HeroContent } from '../../types/landing.types';
import { cn } from '../../../../lib/utils';

interface HeroProps {
  content: HeroContent;
  className?: string;
}

// Geometric pattern SVG for background overlay
const geometricPattern = `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

export function Hero({ content, className }: HeroProps) {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  // Hide scroll indicator when hero is not in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setShowScrollIndicator(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    const heroElement = document.getElementById('hero');
    if (heroElement) {
      observer.observe(heroElement);
    }

    return () => observer.disconnect();
  }, []);

  // Parse headline to add gold underline to "Consistency"
  const headlineParts = content.headline.split(/(\bConsistency\b)/i);
  const headlineWithHighlight = headlineParts.map((part, index) => {
    if (part.toLowerCase() === 'consistency') {
      return (
        <span key={index} className="gold-underline">
          {part}
        </span>
      );
    }
    return part;
  });

  return (
    <section
      id="hero"
      className={cn(
        'relative min-h-screen flex items-center',
        'bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900',
        'text-center py-20 px-4 overflow-hidden',
        className,
      )}
      style={{
        backgroundImage: `url(${geometricPattern})`,
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      </div>

      {/* Scroll indicator - only shows when hero is in viewport */}
      {showScrollIndicator && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <ChevronDown className="w-6 h-6 text-navy-200" />
        </div>
      )}

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-left max-w-2xl">
            {/* Enrollment Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="text-primary-300 text-sm font-medium">Enrollment Open — Start Today</span>
            </div>

            {/* Eyebrow */}
            <p className="text-gold-400 uppercase tracking-widest text-sm font-semibold mb-4">
              Bismillah — Let's Begin
            </p>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {headlineWithHighlight}
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-navy-100 mb-8 leading-relaxed">
              {content.subheadline}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => (window.location.href = '/book')}
                className="min-h-[52px] px-8 text-lg"
              >
                {content.ctaText}
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const element = document.getElementById('programs');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="min-h-[52px] px-8 text-lg border-navy-300 text-white hover:bg-white hover:text-navy-900"
              >
                View Programs
              </Button>
            </div>

            {/* Social Proof Row */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-gold border-2 border-navy-900 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-navy-200 text-sm">
                  <span className="font-semibold text-white">500+ students</span> trust us
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="grid grid-cols-2 gap-6">
            {content.stats.map((stat, index) => (
              <StatItem
                key={index}
                value={stat.value}
                label={stat.label}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
    </section>
  );
}

interface StatItemProps {
  value: string;
  label: string;
  delay: number;
}

function StatItem({ value, label, delay }: StatItemProps) {
  // Parse stat value to extract numeric part, suffix, and decimal places
  const suffix = value.replace(/[\d.]/g, '');
  const numericStr = value.replace(/[^0-9.]/g, '');
  const numericValue = parseFloat(numericStr);
  const decimals = numericStr.includes('.') ? numericStr.split('.')[1].length : 0;

  const { formattedValue, elementRef } = useCountUp({
    end: numericValue,
    duration: 2000,
    suffix,
    decimals,
  });

  return (
    <div
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        ref={elementRef as React.RefObject<HTMLSpanElement>}
        className="text-3xl md:text-4xl font-bold text-white mb-2 block"
      >
        {formattedValue}
      </span>
      <div className="text-navy-200 text-sm font-medium">
        {label}
      </div>
    </div>
  );
}
