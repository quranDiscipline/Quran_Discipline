import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export type TestimonialItem = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

interface AnimatedTestimonialsProps {
  testimonials: TestimonialItem[];
  autoplay?: boolean;
  className?: string;
}

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
  className,
}: AnimatedTestimonialsProps) => {
  // Early return for empty/undefined testimonials
  if (!testimonials || !testimonials.length) return null;

  const [active, setActive] = useState(0);

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = useCallback(() => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const isActive = (index: number) => index === active;

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, handleNext]);

  const randomRotateY = () => Math.floor(Math.random() * 21) - 10;

  return (
    <div
      className={cn(
        'max-w-sm md:max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-20',
        className,
      )}
    >
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-20">
        {/* Image Stack */}
        <div>
          <div className="relative h-80 w-full">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index)
                      ? 999
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    rotate: randomRotateY(),
                  }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="absolute inset-0 origin-bottom"
                >
                  <img
                    src={testimonial.src}
                    alt={testimonial.name}
                    draggable={false}
                    className="h-full w-full rounded-3xl object-cover object-center select-none"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex justify-between flex-col py-4">
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <h3 className="text-2xl font-bold text-gray-900">
              {testimonials[active].name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {testimonials[active].designation}
            </p>
            <motion.p className="text-lg text-gray-600 mt-8 leading-relaxed">
              {testimonials[active].quote.split(' ').map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ filter: 'blur(10px)', opacity: 0, y: 5 }}
                  animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    ease: 'easeInOut',
                    delay: 0.02 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>

          {/* Navigation */}
          <div className="flex gap-4 pt-12 md:pt-0">
            <button
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="h-9 w-9 rounded-full bg-gray-100 hover:bg-secondary/20 flex items-center justify-center transition-colors group"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700 group-hover:text-secondary transition-colors" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next testimonial"
              className="h-9 w-9 rounded-full bg-gray-100 hover:bg-secondary/20 flex items-center justify-center transition-colors group"
            >
              <ChevronRight className="h-5 w-5 text-gray-700 group-hover:text-secondary transition-colors" />
            </button>
          </div>

          {/* Dot Indicators */}
          <div className="flex gap-2 mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActive(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  isActive(index)
                    ? 'w-6 bg-secondary'
                    : 'w-1.5 bg-gray-300 hover:bg-gray-400',
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
