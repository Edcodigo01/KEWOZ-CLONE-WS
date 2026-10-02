import React from 'react';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

type ErrorSeverity = 'error' | 'warning' | 'info' | 'success';

type ErrorMessageProps = {
  /** Error message to display */
  message: React.ReactNode;
  
  /** Optional title */
  title?: string;
  
  /** Visual severity */
  severity?: ErrorSeverity;
  
  /** Show icon */
  showIcon?: boolean;
  
  /** Allow dismissing */
  dismissible?: boolean;
  
  /** Dismiss callback */
  onDismiss?: () => void;
  
  /** Additional class */
  className?: string;
  
  /** Action buttons */
  actions?: React.ReactNode;
};

const iconMap = {
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

const containerClasses: Record<ErrorSeverity, string> = {
  error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/30',
  warning: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30',
  info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30',
  success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/30',
};

const textClasses: Record<ErrorSeverity, string> = {
  error: 'text-red-800 dark:text-red-200',
  warning: 'text-amber-800 dark:text-amber-200',
  info: 'text-blue-800 dark:text-blue-200',
  success: 'text-green-800 dark:text-green-200',
};

const iconColorClasses: Record<ErrorSeverity, string> = {
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
  success: 'text-green-500',
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title,
  severity = 'error',
  showIcon = true,
  dismissible = false,
  onDismiss,
  className,
  actions,
}) => {
  const Icon = iconMap[severity];
  
  const handleDismiss = () => onDismiss?.();

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        containerClasses[severity],
        className
      )}
      role="alert"
    >
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', iconColorClasses[severity])} />
          </div>
        )}
        
        <div className={cn('flex-1', { 'ml-3': showIcon })}>
          {title && (
            <h3 className={cn('text-sm font-medium', textClasses[severity])}>
              {title}
            </h3>
          )}
          
          <div className={cn('text-sm', textClasses[severity], { 'mt-1': title })}>
            {message}
          </div>
          
          {actions && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {actions}
              </div>
            </div>
          )}
        </div>
        
        {dismissible && (
          <div className="ml-4">
            <button
              type="button"
              onClick={handleDismiss}
              className={cn(
                'inline-flex rounded-md p-1 focus:outline-none',
                'text-gray-400 hover:text-gray-500',
                'dark:text-gray-500 dark:hover:text-gray-400',
                'focus:ring-2 focus:ring-offset-2',
                'focus:ring-primary-500 focus:ring-offset-transparent',
                'dark:focus:ring-offset-gray-900'
              )}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for common error actions
type ErrorActionProps = {
  onClick: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
};

export const ErrorAction: React.FC<ErrorActionProps> = ({
  onClick,
  label,
  variant = 'outline',
}) => (
  <Button
    variant={variant}
    size="sm"
    onClick={onClick}
    className="mt-2 sm:mt-0"
  >
    {label}
  </Button>
);

// Pre-styled error message components
export const ErrorAlert: React.FC<Omit<ErrorMessageProps, 'severity'>> = (props) => (
  <ErrorMessage severity="error" {...props} />
);

export const WarningAlert: React.FC<Omit<ErrorMessageProps, 'severity'>> = (props) => (
  <ErrorMessage severity="warning" {...props} />
);

export const InfoAlert: React.FC<Omit<ErrorMessageProps, 'severity'>> = (props) => (
  <ErrorMessage severity="info" {...props} />
);

export const SuccessAlert: React.FC<Omit<ErrorMessageProps, 'severity'>> = (props) => (
  <ErrorMessage severity="success" {...props} />
);
