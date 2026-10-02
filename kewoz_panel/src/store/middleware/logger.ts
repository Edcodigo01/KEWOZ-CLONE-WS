import type { StoreApi } from 'zustand';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LoggerOptions<T> {
  enabled?: boolean | (() => boolean);
  logLevel?: LogLevel;
  collapsed?: boolean;
  filter?: (action: string, state: T) => boolean;
}

const defaultOptions: Required<Omit<LoggerOptions<any>, 'prevState'>> = {
  enabled: process.env.NODE_ENV === 'development',
  logLevel: 'debug',
  collapsed: true,
  filter: () => true,
};

export function withLogger<T>(options: LoggerOptions<T> = {}) {
  const config = { ...defaultOptions, ...options };
  const isEnabled = typeof config.enabled === 'function' 
    ? config.enabled() 
    : config.enabled;

  if (!isEnabled) return (fn: any) => fn;

  return <U>(fn: StoreApi<T>) => (set: any, get: any, api: any) => {
    const { setState, getState, subscribe, destroy } = fn(set, get, api);
    let prevState = { ...getState() } as T;
    let actionCount = 0;

    const unsubscribe = subscribe((state: T) => {
      if (actionCount === 0) {
        actionCount++;
        return;
      }

      const stack = new Error().stack?.split('\n') || [];
      const actionMatch = stack[3]?.match(/at\s+(\w+)/);
      const action = actionMatch ? actionMatch[1] : 'anonymous';

      if (!config.filter(action, state)) return;

      const time = new Date().toLocaleTimeString();
      const logGroup = config.collapsed ? console.groupCollapsed : console.group;
      
      logGroup(`%c action ${time} ${action}`, 'color: #9e9e9e; font-weight: bold');
      
      console.log('%c prev state', 'color: #9e9e9e; font-weight: bold', prevState);
      console.log('%c action', 'color: #03a9f4; font-weight: bold', action);
      console.log('%c next state', 'color: #4caf50; font-weight: bold', state);
      
      if (config.collapsed) console.groupEnd();
      
      prevState = { ...state } as T;
      actionCount++;
    });

    const setStateWithLogging: typeof setState = (partial: any, replace: any) => {
      return setState(partial, replace);
    };

    if (isEnabled) {
      console.log('%c initial state', 'color: #9e9e9e; font-weight: bold', getState());
    }

    return {
      setState: setStateWithLogging,
      getState,
      subscribe,
      destroy: () => {
        unsubscribe();
        return destroy();
      },
    };
  };
}

// Helper function to create a namespaced logger
export function createLogger(namespace: string) {
  return {
    log: (...args: any[]) => console.log(`[${namespace}]`, ...args),
    info: (...args: any[]) => console.info(`[${namespace}]`, ...args),
    warn: (...args: any[]) => console.warn(`[${namespace}]`, ...args),
    error: (...args: any[]) => console.error(`[${namespace}]`, ...args),
    debug: (...args: any[]) => 
      process.env.NODE_ENV === 'development' && console.debug(`[${namespace}]`, ...args),
  };
}

// Create a global store logger
export const logger = createLogger('store');
