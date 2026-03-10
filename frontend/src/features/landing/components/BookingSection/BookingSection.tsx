import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BookingSection() {
  const navigate = useNavigate();

  const handleBookCall = () => {
    navigate('/book');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-secondary-600 to-secondary-700">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Quran Journey?
          </h2>

          {/* Subtext */}
          <p className="text-xl text-secondary-100 mb-8 max-w-2xl mx-auto">
            Book a free 15-minute assessment call with our team. We'll discuss your goals,
            assess your level, and match you with the perfect teacher.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-white">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-secondary-200" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-secondary-100">No commitment required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-secondary-200" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-secondary-100">100% free assessment</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-secondary-200" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-secondary-100">Personalized learning plan</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleBookCall}
            className="group inline-flex items-center gap-2 bg-white text-secondary-700 font-semibold px-8 py-4 rounded-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            Book Your Free Call
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Trust Text */}
          <p className="mt-6 text-sm text-secondary-200">
            Join 500+ students already learning with Quran Discipline Academy
          </p>
        </div>
      </div>
    </section>
  );
}
