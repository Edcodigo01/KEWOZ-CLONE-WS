import { memo, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/config/navigation';
import { NAVIGATION } from '@/config/navigation';
import { ChevronRight } from 'lucide-react';
import { useProjectConfigStore } from '@/stores/useProjectConfigStore';
import { Modal } from '@/components/ui/Modal';
import { useThemeStore } from '@/store/theme/themeStore';
import logo from "/assets/logo.png";

interface NavItemState extends Omit<NavItem, 'children'> {
  isOpen: boolean;
  children: NavItemState[];
}

interface SidebarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onCollapse'> {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const Sidebar = memo(({ className, collapsed = false, onCollapse }: SidebarProps) => {
  // Handle sidebar toggle separately from dropdown toggles
  const { config } = useProjectConfigStore();
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const location = useLocation();
  const navigate = useNavigate();

  // Add event listener for modal opening from search
  useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      const { id, component, props } = event.detail;
      setActiveModal({
        id,
        component,
        props: props || {}
      });
    };

    // Add event listener
    window.addEventListener('openModal', handleOpenModal as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('openModal', handleOpenModal as EventListener);
    };
  }, []);

  // Modal state
  const [activeModal, setActiveModal] = useState<{
    id: string;
    component: React.ComponentType<any>;
    props?: Record<string, any>;
  } | null>(null);
  const [navItems, setNavItems] = useState<NavItemState[]>(() => {
    const mapItem = (item: NavItem): NavItemState => ({
      ...item,
      isOpen: item.isOpen ?? false,
      children: (item.children || []).map(mapItem)
    });
    return NAVIGATION.map(mapItem);
  });

  // Helper function to check if any child is active (recursively)
  const hasActiveChild = (item: NavItemState): boolean => {
    // Check if current item is active
    if (item.path && location.pathname === item.path) {
      return true;
    }

    // Check if any child is active recursively
    if (item.children && item.children.length > 0) {
      return item.children.some(child => hasActiveChild(child));
    }

    return false;
  };

  const toggleItem = (items: NavItemState[], path: number[]): NavItemState[] => {
    return items.map((item, index) => {
      // If this is the item we want to toggle
      if (path.length === 1 && path[0] === index) {
        return {
          ...item,
          isOpen: !item.isOpen
        };
      }

      // If we need to go deeper in the tree
      if (path.length > 0 && path[0] === index) {
        return {
          ...item,
          children: item.children ? toggleItem(item.children, path.slice(1)) : []
        };
      }

      return item;
    });
  };

  const handleItemClick = (e: React.MouseEvent, item: NavItemState, path: number[]) => {
    e.stopPropagation();

    if (item.children?.length) {
      console.log("clickeddd");

      // Toggle the dropdown
      setNavItems(prevItems => toggleItem(prevItems, [...path]));
    } else if (item.modal) {
      // Open modal
      setActiveModal({
        id: item.modal.id,
        component: item.modal.component,
        props: item.modal.props || {}
      });
      // Close sidebar on mobile after opening modal
      if (window.innerWidth < 768 && onCollapse) {
        onCollapse(true);
      }
    } else if (item.path) {
      // Navigate to the path
      navigate(item.path);
      // Close sidebar on mobile after navigation
      if (window.innerWidth < 768 && onCollapse) {
        onCollapse(true);
      }
    }
  };

  const renderNavItem = (item: NavItemState, path: number[] = [], level = 0) => {
    const hasChildren = item.children.length > 0;
    const isActive = item.path ? location.pathname === item.path : false;
    const hasActiveDescendant = hasActiveChild(item); // Check if item or any descendant is active
    const shouldHighlight = isActive || hasActiveDescendant; // Highlight if active or has active child
    const Icon = item.icon;
    const isFirstLevel = level === 0;
    const isSecondLevel = level === 1;

    if (collapsed && isFirstLevel) {
      if (!hasChildren) return null;

      return (
        <div key={path.join('-')} className="space-y-1">
          {item.children.map((child, childIndex) => (
            <div key={childIndex} className="flex justify-center">
              {child.title && (
                <Link
                  to={child.path || '#'}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    'flex items-center justify-center',
                    'focus:outline-none',
                    hasActiveChild(child)
                      ? 'bg-secondary-light text-primary-dark'
                      : 'text-text-muted hover:bg-secondary-light ',
                  )}
                  title={child.title}
                >
                  {child.icon && (<child.icon className="h-6 w-6" />)}
                </Link>
              )}
            </div>
          ))}
        </div>
      );
    }

    // First level items are always links
    if (isFirstLevel) {
      return (
        <div key={path.join('-')} className="space-y-1">
          <button
            onClick={(e) => handleItemClick(e, item, path)}
            style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
            className={cn(
              'w-full flex items-center px-3 py-2 rounded-md text-sm, font-extrabold transition-colors',
              'focus:outline-none focus:ring-1 focus:ring-primary-500',
              shouldHighlight
                ? ' text-primary-dark font-semibold'
                : 'text-table-header-text hover:text-primary-dark',
              !collapsed ? 'justify-start' : 'justify-center'
            )}
          >
            <div className={`flex items-center ${!shouldHighlight ? '' : 'text-primary-dark font-semibold'}`}>
              {Icon && <Icon className={cn('h-1 w-1 flex-shrink-0', !collapsed ? 'mr-3' : 'mx-auto')} />}
              {!collapsed && <span className="truncate ">{item.title}</span>}
            </div>
            {!collapsed && item.badge !== undefined && (
              <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                {item.badge}
              </span>
            )}
          </button>

          {/* Show second level items for first level items */}
          {hasChildren && (
            <div className="ml-1 pl-2   space-y-1 mt-1">
              {item.children.map((child, childIndex) => (
                <div key={childIndex}>
                  {renderNavItem(child, [...path, childIndex], level + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Second level items
    if (isSecondLevel) {
      // If it has no children but has a path, make it a link
      if (!hasChildren && item.path) {
        return (
          <Link
            key={path.join('-')}
            to={item.path}
            className={cn(
              'w-full flex items-center px-3 py-2 rounded-md text-sm  transition-colors ',
              'focus:outline-none',
              shouldHighlight
                ? ' text-primary-dark font-semibold'
                : 'text-text-muted ',
              'justify-between'
            )}
          >
            <div className="flex items-center">
              {Icon && <Icon className={cn('h-5 w-5 flex-shrink-0 mr-3')} />}
              <span className="truncate hover:text-primary-dark">{item.title}</span>
            </div>
            {item.badge !== undefined && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                {item.badge}
              </span>
            )}
          </Link>
        );
      }

      // If it has children, make it a toggle button
      return (
        <div key={path.join('-')} className="space-y-1">
          <button
            onClick={(e) => handleItemClick(e, item, path)}
            style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
            className={cn(
              'w-full flex cursor-pointer items-center px-3 py-2 rounded-md text-sm  transition-colors',
              'focus:outline-none',
              // 'hover:bg-secondary-light',
              'justify-between',
              shouldHighlight
                ? ' text-primary-dark font-semibold'
                : 'text-text-muted ',
            )}
          >
            <div className="flex items-center">
              {Icon && (
                <Icon
                  className={cn(
                    'h-5 w-5 font-bold flex-shrink-0 mr-3',
                    shouldHighlight
                      ? 'text-primary-dark font-semibold'
                      : ''
                  )}
                />
              )}
              <span className="truncate  hover:text-primary-dark">{item.title}</span>
            </div>
            {hasChildren && (
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  item.isOpen ? 'rotate-90' : ''
                )}
              />
            )}
          </button>

          {item.isOpen && (
            <div className="ml-4 mt-1 relative">
              {item.children.map((child, childIndex) => {
                const isLast = childIndex === item.children.length - 1;

                return (
                  <div key={childIndex} className="relative pl-4">
                    {/* Vertical trunk line */}
                    <div
                      className={cn(
                        "absolute left-0 top-0 w-px bg-sidebar-branch",
                        isLast ? "h-4" : "h-full" // trunk stops earlier for last
                      )}
                    />

                    {/* Branch elbow */}
                    <svg
                      className="absolute -left-[0.2px] top-2 w-8 h-8 text-sidebar-branch"
                      viewBox="0 0 34 35"
                      fill="none"
                    >
                      <path
                        d="M0 0 V14 Q0 20, 8 20 H20"
                        stroke="currentColor"
                        strokeWidth="1"
                        fill="none"
                      />
                    </svg>

                    {/* Clickable item */}
                    <div
                      onClick={(e) => handleItemClick(e, child, [...path, childIndex])}
                      className={cn(
                        "w-full flex items-center justify-between py-2 pl-2 rounded-md",
                        "text-2xl transition-colors cursor-pointer",
                        "hover:text-primary-dark/50",
                        hasActiveChild(child)
                          ? "text-primary-dark"
                          : "text-table-header-text"
                      )}
                    >
                      {renderNavItem(child, [...path, childIndex], level + 1)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}


        </div>
      );
    }

    // Third level items are simple links
    return (
      <Link
        key={path.join('-')}
        to={item.path || '#'}
        className={cn(
          'flex items-center px-3 py-1.5 rounded-md text-sm  transition-colors',
          'focus:outline-none',
          shouldHighlight
            ? 'text-primary-dark font-semibold'
            : 'text-text-muted ',
          'hover:bg-secondary-ligh',
          'justify-between',
          'text-sm'
        )}
      >
        <span className="truncate hover:text-primary-dark " >{item.title}</span>
        {item.badge !== undefined && (
          <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 text-md font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <div
        className={cn(
          'flex flex-col h-screen bg-secondary border-r border-secondary-light',
          'transition-all duration-200 ease-in-out',
          collapsed ? 'w-16' : 'w-72',
          className
        )}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between ${collapsed ? "h-18" : "h-24"
            } px-4`}
        >
          <Link to="/" className="flex items-center space-x-2">
            {collapsed ? (
              import.meta.env.VITE_PRODUCT_TYPE == "demo" ? (
                // ✅ Demo mode collapsed logos
                <img
                  src={
                    resolvedTheme === "dark"
                      ? logo
                      : logo
                  }
                  alt="Demo Logo"
                  className="h-8"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                // ✅ Normal collapsed logos
                <img
                  src={
                    resolvedTheme === "dark"
                      ? config?.app_logo_dark
                      : config?.app_logo_dark
                  }
                  alt="Logo"
                  className="h-8"
                  loading="lazy"
                  decoding="async"
                />
              )
            ) : (
              // ✅ Full logos (expanded mode)
              <img
                src={
                  resolvedTheme === "dark"
                    ? config?.web_logo_dark
                    : config?.web_logo_light
                }
                alt="Logo"
                className="h-20"
                loading="lazy"
                decoding="async"
              />
            )}
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto -py-2 px-2 space-y-1 overflow-x-hidden">
          {navItems.map((item, index) => (
            <div key={index}>
              {renderNavItem(item, [index], 0)}
            </div>
          ))}
        </div>

      </div>

      {/* Modal */}
      {activeModal && (
        <Modal
          isOpen={true}
          onClose={closeModal}
          // size="full"
          title={activeModal.props?.['title']}
          showCloseButton={true}
        >
          <div className=''>
            <activeModal.component
              {...activeModal.props}
            />
          </div>
        </Modal>
      )}
    </>
  );
});

export default Sidebar;