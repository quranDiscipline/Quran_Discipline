import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    leftIcon?: ReactNode; // Changed from 'icon' to 'leftIcon' to match Button component
  };
}

export const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} className="shrink-0" leftIcon={action.leftIcon}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
