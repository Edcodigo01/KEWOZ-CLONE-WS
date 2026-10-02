import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Toaster, toast as hotToast } from 'react-hot-toast';

// Toast variant styles
const toastVariants = cva(
  'relative w-full flex items-center p-4 rounded-lg shadow-lg border',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        success: 'bg-success/10 text-success-foreground border-success/20',
        error: 'bg-destructive/10 text-destructive-foreground border-destructive/20',
        warning: 'bg-black text-yellow-500 border-yellow-500/20',
        info: 'bg-info/10 text-info-foreground border-info/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Toast component
const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof toastVariants> & {
      title?: string | undefined;
      description?: string | undefined;
      onDismiss?: () => void;
      action?: React.ReactNode;
      autoDismiss?: number | boolean;
    }
>(
  (
    {
      className,
      variant,
      title,
      description,
      onDismiss,
      action,
      autoDismiss = 5000,
      ...props
    },
    ref
  ) => {
    React.useEffect(() => {
      if (autoDismiss && onDismiss) {
        const timeout = setTimeout(
          onDismiss,
          typeof autoDismiss === 'number' ? autoDismiss : 5000
        );
        return () => clearTimeout(timeout);
      }
    }, [autoDismiss, onDismiss]);

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          toastVariants({ variant }),
          'animate-in slide-in-from-right-full data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
          className
        )}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="font-medium [&+div]:mt-1">
              {title}
            </h3>
          )}
          {description && (
            <div className="text-sm opacity-90">
              {description}
            </div>
          )}
        </div>
        
        {action && (
          <div className="ml-4">
            {action}
          </div>
        )}
        
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-4 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

// Toast context for managing toasts
interface ToastContextType {
  toast: (props: ToastProps) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  variant?: VariantProps<typeof toastVariants>['variant'];
  duration?: number;
  action?: React.ReactNode;
};

type ToastWithId = ToastProps & { id: string };

// Toast Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Global toaster configuration */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: '#fff',
            color: '#000',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}


// Hook to use toast
export function useToast() {
  return React.useMemo(() => ({
    toast: (props: { title?: string; description?: string; variant?: 'default' | 'success' | 'error' | 'warning' | 'info' }) => {
      const message = props.description || props.title || 'Notification';
      switch (props.variant) {
        case 'success': hotToast.success(message); break;
        case 'error': hotToast.error(message); break;
        case 'warning': hotToast(message, { icon: '⚠️' }); break;
        case 'info': hotToast(message, { icon: 'ℹ️' }); break;
        default: hotToast(message);
      }
    },
  }), []);
}

export { Toast };
