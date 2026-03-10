import { BookOpen, UserCheck, Video, ShieldCheck, Calendar, Clock, Award, Globe } from 'lucide-react';
import type { HowItWorksContent } from '../../types/landing.types';

interface Step {
  icon: React.ElementType;
  number: number;
  title: string;
  description: string;
}

const DEFAULT_STEPS: Step[] = [
  {
    icon: BookOpen,
    number: 1,
    title: 'Book Free Assessment',
    description: 'Schedule a free 15-minute call with our team to assess your current level and goals.',
  },
  {
    icon: UserCheck,
    number: 2,
    title: 'Get Matched',
    description: 'We pair you with a qualified teacher who specializes in your learning needs and schedule.',
  },
  {
    icon: Video,
    number: 3,
    title: 'Start Learning',
    description: 'Begin your personalized learning journey with live sessions, progress tracking, and accountability.',
  },
];

// Icon mapping for CMS content
const ICON_MAP: Record<string, React.ElementType> = {
  'book-open': BookOpen,
  'user-check': UserCheck,
  'video': Video,
  'shield-check': ShieldCheck,
  'calendar': Calendar,
  'clock': Clock,
  'award': Award,
  'globe': Globe,
};

interface HowItWorksProps {
  content?: HowItWorksContent;
}

export function HowItWorks({ content }: HowItWorksProps) {
  // Use CMS content if available, otherwise use defaults
  const headline = content?.headline || 'How It Works';
  const subheadline = content?.subheadline || 'Start your Quran journey in three simple steps. No commitment required for the initial assessment.';

  const steps: Step[] = content?.steps?.length
    ? content.steps.map((step) => ({
        icon: ICON_MAP[step.icon] || BookOpen,
        number: step.number,
        title: step.title,
        description: step.description,
      }))
    : DEFAULT_STEPS;

  return (
    <section id="how-it-works" className="py-20 bg-navy-900 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Left Column - Header */}
          <div className="lg:col-span-1">
            <p className="text-gold-400 uppercase tracking-widest text-sm font-semibold mb-3">
              Simple Process
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {headline}
            </h2>
            <p className="text-navy-200 text-lg leading-relaxed">
              {subheadline}
            </p>
          </div>

          {/* Right Column - Steps */}
          <div className="lg:col-span-2 grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative"
              >
                {/* Ghost Number */}
                <div className="ghost-number top-0 left-0">
                  {String(step.number).padStart(2, '0')}
                </div>

                {/* Step content */}
                <div className="relative z-10 pt-4">
                  {/* Icon circle */}
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center mb-6">
                    <step.icon className="w-8 h-8 text-gold-400" />
                  </div>

                  {/* Step title */}
                  <h3 className="text-xl font-bold mb-3">
                    {step.title}
                  </h3>

                  {/* Step description */}
                  <p className="text-navy-200 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connector line (desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-px bg-gradient-to-r from-white/20 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
