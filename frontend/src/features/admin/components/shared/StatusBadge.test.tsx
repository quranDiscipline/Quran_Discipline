import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  describe('Active/Positive statuses', () => {
    it('renders active status correctly', () => {
      render(<StatusBadge status="active" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Active')).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('renders completed status correctly', () => {
      render(<StatusBadge status="completed" />);
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('renders confirmed status correctly', () => {
      render(<StatusBadge status="confirmed" />);
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
    });

    it('renders approved status correctly', () => {
      render(<StatusBadge status="approved" />);
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });
  });

  describe('Pending statuses', () => {
    it('renders pending status correctly', () => {
      render(<StatusBadge status="pending" />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('renders trial status correctly', () => {
      render(<StatusBadge status="trial" />);
      expect(screen.getByText('Trial')).toBeInTheDocument();
    });

    it('renders scheduled status correctly', () => {
      render(<StatusBadge status="scheduled" />);
      expect(screen.getByText('Scheduled')).toBeInTheDocument();
    });
  });

  describe('Inactive/Negative statuses', () => {
    it('renders inactive status correctly', () => {
      render(<StatusBadge status="inactive" />);
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('renders cancelled status correctly', () => {
      render(<StatusBadge status="cancelled" />);
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
      expect(screen.getByText('Cancelled')).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('renders rejected status correctly', () => {
      render(<StatusBadge status="rejected" />);
      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });

    it('renders failed status correctly', () => {
      render(<StatusBadge status="failed" />);
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('renders paused status correctly', () => {
      render(<StatusBadge status="paused" />);
      expect(screen.getByText('Paused')).toBeInTheDocument();
    });
  });

  describe('Unknown status', () => {
    it('renders unknown status with default styling', () => {
      render(<StatusBadge status="unknown_status" />);
      expect(screen.getByText('unknown_status')).toBeInTheDocument();
      expect(screen.getByText('unknown_status')).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('renders empty status gracefully', () => {
      render(<StatusBadge status="" />);
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('renders null status gracefully', () => {
      render(<StatusBadge status={null as any} />);
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<StatusBadge status="active" className="text-xs" />);
      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('text-xs');
    });
  });
});
