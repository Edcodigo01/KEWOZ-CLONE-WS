import * as React from 'react';
import { cn } from '../../lib/utils';

type SpinnerProps = {
  /**
   * Size of the spinner
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Color variant of the spinner
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'success' | 'destructive' | 'muted';
  
  /**
   * Additional class name for custom styling
   */
  className?: string;
  
  /**
   * Label for accessibility
   */
  label?: string;
};

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const variantClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary-foreground',
  success: 'text-success',
  destructive: 'text-destructive',
  muted: 'text-muted-foreground',
};

/**
 * A customizable loading spinner component.
 */
const Spinner = ({
  size = 'md',
  variant = 'primary',
  className,
  label = 'Loading...',
  ...props
}: SpinnerProps) => {
  return (
    <div 
      className={cn('inline-flex items-center justify-center', className)}
      role="status"
      aria-label={label}
      {...props}
    >
      <svg
        className={cn(
          'animate-spin',
          sizeClasses[size],
          variantClasses[variant]
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
};

export { Spinner };
