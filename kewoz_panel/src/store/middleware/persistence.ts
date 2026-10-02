import { StateStorage, StorageValue } from 'zustand/middleware';
import { z } from 'zod';

/**
 * Storage options for persistence
 */
export interface PersistenceOptions<T> {
  /**
   * Storage key
   */
  key: string;
  
  /**
   * Storage engine to use (default: localStorage)
   */
  storage?: () => StateStorage;
  
  /**
   * Version for migrations
   */
  version?: number;
  
  /**
   * Schema for runtime validation
   */
  schema?: z.ZodType<T>;
  
  /**
   * Partialize state to persist only specific parts
   */
  partialize?: (state: T) => Partial<T>;
  
  /**
   * Merge function for partial updates
   */
  merge?: (persisted: unknown, current: T) => T;
  
  /**
   * Migration function for version updates
   */
  migrate?: (persistedState: any, version: number) => T;
  
  /**
   * Error handler for persistence errors
   */
  onError?: (error: unknown) => void;
}

/**
 * Default storage implementation using localStorage
 */
const createDefaultStorage = (): StateStorage => ({
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.warn(`Error reading from localStorage:`, error);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.warn(`Error writing to localStorage:`, error);
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.warn(`Error removing from localStorage:`, error);
    }
  },
});

/**
 * Create a persistence middleware with type safety and validation
 */
export function withPersistence<T>(
  options: PersistenceOptions<T>
): (config: any) => any {
  const {
    key,
    storage = createDefaultStorage,
    version = 0,
    schema,
    partialize = (state) => state as unknown as Partial<T>,
    merge = (persisted, current) => ({
      ...current,
      ...(persisted as object),
    }),
    migrate = (persistedState) => persistedState as T,
    onError = (error) => {
      console.error('Persistence error:', error);
    },
  } = options;

  return (config) => (set, get, api) => {
    let storageInstance: StateStorage | null = null;
    let isHydrating = true;
    let hasHydrated = false;

    // Try to get the storage instance
    try {
      storageInstance = storage();
    } catch (error) {
      onError(error);
    }

    // Function to save state to storage
    const saveState = (state: T) => {
      if (!storageInstance || isHydrating) return;

      try {
        const stateToPersist = partialize(state);
        const storageValue: StorageValue<T> = {
          state: stateToPersist,
          version,
        };
        storageInstance.setItem(key, JSON.stringify(storageValue));
      } catch (error) {
        onError(error);
      }
    };

    // Function to load state from storage
    const loadState = (): T | undefined => {
      if (!storageInstance) return undefined;

      try {
        const json = storageInstance.getItem(key);
        if (!json) return undefined;

        const parsed = JSON.parse(json);
        
        // Validate version
        if (parsed.version !== version) {
          console.warn(
            `Storage version mismatch: expected ${version}, got ${parsed.version}`
          );
          // Run migration if version is different
          return migrate(parsed.state, parsed.version);
        }

        // Validate schema if provided
        if (schema) {
          const result = schema.safeParse(parsed.state);
          if (!result.success) {
            console.warn('Invalid stored state:', result.error);
            return undefined;
          }
          return result.data;
        }

        return parsed.state;
      } catch (error) {
        onError(error);
        return undefined;
      }
    };

    // Create the store with persistence
    const initialState = config(
      (...args) => {
        set(...args);
        if (!isHydrating) {
          saveState(get());
        }
      },
      get,
      {
        ...api,
        // Add persistence methods to the store
        persist: {
          getOptions: () => options,
          hasHydrated: () => hasHydrated,
          onFinishHydration: (fn: () => void) => {
            const unsub = api.subscribe(() => {
              if (hasHydrated) {
                fn();
                unsub();
              }
            });
            return unsub;
          },
          rehydrate: async () => {
            if (hasHydrated) return;
            
            isHydrating = true;
            try {
              const savedState = loadState();
              if (savedState) {
                set((state: T) => merge(savedState, state) as T);
              }
            } catch (error) {
              onError(error);
            } finally {
              isHydrating = false;
              hasHydrated = true;
              set({} as T); // Trigger a re-render
            }
          },
          clearStorage: () => {
            if (storageInstance) {
              storageInstance.removeItem(key);
            }
          },
        },
      }
    );

    // Initial hydration
    if (storageInstance) {
      api.persist?.rehydrate();
    } else {
      hasHydrated = true;
    }

    return {
      ...initialState,
      // Add a way to check if the store has been hydrated
      _hasHydrated: hasHydrated,
    };
  };
}

/**
 * Create a storage with encryption
 */
export function createEncryptedStorage(
  encryptionKey: string,
  storage: StateStorage = createDefaultStorage()
): StateStorage {
  // In a real app, you would use a proper encryption library like Web Crypto API
  const encrypt = (data: string): string => {
    // Simple XOR encryption for demonstration
    // In production, use a proper encryption library
    return btoa(
      data
        .split('')
        .map((char, i) =>
          String.fromCharCode(char.charCodeAt(0) ^ encryptionKey.charCodeAt(i % encryptionKey.length))
        )
        .join('')
    );
  };

  const decrypt = (data: string): string => {
    try {
      const decoded = atob(data);
      return decoded
        .split('')
        .map((char, i) =>
          String.fromCharCode(char.charCodeAt(0) ^ encryptionKey.charCodeAt(i % encryptionKey.length))
        )
        .join('');
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  };

  return {
    getItem: (name) => {
      const value = storage.getItem(name);
      return value ? decrypt(value) : null;
    },
    setItem: (name, value) => {
      storage.setItem(name, encrypt(value));
    },
    removeItem: (name) => {
      storage.removeItem(name);
    },
  };
}

/**
 * Create a storage with TTL (Time To Live)
 */
export function createTTLStorage(
  ttl: number, // in milliseconds
  storage: StateStorage = createDefaultStorage()
): StateStorage {
  return {
    getItem: (name) => {
      const item = storage.getItem(name);
      if (!item) return null;

      try {
        const { value, timestamp } = JSON.parse(item);
        const isExpired = Date.now() - timestamp > ttl;
        
        if (isExpired) {
          storage.removeItem(name);
          return null;
        }
        
        return value;
      } catch (error) {
        console.error('Error parsing TTL storage item:', error);
        return null;
      }
    },
    setItem: (name, value) => {
      const item = JSON.stringify({
        value,
        timestamp: Date.now(),
      });
      storage.setItem(name, item);
    },
    removeItem: (name) => {
      storage.removeItem(name);
    },
  };
}

/**
 * Create a storage with compression
 */
export function createCompressedStorage(
  storage: StateStorage = createDefaultStorage()
): StateStorage {
  // In a real app, you would use a proper compression library like pako
  const compress = (data: string): string => {
    // Simple Base64 compression for demonstration
    // In production, use a proper compression library
    return btoa(encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, (match, p1) => 
      String.fromCharCode(parseInt(p1, 16))
    ));
  };

  const decompress = (data: string): string => {
    try {
      return decodeURIComponent(
        atob(data)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch (error) {
      console.error('Decompression failed:', error);
      return '';
    }
  };

  return {
    getItem: (name) => {
      const value = storage.getItem(name);
      return value ? decompress(value) : null;
    },
    setItem: (name, value) => {
      storage.setItem(name, compress(value));
    },
    removeItem: (name) => {
      storage.removeItem(name);
    },
  };
}
