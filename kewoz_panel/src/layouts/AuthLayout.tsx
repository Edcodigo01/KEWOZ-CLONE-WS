import { ReactNode, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
// import { useTheme } from '@/providers/ThemeProvider';
import { Icons } from '@/components/ui/Icons';
import { ErrorBoundary } from 'react-error-boundary';
import { useTheme } from '@/hooks/common/useTheme';

interface AuthLayoutProps {
  children?: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  const { theme } = useTheme();
  
  return (
    <div className={cn(
      'min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8',
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
      className
    )}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Icons.logo className="h-12 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Welcome back
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={cn(
          'bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10',
          theme === 'dark' ? 'border border-gray-700' : 'border border-gray-200'
        )}>
          <ErrorBoundary
            fallback={
              <div className="text-center text-red-600 dark:text-red-400 p-4">
                Something went wrong. Please try again.
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="flex justify-center py-8">
                  <Icons.spinner className="h-8 w-8 animate-spin" />
                </div>
              }
            >
              {children || <Outlet />}
            </Suspense>
          </ErrorBoundary>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Having trouble?{' '}
            <a 
              href="#" 
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Add display name for debugging
AuthLayout.displayName = 'AuthLayout';
