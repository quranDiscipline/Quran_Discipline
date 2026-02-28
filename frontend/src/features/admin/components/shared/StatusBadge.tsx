import { Badge } from '@/components/ui/Badge';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

type StatusConfig = {
  label: string;
  className: string;
  icon: LucideIcon;
};

const statusConfigs: Record<string, StatusConfig> = {
  // Active/Positive statuses
  active: { label: 'Active', className: 'bg-green-100 text-green-800', icon: CheckCircle },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800', icon: CheckCircle },
  confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-800', icon: CheckCircle },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-800', icon: CheckCircle },
  verified: { label: 'Verified', className: 'bg-green-100 text-green-800', icon: CheckCircle },
  paid: { label: 'Paid', className: 'bg-green-100 text-green-800', icon: CheckCircle },
  success: { label: 'Success', className: 'bg-green-100 text-green-800', icon: CheckCircle },

  // Pending statuses
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
  trial: { label: 'Trial', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
  scheduled: { label: 'Scheduled', className: 'bg-yellow-100 text-yellow-800', icon: Clock },

  // Inactive/Negative statuses
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800', icon: XCircle },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800', icon: XCircle },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800', icon: XCircle },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-800', icon: XCircle },
  paused: { label: 'Paused', className: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  missed: { label: 'Missed', className: 'bg-red-100 text-red-800', icon: XCircle },
  refunded: { label: 'Refunded', className: 'bg-red-100 text-red-800', icon: XCircle },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  const config = statusConfigs[status?.toLowerCase()] || {
    label: status || 'Unknown',
    className: 'bg-gray-100 text-gray-800',
    icon: AlertCircle,
  };

  const Icon = config.icon;

  return (
    <Badge className={`${config.className} ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};
