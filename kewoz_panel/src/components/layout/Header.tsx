import { memo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme/themeStore';
import { useAuth } from '@/providers/AuthProvider';
import { Button, type ButtonProps } from '@/components/ui/Button';
type ButtonVariant = NonNullable<ButtonProps['variant']>;
import { User, Settings, LogOut, Search, X, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

type SearchResult = {
  title: string;
  path?: string;
  icon?: React.ComponentType<{ className?: string }>;
  modal?: {
    id: string;
    component: React.ComponentType<any>;
    props?: Record<string, any>;
  };
  onClick: () => void;
};
import { NAVIGATION } from '@/config/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotificationStore } from '@/store/useNotificationStore';
import { NotificationButton } from '../ui/NotificationButton';

interface HeaderProps {
  className?: string;
  variant?: 'default' | 'transparent';
  onMenuClick?: () => void;
  onToggleSidebar?: () => void;
  showMobileMenu?: boolean;
  sidebarOpen?: boolean;
  sidebarCollapsed?: boolean;
}

export const Header = memo(function Header({
  className,
  variant = 'default',
  onMenuClick,
  onToggleSidebar,
  showMobileMenu = false,
  sidebarOpen = false,
  sidebarCollapsed = false,
}: HeaderProps) {
  // Using theme store for future theming
  useThemeStore();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isTransparent = variant === 'transparent';
  const { isAvailable, loading, fetchAvailability } = useNotificationStore();

  // Handle scroll effect for transparent header
  useEffect(() => {
    if (isTransparent) {
      const handleScroll = () => {
        const isScrolled = window.scrollY > 10;
        if (isScrolled !== scrolled) {
          setScrolled(isScrolled);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
    return undefined;
  }, [isTransparent, scrolled]);

  // Close search results when clicking outside
  useEffect(() => {
    fetchAvailability()
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };


  }, []);

  // Flatten the navigation tree and filter based on search query
  const searchNavigation = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    const processItems = (items: any[], path: (string | number)[] = []) => {
      items.forEach((item, index) => {
        const currentPath = [...path, index];

        // Check if item matches search query (title, path, or modal id)
        const matches =
          item.title.toLowerCase().includes(queryLower) ||
          (item.path && item.path.toLowerCase().includes(queryLower)) ||
          (item.modal && item.modal.id.toLowerCase().includes(queryLower));

        // Only add items that have either a path or modal (no parent items)
        if (matches && (item.path || item.modal)) {
          results.push({
            title: item.title,
            path: item.path,
            icon: item.icon,
            modal: item.modal,
            onClick: () => {
              if (item.path) {
                navigate(item.path);
              } else if (item.modal) {
                // Dispatch a custom event to open the modal
                const modalEvent = new CustomEvent('openModal', {
                  detail: {
                    id: item.modal.id,
                    component: item.modal.component,
                    props: item.modal.props
                  }
                });
                window.dispatchEvent(modalEvent);
              }
              setSearchQuery('');
              setSearchResults([]);
            }
          });
        }

        // Process children recursively
        if (item.children) {
          processItems(item.children, currentPath);
        }
      });
    };

    processItems(NAVIGATION);
    setSearchResults(results);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchNavigation(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const headerClasses = cn(
    'w-full transition-all duration-300 ease-in-out',
    isTransparent
      ? 'fixed top-0 left-0 right-0 z-50 py-4'
      : 'border-b border-secondary-light py-3',
    isTransparent && scrolled
      ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-secondary-light shadow-sm'
      : 'bg-transparent',
    isTransparent && !scrolled && 'border-transparent',
    className
  );


  return (
    <header className={headerClasses}>
      <div className="w-full  px-4 sm:px-6 lg:px-8">
        <div className="flex items-center w-full justify-between h-12 md:h-14">
          {/* Mobile menu button - only show on mobile */}
          {showMobileMenu && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-text-muted hover:text-primary-dark hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
              aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <Menu className="h-6 w-6" />
            </button>
          )}

          {/* Desktop sidebar toggle */}
          {!showMobileMenu && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="hidden md:flex p-2 rounded-md text-text-muted hover:text-primary-dark hover:bg-secondary-light focus:outline-none mr-2"
              aria-label={sidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>
          )}

          <div className={cn(
            "relative w-64 hidden md:block",
            showMobileMenu && "md:block" // Ensure it's still hidden on mobile when showMobileMenu is true
          )} ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 font-extrabold text-text-muted" />
              <Input
                type="text"
                placeholder="Buscar..."
                className="pl-9 bg-secondary/80 text-text-muted  "
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 font-extrabold text-text-muted"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-secondary rounded-md shadow-lg border !border-text-muted  max-h-96 overflow-y-auto">
                <div className="py-1">
                  {searchResults.map((item, index) => (
                    <button
                      key={`${item.title}-${index}`}
                      onClick={(e) => {
                        e.preventDefault();
                        item.onClick();
                        setIsSearchFocused(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-text-muted hover:font-bold hover:bg-table-header-bg flex items-center"
                    >
                      {item.icon && (
                        <item.icon className="mr-3 h-4 w-4 text-gray-400" />
                      )}
                      <span>{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <NotificationButton />

            {user ? (
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "relative h-10 w-10 rounded-full p-0 mt-1.5",
                        isTransparent && !scrolled
                          ? "text-white hover:bg-white/10"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <Avatar
                        src={user.profile_pic ?? null}
                        alt={user.full_name}
                        // fallback={user.first_name}
                        size="md" // matches h-8 w-8
                        className="h-10 w-10 border  rounded-full"

                      />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-auto border-table-divider bg-secondary text-text-secondary shadow-default" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal border-b border-b-table-divider">
                      <div className="w-64 flex space-x-2  justify-start py-2 ">
                        <img src={user.profile_pic} className='h-8 w-8 rounded-full' alt="" loading="lazy" decoding="async" />
                        <div className='flex flex-col space-y-1 justify-center'>
                          <span className="text-sm font-semibold leading-none">{user.full_name}</span>
                          <span className="text-xs font-light leading-none text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                        
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="w-full cursor-pointer border-b border-b-table-divider pb-4">
                          <User className="mr-2 h-4 w-4" />
                          <span>Perfil</span>
                        </Link>
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem asChild>
                        <Link to="/settings" className="w-full cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem> */}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Button
                  asChild
                  variant={(isTransparent && !scrolled ? 'outline' : 'ghost') as ButtonVariant}
                  className={cn(
                    'hidden sm:inline-flex',
                    isTransparent && !scrolled && 'border-secondary text-white hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Link to="/login">Iniciar sesión</Link>
                </Button>
                <Button
                  asChild
                  className={cn(
                    'hidden sm:inline-flex',
                    isTransparent && !scrolled
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : ''
                  )}
                >
                  <Link to="/register">Comenzar</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});