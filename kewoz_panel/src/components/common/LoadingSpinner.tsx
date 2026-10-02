import React from 'react';
import { cn } from '../../lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

type LoadingSpinnerProps = {
  size?: SpinnerSize;
  className?: string;
  color?: SpinnerColor;
  label?: string;
};

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
};

const colorClasses = {
  primary: 'border-t-primary-500',
  secondary: 'border-t-secondary-500',
  success: 'border-t-green-500',
  danger: 'border-t-red-500',
  warning: 'border-t-yellow-500',
  info: 'border-t-blue-500',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  color = 'primary',
  label,
}) => (
  <div className={cn('inline-flex items-center gap-2', className)}>
    <div
      className={cn(
        'animate-spin rounded-full border-solid border-transparent',
        sizeClasses[size],
        colorClasses[color]
      )}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
    {label && <span className="text-sm text-gray-600">{label}</span>}
  </div>
);

// Skeleton loader component
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
);

// Full page loading overlay
export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      {message && <p className="mt-4 text-gray-600 dark:text-gray-300">{message}</p>}
    </div>
  </div>
);
