import { useState } from 'react';
import { FAQAccordionItem } from './FAQItem';
import type { FAQContent } from '../../types/landing.types';

interface FAQProps {
  content: FAQContent;
}

// Default questions if none provided
const defaultFAQItems = [
  {
    q: 'How do I get started?',
    a: 'Simply book a free 15-minute assessment call through our booking page. We\'ll assess your level, discuss your goals, and match you with the perfect teacher. No payment or commitment required to start.'
  },
  {
    q: 'What age groups do you teach?',
    a: 'We welcome students of all ages — from children (6+ years) to teens and adults. Our teachers adapt their teaching methods to suit each age group, ensuring an effective and engaging learning experience for everyone.'
  },
  {
    q: 'Do I need any prior knowledge?',
    a: 'Not at all! We accept complete beginners through advanced students. During your assessment call, we\'ll determine your current level and recommend the appropriate starting point.'
  },
  {
    q: 'What technology do I need?',
    a: 'You only need a device with a camera (computer, tablet, or smartphone), a stable internet connection, and Zoom (free). Our team will help you test everything before your first session.'
  },
  {
    q: 'Can I change my teacher?',
    a: 'Yes! If you feel your current teacher isn\'t the right fit, just let us know. We\'ll match you with another teacher who better suits your learning style and preferences at no extra cost.'
  },
  {
    q: 'What if I miss a class?',
    a: 'We offer flexible scheduling. With 24-hour notice, you can reschedule your session at no charge. We also provide session recordings so you never miss important lessons.'
  },
  {
    q: 'Do you offer sibling discounts?',
    a: 'Yes! We offer a 10% discount for families with 2 or more children enrolled. Each sibling gets their own personalized learning plan and teacher.'
  },
  {
    q: 'How long does it take to complete a level?',
    a: 'Progress varies by individual, but most students complete a level in 3-6 months with consistent practice (2-4 sessions per month). Your teacher will provide a personalized timeline based on your goals.'
  }
];

export function FAQ({ content }: FAQProps) {
  const [activeIndex, setActiveIndex] = useState<number>(-1); // All items closed by default

  // Use provided content or default questions
  const items = content?.items?.length ? content.items : defaultFAQItems;

  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-primary font-semibold mb-2">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-lg">
            Find answers to common questions about our programs and how we work.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm">
          {items.map((item, index) => (
            <FAQAccordionItem
              key={index}
              question={item.q}
              answer={item.a}
              isOpen={activeIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
