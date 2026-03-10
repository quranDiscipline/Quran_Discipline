import { Award, Globe, Users, GraduationCap, ShieldCheck, Video, BookOpen, Users as UsersIcon } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { useEffect, useRef } from 'react';
import type { TrustBarContent } from '../../types/landing.types';

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
}

const DEFAULT_STATS: StatItem[] = [
  { icon: GraduationCap, value: 15, suffix: '+', label: 'Certified Teachers' },
  { icon: Users, value: 500, suffix: '+', label: 'Students Worldwide' },
  { icon: Globe, value: 25, suffix: '+', label: 'Countries Served' },
  { icon: Award, value: 4.9, suffix: '', label: 'Average Rating' },
];

// Icon mapping for CMS content
const ICON_MAP: Record<string, React.ElementType> = {
  'shield-check': ShieldCheck,
  'video': Video,
  'book-open': BookOpen,
  'users': UsersIcon,
  'award': Award,
  'globe': Globe,
  'graduation-cap': GraduationCap,
};

interface TrustBarProps {
  content?: TrustBarContent;
}

export function TrustBar({ content }: TrustBarProps) {
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          // Trigger animation by re-rendering
        }
      },
      { threshold: 0.5 },
    );

    const element = document.getElementById('trust-bar');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  // Use CMS content if available and has items, otherwise use default stats
  const useCmsItems = content?.items && content.items.length > 0;

  return (
    <div id="trust-bar" className="bg-white border-b border-gray-100 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {useCmsItems
            ? content.items.map((item, index) => (
                <TrustBarItem key={index} item={item} />
              ))
            : DEFAULT_STATS.map((stat, index) => (
                <StatItem key={index} {...stat} />
              ))}
        </div>
      </div>
    </div>
  );
}

interface StatItemProps extends StatItem {}

function StatItem({ icon: Icon, value, suffix, label }: StatItemProps) {
  const decimals = Number.isInteger(value) ? 0 : 1;
  const { formattedValue, elementRef } = useCountUp({
    end: value,
    duration: 2000,
    suffix,
    decimals,
  });

  return (
    <div className="relative flex items-center justify-center gap-3">
      {/* Divider (not for first item) */}
      <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-px h-10 bg-gray-200" />

      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 text-primary flex-shrink-0" />
        <div>
          <div className="flex items-baseline gap-0.5">
            <span
              ref={elementRef as React.RefObject<HTMLSpanElement>}
              className="text-2xl font-bold text-gray-900"
            >
              {formattedValue}
            </span>
          </div>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

interface TrustBarItemProps {
  item: {
    icon: string;
    text: string;
  };
}

function TrustBarItem({ item }: TrustBarItemProps) {
  const Icon = ICON_MAP[item.icon] || ShieldCheck;

  return (
    <div className="relative flex items-center justify-center gap-3">
      {/* Divider (not for first item) */}
      <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-px h-10 bg-gray-200" />

      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 text-primary flex-shrink-0" />
        <p className="text-sm text-gray-700 font-medium">{item.text}</p>
      </div>
    </div>
  );
}
