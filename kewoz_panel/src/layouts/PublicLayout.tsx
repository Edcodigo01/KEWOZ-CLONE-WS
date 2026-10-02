import { ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
// import { useTheme } from '@/providers/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ErrorBoundary } from 'react-error-boundary';
import { ROUTES, getPageTitle } from '@/config/routes';
import { Icons } from '@/components/ui/Icons';
import { useTheme } from '@/hooks/common/useTheme';

interface PublicLayoutProps {
  children?: ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  containerClassName?: string;
}

export function PublicLayout({
  children,
  className,
  showHeader = true,
  showFooter = true,
  containerClassName,
}: PublicLayoutProps) {
  const { theme } = useTheme();
  const location = useLocation();
  const isHomePage = location.pathname === ROUTES.HOME;
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className={cn(
      'flex flex-col min-h-screen',
      theme === 'dark' ? 'bg-gray-900' : 'bg-white',
      className
    )}>
      {showHeader && (
        <Header 
          variant={isHomePage ? 'transparent' : 'default'} 
          className={cn(
            isHomePage && 'absolute top-0 left-0 right-0 z-50',
            isHomePage && theme === 'dark' ? 'text-white' : 'text-gray-900'
          )} 
        />
      )}

      <main className={cn(
        'flex-1',
        isHomePage ? 'pt-0' : 'pt-24',
        containerClassName
      )}>
        <ErrorBoundary
          fallback={
            <div className="container mx-auto px-4 py-12 text-center">
              <Icons.alertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Something went wrong
              </h1>
              <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
                We're having trouble loading this page. Please try again later.
              </p>
              <div className="mt-6">
                <a
                  href={ROUTES.HOME}
                  className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Go back home
                </a>
              </div>
            </div>
          }
        >
          {children || <Outlet />}
        </ErrorBoundary>
      </main>

      {showFooter && (
        <Footer 
          className={cn(
            isHomePage && 'border-t border-gray-200 dark:border-gray-800',
            isHomePage && theme === 'dark' ? 'bg-gray-900' : 'bg-white'
          )} 
        />
      )}
    </div>
  );
}

// Add display name for debugging
PublicLayout.displayName = 'PublicLayout';
