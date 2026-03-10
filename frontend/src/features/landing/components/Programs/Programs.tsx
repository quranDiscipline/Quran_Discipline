import { useState } from 'react';
import { PricingCard } from './PricingCard';
import type { ProgramsContent } from '../../types/landing.types';

interface ProgramsProps {
  content: ProgramsContent;
}

export function Programs({ content }: ProgramsProps) {
  const [isOneOnOne, setIsOneOnOne] = useState(true);

  // Filter packages based on selected type
  const packages = (content.packages || []).filter((pkg) => {
    if (isOneOnOne) {
      // Show foundation, mastery, advanced (1-on-1 packages)
      return ['foundation', 'mastery', 'advanced'].includes(pkg.id);
    } else {
      // Show group packages
      return pkg.id.startsWith('group_');
    }
  });

  return (
    <section id="programs" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-primary font-semibold mb-2">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Learning Path
          </h2>
          <p className="text-gray-600 text-lg">
            Flexible plans designed for every level and budget. Pause or cancel anytime.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={`text-sm font-medium transition-colors ${
              isOneOnOne ? 'text-gray-900' : 'text-gray-500'
            }`}
          >
            1-on-1 Sessions
          </span>
          <button
            onClick={() => setIsOneOnOne(!isOneOnOne)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
              isOneOnOne ? 'bg-primary' : 'bg-gray-300'
            }`}
            aria-pressed={isOneOnOne}
            aria-label="Toggle between 1-on-1 and group sessions"
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                isOneOnOne ? 'left-8' : 'left-1'
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium transition-colors ${
              !isOneOnOne ? 'text-gray-900' : 'text-gray-500'
            }`}
          >
            Group Sessions
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {packages.map((pkg) => pkg && (
            <PricingCard key={pkg.id} package={pkg} />
          ))}
        </div>

        {/* Add-on Banner */}
        {content.addOn && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-xl p-6 border border-secondary-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {content.addOn.name}
                  </h3>
                  <p className="text-gray-600">{content.addOn.description}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary-700">
                    +${content.addOn.price}
                  </div>
                  <p className="text-sm text-gray-600">{content.addOn.sessions} sessions/month</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Discounts Grid */}
        {content.discounts && content.discounts.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-sm text-gray-600 mb-4">Available Discounts</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {content.discounts.map((discount, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200"
              >
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {discount.label}
                </p>
                <p className="text-lg font-bold text-primary">{discount.value}</p>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
