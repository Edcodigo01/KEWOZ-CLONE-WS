import { useState, useCallback, useRef, useEffect } from 'react';

type LoadingState = {
  /** Whether the operation is in progress */
  isLoading: boolean;
  
  /** Error that occurred during the operation */
  error: Error | null;
  
  /** Whether the operation completed successfully */
  isSuccess: boolean;
  
  /** Whether the operation failed */
  isError: boolean;
  
  /** Timestamp when the operation started */
  startedAt: Date | null;
  
  /** Timestamp when the operation ended */
  endedAt: Date | null;
  
  /** Duration of the operation in milliseconds */
  duration: number | null;
  
  /** Reset the loading state */
  reset: () => void;
};

type UseLoadingStateOptions = {
  /** Initial loading state */
  initialLoading?: boolean;
  
  /** Callback when the operation starts */
  onStart?: () => void;
  
  /** Callback when the operation completes successfully */
  onSuccess?: () => void;
  
  /** Callback when the operation fails */
  onError?: (error: Error) => void;
  
  /** Callback when the operation completes (regardless of success/failure) */
  onComplete?: () => void;
};

/**
 * Hook for managing loading states in async operations
 */
export function useLoadingState(options: UseLoadingStateOptions = {}): [
  LoadingState,
  <T>(promise: Promise<T>) => Promise<T>,
  (error: Error) => void,
  () => void
] {
  const {
    initialLoading = false,
    onStart,
    onSuccess,
    onError,
    onComplete,
  } = options;
  
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<Error | null>(null);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [endedAt, setEndedAt] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  
  const isMounted = useRef(true);
  
  // Set up cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Reset the loading state
  const reset = useCallback(() => {
    if (!isMounted.current) return;
    
    setIsLoading(false);
    setError(null);
    setStartedAt(null);
    setEndedAt(null);
    setDuration(null);
  }, []);
  
  // Set error state
  const setErrorState = useCallback((error: Error) => {
    if (!isMounted.current) return;
    
    const endTime = new Date();
    const duration = startedAt ? endTime.getTime() - startedAt.getTime() : null;
    
    setError(error);
    setIsLoading(false);
    setEndedAt(endTime);
    setDuration(duration);
    
    onError?.(error);
    onComplete?.();
  }, [onError, onComplete, startedAt]);
  
  // Wrap an async operation with loading state
  const wrapPromise = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    if (!isMounted.current) return promise;
    
    const startTime = new Date();
    
    try {
      // Set loading state
      setIsLoading(true);
      setError(null);
      setStartedAt(startTime);
      setEndedAt(null);
      setDuration(null);
      
      // Call onStart callback
      onStart?.();
      
      // Await the promise
      const result = await promise;
      
      if (!isMounted.current) return result;
      
      // Calculate duration
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      // Update state
      setIsLoading(false);
      setEndedAt(endTime);
      setDuration(duration);
      
      // Call success callback
      onSuccess?.();
      onComplete?.();
      
      return result;
    } catch (error) {
      if (!isMounted.current) throw error;
      
      // Handle error
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setErrorState(errorObj);
      throw error;
    }
  }, [onStart, onSuccess, onComplete, setErrorState]);
  
  // Create the loading state object
  const loadingState: LoadingState = {
    isLoading,
    error,
    isSuccess: !isLoading && !error && endedAt !== null,
    isError: error !== null,
    startedAt,
    endedAt,
    duration,
    reset,
  };
  
  return [loadingState, wrapPromise, setErrorState, reset];
}

/**
 * Hook for a simple loading state
 */
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  
  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);
  const toggleLoading = useCallback(() => setIsLoading(prev => !prev), []);
  
  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
  };
}

/**
 * Hook for managing multiple loading states by key
 */
export function useLoadingStates() {
  const [states, setStates] = useState<Record<string, boolean>>({});
  
  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setStates(prev => ({
      ...prev,
      [key]: isLoading,
    }));
  }, []);
  
  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);
  
  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);
  
  const toggleLoading = useCallback((key: string) => {
    setStates(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);
  
  const isLoading = useCallback((key: string) => {
    return Boolean(states[key]);
  }, [states]);
  
  const resetAll = useCallback(() => {
    setStates({});
  }, []);
  
  return {
    states,
    isLoading,
    setLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    resetAll,
  };
}
