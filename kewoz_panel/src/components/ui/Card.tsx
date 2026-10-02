import * as React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  hoverable?: boolean;
  bordered?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      as: Component = 'div',
      hoverable = false,
      bordered = true,
      isLoading = false,
      onClick,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'rounded-lg bg-card text-card-foreground overflow-hidden',
          bordered && 'border',
          hoverable && 'transition-all hover:shadow-md',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
        {...props}
      >
        {isLoading ? <CardSkeleton /> : props.children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center ', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

const CardSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6">
    <div className="h-6 w-3/4 rounded bg-muted" />
    <div className="space-y-2">
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-5/6 rounded bg-muted" />
    </div>
    <div className="h-10 w-24 rounded bg-muted" />
  </div>
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
