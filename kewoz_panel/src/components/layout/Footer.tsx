import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';
import { NAVIGATION } from '@/config/routes';

interface FooterProps {
  className?: string;
  showLogo?: boolean;
  showSocial?: boolean;
  showCopyright?: boolean;
}

export function Footer({ 
  className, 
  showLogo = true, 
  showSocial = true, 
  showCopyright = true 
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={cn('w-full bg-white dark:bg-gray-900', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            {showLogo && (
              <div className="flex-shrink-0 flex items-center">
                {/* <Icons.logo className="h-8 w-auto" /> */}
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  YourBrand
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-8 md:mt-0">
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-4">
              {NAVIGATION.footer.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
          
          {showSocial && (
            <div className="mt-8 flex justify-center space-x-6 md:mt-0">
              {/* <a 
                href="#" 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Twitter"
              >
                <span className="sr-only">Twitter</span>
                <Icons.twitter className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="GitHub"
              >
                <span className="sr-only">GitHub</span>
                <Icons.gitHub className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="LinkedIn"
              >
                <span className="sr-only">LinkedIn</span>
                <Icons.linkedIn className="h-6 w-6" />
              </a> */}
            </div>
          )}
        </div>
        
        {showCopyright && (
          <div className="border-t border-gray-200 dark:border-gray-800 py-8">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              &copy; {currentYear} Your Company, Inc. All rights reserved.
            </p>
            <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              Built with{' '}
              <a 
                href="https://reactjs.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                React
              </a>{' '}
              and{' '}
              <a 
                href="https://tailwindcss.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Tailwind CSS
              </a>
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}

// Add display name for debugging
Footer.displayName = 'Footer';
