import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Package } from '../../types/landing.types';

interface PricingCardProps {
  package: Package;
  onSelect?: (packageId: string) => void;
}

export function PricingCard({ package: pkg, onSelect }: PricingCardProps) {
  const navigate = useNavigate();

  const handleSelect = () => {
    if (onSelect) {
      onSelect(pkg.id);
    } else {
      navigate('/book', { state: { preferredPackage: pkg.name.toLowerCase() } });
    }
  };

  return (
    <div
      className={`relative bg-white rounded-xl border-2 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        pkg.isPopular
          ? 'border-primary shadow-lg scale-105'
          : 'border-gray-200 hover:border-primary'
      }`}
    >
      {/* Popular Badge */}
      {pkg.isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-white text-sm font-semibold px-4 py-1 rounded-full shadow-md">
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
        <p className="text-gray-500 text-sm">{pkg.level}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-gray-900">${pkg.price}</span>
          <span className="text-gray-500">/month</span>
        </div>
        {pkg.groupSize && (
          <p className="text-sm text-gray-500 mt-1">{pkg.groupSize}</p>
        )}
      </div>

      {/* Sessions Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center gap-2 text-gray-700">
          <span className="text-2xl font-bold text-primary">{pkg.sessions}</span>
          <span className="text-sm">sessions/month</span>
        </div>
        <p className="text-xs text-gray-500 text-center mt-1">
          {pkg.frequency} • {pkg.duration}
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {pkg.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={handleSelect}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
          pkg.isPopular
            ? 'bg-primary text-white hover:bg-primary-700 hover:shadow-md'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        Get Started
      </button>
    </div>
  );
}
