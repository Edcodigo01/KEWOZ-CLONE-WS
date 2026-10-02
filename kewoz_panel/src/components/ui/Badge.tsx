import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

const badgeVariants = cva(
  'inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-primary/10 text-primary border-transparent hover:bg-primary/20',
        secondary:
          'bg-secondary/10 text-secondary-foreground border-transparent hover:bg-secondary/20',
        success:
          'bg-success/10 text-success-foreground border-success/20 hover:bg-success/20',
        destructive:
          'bg-destructive/10 text-destructive-foreground border-destructive/20 hover:bg-destructive/20',
        warning:
          'bg-warning/10 text-warning-foreground border-warning/20 hover:bg-warning/20',
        info: 'bg-info/10 text-info-foreground border-info/20 hover:bg-info/20',
        outline: 'text-foreground border-border',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-base px-3 py-1',
      },
      rounded: {
        sm: 'rounded-sm',
        md: 'rounded',
        lg: 'rounded-md',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'full',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Show remove button
   */
  onRemove?: () => void;
  
  /**
   * Custom remove icon
   */
  removeIcon?: React.ReactNode;
  
  /**
   * Custom class for the remove button
   */
  removeButtonClass?: string;
  
  /**
   * Show dot before the content
   */
  withDot?: boolean;
  
  /**
   * Custom dot color (overrides variant color)
   */
  dotColor?: string;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      onRemove,
      removeIcon,
      removeButtonClass,
      withDot = false,
      dotColor,
      children,
      ...props
    },
    ref
  ) => {
    const dotStyle = dotColor ? { backgroundColor: dotColor } : undefined;
    
    return (
      <div
        className={cn(
          badgeVariants({ variant, size, rounded, className }),
          'inline-flex items-center gap-1.5',
          className
        )}
        ref={ref}
        {...props}
      >
        {withDot && (
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              !dotColor && variant === 'default' && 'bg-primary',
              !dotColor && variant === 'secondary' && 'bg-secondary-foreground',
              !dotColor && variant === 'success' && 'bg-success',
              !dotColor && variant === 'destructive' && 'bg-destructive',
              !dotColor && variant === 'warning' && 'bg-warning',
              !dotColor && variant === 'info' && 'bg-info',
              !dotColor && variant === 'outline' && 'bg-foreground'
            )}
            style={dotStyle}
            aria-hidden="true"
          />
        )}
        {children}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              'ml-1.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/20',
              removeButtonClass
            )}
            aria-label="Remove"
          >
            {removeIcon || <X className="h-3 w-3" />}
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
