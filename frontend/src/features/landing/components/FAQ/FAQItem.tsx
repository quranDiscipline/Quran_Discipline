import { ChevronDown } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface FAQAccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function FAQAccordionItem({ question, answer, isOpen, onToggle }: FAQAccordionItemProps) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-5 px-2 flex items-center justify-between text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-gray-900 pr-8 group-hover:text-primary transition-colors">
          {question}
        </span>
        <span
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300',
            isOpen && 'bg-primary text-white rotate-180'
          )}
        >
          <ChevronDown className="w-5 h-5" />
        </span>
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'
        )}
      >
        <p className="text-gray-600 leading-relaxed px-2">
          {answer}
        </p>
      </div>
    </div>
  );
}
