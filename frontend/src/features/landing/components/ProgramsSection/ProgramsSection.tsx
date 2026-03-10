import { BookOpen, Globe, Scroll, Star } from 'lucide-react';

interface Program {
  id: string;
  title: string;
  titleArabic: string;
  description: string;
  icon: React.ElementType;
  features: string[];
}

const programs: Program[] = [
  {
    id: 'hifz',
    title: 'Quran Memorization',
    titleArabic: 'حفظ القرآن',
    description: 'Memorize the Holy Quran with certified teachers using proven techniques that build retention and consistency.',
    icon: Star,
    features: [
      'Personalized memorization plan',
      'Revision sessions built-in',
      'Track progress page by page',
      'Certificate upon completion'
    ]
  },
  {
    id: 'tajweed',
    title: 'Tajweed & Recitation',
    titleArabic: 'تجويد القرآن',
    description: 'Learn proper Quranic pronunciation and recitation rules with Al-Azhar trained teachers.',
    icon: Scroll,
    features: [
      'Master Arabic pronunciation',
      'Learn all tajweed rules',
      'Practice with feedback',
      'Recite beautifully & confidently'
    ]
  },
  {
    id: 'islamic-studies',
    title: 'Islamic Studies',
    titleArabic: 'الدراسات الإسلامية',
    description: 'Comprehensive Islamic education including Fiqh, Hadith, Seerah, and Islamic history for all ages.',
    icon: BookOpen,
    features: [
      'Fiqh (Islamic jurisprudence)',
      'Hadith studies',
      'Seerah of Prophet ﷺ',
      'Islamic history & civilization'
    ]
  },
  {
    id: 'tafsir',
    title: 'Tafsir (Quran Understanding)',
    titleArabic: 'تفسير القرآن',
    description: 'Deepen your understanding of the Quran\'s meaning, context, and wisdom through classical tafsir.',
    icon: Globe,
    features: [
      'Word-by-word analysis',
      'Historical context',
      'Lessons & applications',
      'Classical tafsir sources'
    ]
  }
];

export function ProgramsSection() {
  return (
    <section id="programs" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-primary font-semibold mb-2">Our Programs</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Quranic Education
          </h2>
          <p className="text-gray-600 text-lg">
            Choose from our range of programs designed to help you master the Quran and Islamic knowledge.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {programs.map((program) => {
            const Icon = program.icon;
            return (
              <div
                key={program.id}
                className="group bg-white rounded-xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {program.title}
                </h3>
                <p className="font-arabic text-secondary-600 text-lg mb-3" dir="rtl">
                  {program.titleArabic}
                </p>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {program.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {program.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600 text-xs">{feature}</span>
                    </li>
                  ))}
                  {program.features.length > 3 && (
                    <li className="text-primary text-xs font-medium">+{program.features.length - 3} more</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
