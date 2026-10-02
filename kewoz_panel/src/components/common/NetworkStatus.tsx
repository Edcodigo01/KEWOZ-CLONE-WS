import React, { useEffect, useState, useCallback } from 'react';
import { Wifi, WifiOff, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useToast } from '../ui/Toast';

type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'ethernet' | 'wifi' | 'cellular' | 'unknown';
type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';

type NetworkState = {
  /** Whether the device is online */
  isOnline: boolean;
  
  /** The type of network connection */
  type: ConnectionType;
  
  /** Effective connection type (slow-2g, 2g, 3g, 4g) */
  effectiveType: EffectiveConnectionType;
  
  /** Estimated round-trip time in milliseconds */
  rtt: number;
  
  /** Downlink speed in megabits per second */
  downlink: number;
  
  /** Whether the user has manually overridden the online status */
  isOverride: boolean;
  
  /** Last time the connection changed */
  lastUpdated: Date | null;
};

type NetworkStatusProps = {
  /** Show a toast notification when the connection changes */
  showNotifications?: boolean;
  
  /** Show a small indicator in the corner of the screen */
  showIndicator?: boolean;
  
  /** Custom class for the indicator */
  indicatorClassName?: string;
  
  /** Callback when the network status changes */
  onStatusChange?: (status: NetworkState) => void;
};

const DEFAULT_NETWORK_STATE: NetworkState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  type: 'unknown',
  effectiveType: 'unknown',
  rtt: 0,
  downlink: 0,
  isOverride: false,
  lastUpdated: null,
};

/**
 * Hook to monitor network status and connection information
 */
export function useNetworkStatus(options: Omit<NetworkStatusProps, 'showIndicator' | 'indicatorClassName'> = {}) {
  const [state, setState] = useState<NetworkState>(DEFAULT_NETWORK_STATE);
  const { toast } = useToast();
  const { showNotifications = true, onStatusChange } = options;
  
  const updateNetworkState = useCallback((update: Partial<NetworkState>) => {
    setState(prev => {
      const newState = { 
        ...prev, 
        ...update, 
        lastUpdated: new Date() 
      };
      onStatusChange?.(newState);
      return newState;
    });
  }, [onStatusChange]);
  
  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      updateNetworkState({ 
        isOnline: true, 
        isOverride: false,
      });
      
      // if (showNotifications) {
      //   toast({
      //     title: 'You are back online',
      //     description: 'Your internet connection has been restored.',
      //     variant: 'success',
      //   });
      // }
    };
    
    const handleOffline = () => {
      updateNetworkState({ 
        isOnline: false, 
        isOverride: false,
      });
      
      if (showNotifications) {
        toast({
          title: 'You are offline',
          description: 'Please check your internet connection.',
          variant: 'destructive',
        });
      }
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    if (navigator.onLine) {
      handleOnline();
    } else {
      handleOffline();
    }
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showNotifications, toast, updateNetworkState]);
  
  // Monitor connection changes (effective type, rtt, downlink)
  useEffect(() => {
    // Skip if the browser doesn't support the Network Information API
    if (!('connection' in navigator) || !(navigator as any).connection) {
      return;
    }
    
    const connection = (navigator as any).connection;
    
    const updateConnectionInfo = () => {
      updateNetworkState({
        type: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        rtt: connection.rtt || 0,
        downlink: connection.downlink || 0,
      });
    };
    
    // Initial update
    updateConnectionInfo();
    
    // Listen for changes
    connection.addEventListener('change', updateConnectionInfo);
    
    return () => {
      connection.removeEventListener('change', updateConnectionInfo);
    };
  }, [updateNetworkState]);
  
  // Manually override the online status (useful for testing)
  const setOnline = useCallback((isOnline: boolean) => {
    updateNetworkState({ 
      isOnline, 
      isOverride: true,
    });
  }, [updateNetworkState]);
  
  // Check if the connection is slow
  const isSlowConnection = useCallback(() => {
    const { effectiveType, rtt, downlink } = state;
    return (
      effectiveType === 'slow-2g' || 
      effectiveType === '2g' ||
      (effectiveType === '3g' && (rtt > 400 || downlink < 1))
    );
  }, [state]);
  
  return {
    ...state,
    setOnline,
    isSlowConnection: isSlowConnection(),
  };
}

/**
 * Component that shows a small indicator of the current network status
 */
export const NetworkStatusIndicator: React.FC<NetworkStatusProps> = ({
  showIndicator = true,
  indicatorClassName,
  ...props
}) => {
  const { isOnline, effectiveType, isSlowConnection } = useNetworkStatus({
    ...props,
    showNotifications: false,
  });
  
  if (!showIndicator) {
    return null;
  }
  
  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        color: 'bg-red-500',
        tooltip: 'Offline - No internet connection',
      };
    }
    
    if (isSlowConnection) {
      return {
        icon: AlertTriangle,
        color: 'bg-yellow-500',
        tooltip: `Slow connection (${effectiveType}) - Consider using a faster network`,
      };
    }
    
    if (effectiveType === '4g' || effectiveType === '5g') {
      return {
        icon: Wifi,
        color: 'bg-green-500',
        tooltip: `Online (${effectiveType}) - Fast connection`,
      };
    }
    
    return {
      icon: Info,
      color: 'bg-blue-500',
      tooltip: `Online (${effectiveType || 'unknown'})`,
    };
  };
  
  const { icon: Icon, color, tooltip } = getStatusInfo();
  
  return (
    <div 
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center justify-center',
        'p-2 rounded-full shadow-lg transition-all',
        'opacity-90 hover:opacity-100',
        color,
        indicatorClassName
      )}
      title={tooltip}
      role="status"
      aria-live="polite"
      aria-label={tooltip}
    >
      <Icon className="h-5 w-5 text-white" />
    </div>
  );
};

/**
 * Main NetworkStatus component that handles both the indicator and notifications
 */
const NetworkStatus: React.FC<NetworkStatusProps> = (props) => {
  // This component just combines the hook and indicator
  // The hook is used internally by the indicator
  return <NetworkStatusIndicator {...props} />;
};

export default NetworkStatus;

// Helper component to show content only when online
export const OnlineOnly: React.FC<{ fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => {
  const { isOnline } = useNetworkStatus({ showNotifications: false });
  return isOnline ? <>{children}</> : <>{fallback}</>;
};

// Helper component to show content only when offline
export const OfflineOnly: React.FC<{ fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => {
  const { isOnline } = useNetworkStatus({ showNotifications: false });
  return !isOnline ? <>{children}</> : <>{fallback}</>;
};

// Higher-order component for conditional rendering based on network status
export function withNetworkStatus<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    /** Render only when online */
    onlineOnly?: boolean;
    /** Render only when offline */
    offlineOnly?: boolean;
    /** Fallback component to render when condition is not met */
    fallback?: React.ReactNode;
  } = {}
): React.FC<P> {
  const { onlineOnly = false, offlineOnly = false, fallback = null } = options;
  
  const Wrapped: React.FC<P> = (props) => {
    const { isOnline } = useNetworkStatus({ showNotifications: false });
    
    if (onlineOnly && !isOnline) {
      return <>{fallback}</>;
    }
    
    if (offlineOnly && isOnline) {
      return <>{fallback}</>;
    }
    
    return <Component {...props} />;
  };
  
  Wrapped.displayName = `withNetworkStatus(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
}
