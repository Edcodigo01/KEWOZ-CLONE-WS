import { Fragment } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTE_CONFIG } from '@/config/routes';

interface BreadcrumbItem {
  label: string;
  href?: string | undefined;
  active?: boolean;
}

export function Breadcrumb({
  className,
  customItems,
  homeLabel = 'Panel',
  separator = <Circle className="h-1 w-1 bg-text-muted/20 rounded-full" />,
}: {
  className?: string;
  customItems?: BreadcrumbItem[];
  homeLabel?: string;
  separator?: React.ReactNode;
}) {
  const location = useLocation();
  const params = useParams();
  
  const breadcrumbs = customItems || (() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];
    let currentPath = '';
    
    // Add home
    items.push({ label: homeLabel, href: '/dashboard', active: location.pathname === '/' });
    
    // Add path segments
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      const routeConfig = ROUTE_CONFIG[currentPath as keyof typeof ROUTE_CONFIG];
      
      if (routeConfig && !routeConfig.hideFromMenu) {
        items.push({
          label: routeConfig.title.toUpperCase() || segment.toUpperCase(),
          href: isLast ? undefined : currentPath,
          active: isLast,
        });
      } else if (isLast) {
        items.push({
          label: segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase()),
          href: undefined,
          active: true,
        });
      }
    });
    
    return items;
  })();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className={cn('flex items-center text-sm', className)}       aria-label="Migas de pan">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => (
          <Fragment key={index}>
            {index > 0 && (
              <li className="text-text-muted" aria-hidden="true">
                {separator}
              </li>
            )}
            <li>
              {item.href ? (
                <Link
                  to={item.href}
                  className={cn(
                    'text-sm font-medium hover:text-primary-600 dark:hover:text-primary-400',
                    index === 0 // ✅ First breadcrumb (Dashboard/Home)
                      ? 'text-table-header-text font-bold' // make it darker
                      : item.active
                        ? 'text-text-muted'
                        : 'text-text-muted'
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'text-sm text-text-muted',
                    index === 0 // ✅ First breadcrumb (non-link case)
                      ? 'text-text-muted '
                      : item.active
                        ? 'text-text-muted'
                        : 'text-text-muted'
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>

          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

Breadcrumb.displayName = 'Breadcrumb';
