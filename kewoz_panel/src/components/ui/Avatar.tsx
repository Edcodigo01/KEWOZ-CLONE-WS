import * as React from 'react';
import { cn } from '../../lib/utils';

// Avatar component props
type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Image source URL
   */
  src?: string | null;
  
  /**
   * Alt text for the avatar image
   */
  alt?: string;
  
  /**
   * Fallback text or initials to display when no image is provided
   */
  fallback?: string;
  
  /**
   * Size of the avatar
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  
  /**
   * Shape of the avatar
   * @default 'circle'
   */
  shape?: 'circle' | 'square' | 'rounded';
  
  /**
   * Status indicator
   */
  status?: 'online' | 'offline' | 'busy' | 'away' | null;
  
  /**
   * Custom class for the status indicator
   */
  statusClassName?: string;
  
  /**
   * Show a border around the avatar
   */
  bordered?: boolean;
  
  /**
   * Custom class for the image
   */
  imgClassName?: string;
  
  /**
   * Custom class for the fallback
   */
  fallbackClassName?: string;
};

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-20 w-20 text-xl',
};

const statusSizeClasses = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
  '2xl': 'h-4 w-4',
};

const statusPositionClasses = {
  sm: 'bottom-0 right-0',
  md: 'bottom-0 right-0',
  lg: 'bottom-0.5 right-0.5',
  xl: 'bottom-1 right-1',
  '2xl': 'bottom-1 right-1',
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      fallback,
      size = 'md',
      shape = 'circle',
      status,
      statusClassName,
      bordered = false,
      className,
      imgClassName,
      fallbackClassName,
      ...props
    },
    ref
  ) => {
    const sizeClass = typeof size === 'number' ? '' : sizeClasses[size];
    const statusSize = typeof size === 'number' ? 'md' : size;
    
    const shapeClasses = {
      circle: 'rounded-full',
      square: 'rounded',
      rounded: 'rounded-lg',
    };
    
    const statusColors = {
      online: 'bg-success',
      offline: 'bg-muted-foreground/30',
      busy: 'bg-destructive',
      away: 'bg-warning',
    };

    // Generate initials from fallback text
    const getInitials = (name?: string) => {
      if (!name) return '??';
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center bg-muted overflow-hidden ',
          sizeClass,
          shapeClasses[shape],
          bordered && 'ring-2 ',
          className
        )}
        style={typeof size === 'number' ? { width: size, height: size } : undefined}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className={cn(
              'h-full w-full object-cover',
              shapeClasses[shape],
              imgClassName
            )}
            onError={(e) => {
              // If image fails to load, show fallback
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : null}

        {(fallback || !src) && (
          <span
            className={cn(
              'flex h-full w-full items-center justify-center bg-muted font-medium text-muted-foreground',
              fallbackClassName
            )}
          >
            {getInitials(fallback)}
          </span>
        )}

        {status && (
          <span
            className={cn(
              'absolute block rounded-full border-2 border-background',
              statusColors[status],
              statusSizeClasses[statusSize],
              statusPositionClasses[statusSize],
              status === 'offline' && 'ring-1 ring-muted-foreground/20',
              statusClassName
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group Component
type AvatarGroupProps = {
  children: React.ReactNode;
  /**
   * Maximum number of avatars to show before showing a +X more indicator
   */
  max?: number;
  /**
   * Space between avatars (in rem)
   */
  spacing?: number;
  /**
   * Size of the avatars in the group
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
};

const AvatarGroup = ({
  children,
  max = 5,
  spacing = -0.75,
  size = 'md',
  ...props
}: AvatarGroupProps) => {
  const avatars = React.Children.toArray(children);
  const totalAvatars = avatars.length;
  const maxAvatars = Math.min(max, totalAvatars);
  const extraAvatars = totalAvatars - maxAvatars;
  const spacingStyle = { marginLeft: `${spacing}rem` };

  return (
    <div className="flex items-center" {...props}>
      {avatars.slice(0, maxAvatars).map((child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement, {
            style: { ...child.props.style, ...(index !== 0 && spacingStyle) },
            size: size,
            bordered: true,
          });
        }
        return child;
      })}
      {extraAvatars > 0 && (
        <Avatar
          fallback={`+${extraAvatars}`}
          size={size}
          className="border-2 border-background"
          style={spacingStyle}
          aria-label={`${extraAvatars} more`}
        />
      )}
    </div>
  );
};

export { Avatar, AvatarGroup };
