import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  createdAt: number;
}

export type ModalComponent = React.ComponentType<any>;

export interface ModalState {
  id: string;
  component: ModalComponent;
  props: Record<string, any>;
  options?: {
    disableBackdropClick?: boolean;
    disableEscapeKey?: boolean;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
    fullWidth?: boolean;
    fullScreen?: boolean;
  };
}

interface UIState {
  // Loading states
  loading: Record<string, boolean>;

  // Toast notifications
  toasts: Toast[];

  // Modal management
  modals: ModalState[];

  // Sidebar/drawer states
  sidebar: {
    isOpen: boolean;
    width: number;
    collapsed: boolean;
    isMobile: boolean;
  };

  // UI actions
  setLoading: (key: string, isLoading: boolean) => void;
  showToast: (
    message: string,
    variant?: ToastVariant,
    duration?: number
  ) => string;
  dismissToast: (id: string) => void;
  showModal: (
    component: ModalComponent,
    props?: Record<string, any>,
    options?: ModalState["options"]
  ) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  toggleSidebar: (open?: boolean) => void;
  toggleCollapseSidebar: () => void;
  setIsMobile: (isMobile: boolean) => void;
}

const initialState = {
  loading: {},
  toasts: [],
  modals: [],
  sidebar: {
    isOpen: false,
    width: 240,
    collapsed: false,
    isMobile: false,
  },
};

export const useUIStore = create<UIState>((set, get) => ({
  ...initialState,

  // Set loading state for a specific key
  setLoading: (key, isLoading) =>
    set((state) => ({
      loading: {
        ...state.loading,
        [key]: isLoading,
      },
    })),

  // Show a toast notification
  showToast: (message, variant = "default", duration = 5000) => {
    const id = uuidv4();
    const toast: Toast = {
      id,
      message,
      variant,
      duration,
      createdAt: Date.now(),
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-dismiss if duration is set
    if (duration > 0) {
      setTimeout(() => {
        get().dismissToast(id);
      }, duration);
    }

    return id;
  },

  // Dismiss a toast by ID
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  // Show a modal
  showModal: (component, props = {}, options = {}) => {
    const id = uuidv4();

    set((state) => ({
      modals: [
        ...state.modals,
        {
          id,
          component,
          props,
          options: {
            disableBackdropClick: false,
            disableEscapeKey: false,
            maxWidth: "sm",
            fullWidth: true,
            ...options,
          },
        },
      ],
    }));

    return id;
  },

  // Close a modal by ID
  closeModal: (id) =>
    set((state) => ({
      modals: state.modals.filter((modal) => modal.id !== id),
    })),

  // Close all modals
  closeAllModals: () =>
    set({
      modals: [],
    }),

  // Toggle sidebar open/close
  toggleSidebar: (open) =>
    set((state) => {
      const isOpen = open ?? !state.sidebar.isOpen;
      return {
        sidebar: {
          ...state.sidebar,
          isOpen,
          // Auto-collapse when closing on mobile
          collapsed: isOpen ? state.sidebar.collapsed : false,
        },
      };
    }),

  // Toggle sidebar collapsed state
  toggleCollapseSidebar: () =>
    set((state) => ({
      sidebar: {
        ...state.sidebar,
        collapsed: !state.sidebar.collapsed,
      },
    })),

  // Set mobile state
  setIsMobile: (isMobile) =>
    set((state) => ({
      sidebar: {
        ...state.sidebar,
        isMobile,
        // Auto-close sidebar when switching to mobile
        isOpen: isMobile ? false : state.sidebar.isOpen,
      },
    })),
}));

// Export store hook
export default useUIStore;

// Helper hooks
export const useIsLoading = (key: string) => {
  return useUIStore((state) => !!state.loading[key]);
};

export const useToast = () => {
  const showToast = useUIStore((state) => state.showToast);
  const dismissToast = useUIStore((state) => state.dismissToast);

  return {
    show: showToast,
    success: (message: string, duration?: number) =>
      showToast(message, "success", duration),
    error: (message: string, duration?: number) =>
      showToast(message, "error", duration),
    warning: (message: string, duration?: number) =>
      showToast(message, "warning", duration),
    info: (message: string, duration?: number) =>
      showToast(message, "info", duration),
    dismiss: dismissToast,
  };
};

export const useModal = () => {
  const showModal = useUIStore((state) => state.showModal);
  const closeModal = useUIStore((state) => state.closeModal);
  const closeAllModals = useUIStore((state) => state.closeAllModals);

  return {
    show: showModal,
    close: closeModal,
    closeAll: closeAllModals,
  };
};

export const useSidebar = () => {
  const { isOpen, collapsed, isMobile, width } = useUIStore(
    (state) => state.sidebar
  );
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const toggleCollapse = useUIStore((state) => state.toggleCollapseSidebar);

  return {
    isOpen,
    collapsed,
    isMobile,
    width,
    toggle: toggleSidebar,
    toggleCollapse,
    open: () => toggleSidebar(true),
    close: () => toggleSidebar(false),
  };
};
