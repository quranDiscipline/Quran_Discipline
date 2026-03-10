import type { TestimonialItem } from '../../types/landing.types';

interface TestimonialCardProps {
  testimonial: TestimonialItem;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const renderStars = () => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`w-5 h-5 ${
              index < testimonial.rating
                ? 'text-secondary-500 fill-current'
                : 'text-gray-300 fill-current'
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 relative hover:shadow-lg transition-shadow">
      {/* Large Quote Mark */}
      <div className="absolute top-6 left-6 text-6xl text-primary-10 font-serif leading-none">
        "
      </div>

      {/* Rating Stars */}
      <div className="flex justify-center mb-4">{renderStars()}</div>

      {/* Testimonial Text */}
      <p className="text-gray-700 text-center leading-relaxed mb-6 italic">
        {testimonial.text}
      </p>

      {/* Divider */}
      <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-secondary-300 to-transparent mx-auto mb-4" />

      {/* Author Info */}
      <div className="text-center">
        <p className="font-bold text-gray-900">{testimonial.name}</p>
        <div className="flex items-center justify-center gap-2 mt-1 text-sm text-gray-500">
          <span>{testimonial.country}</span>
          <span>•</span>
          <span className="bg-secondary-50 text-secondary-700 px-2 py-0.5 rounded text-xs font-medium">
            {testimonial.package}
          </span>
        </div>
      </div>
    </div>
  );
}
