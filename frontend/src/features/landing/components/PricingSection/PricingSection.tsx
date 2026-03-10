import { Check } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  isPopular: boolean;
  buttonText: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'group',
    name: 'Group Classes',
    price: 100,
    period: 'per month',
    description: 'Learn in small groups of 3-5 students. Perfect for those who enjoy collaborative learning.',
    features: [
      '4 sessions per month',
      'Small groups (3-5 students)',
      '60-minute sessions',
      'Certified teachers',
      'Progress tracking',
      'Class recordings'
    ],
    isPopular: false,
    buttonText: 'Start Group Classes'
  },
  {
    id: 'private',
    name: 'Private 1-on-1',
    price: 200,
    period: 'per month',
    description: 'Personalized attention with dedicated teacher. Fastest progress and fully customized curriculum.',
    features: [
      '8 sessions per month',
      'Individual attention',
      '30-minute sessions',
      'Certified teachers',
      'Progress tracking',
      'Class recordings',
      'Homework & assignments',
      'Flexible scheduling'
    ],
    isPopular: true,
    buttonText: 'Start Private Classes'
  }
];

export function PricingSection() {
  const navigate = useNavigate();

  const handlePlanClick = (planId: string) => {
    navigate('/book', { state: { preferredPackage: planId } });
  };

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-primary font-semibold mb-2">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 text-lg">
            Choose the plan that fits your learning style. Pause or cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative bg-white rounded-2xl p-8 transition-all duration-300 hover:shadow-xl',
                plan.isPopular
                  ? 'border-2 border-gold-500 shadow-lg scale-105'
                  : 'border-2 border-gray-200 hover:border-primary'
              )}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-gold-500 to-gold-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-md">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handlePlanClick(plan.id)}
                className={cn(
                  'w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 min-h-[52px]',
                  plan.isPopular
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700'
                    : 'bg-primary text-white hover:bg-primary-700'
                )}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Discount Notice */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
            <p className="text-gray-600 mb-2">
              <span className="font-semibold text-gray-900">Family discount:</span> 10% off for 2+ siblings
            </p>
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">Annual discount:</span> 2 months free when you pay yearly
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
