/**
 * Storage utilities for handling localStorage, sessionStorage, and cookies
 */

// LocalStorage Wrapper
export const storage = {
  get: <T>(key: string, defaultValue: T | null = null): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// SessionStorage Wrapper
export const session = {
  get: <T>(key: string, defaultValue: T | null = null): T | null => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from sessionStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  },

  clear: (): void => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  },
};

// Cookie Utilities
export const cookies = {
  get: (name: string): string | null => {
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    } catch (error) {
      console.error(`Error getting cookie "${name}":`, error);
      return null;
    }
  },

  set: (name: string, value: string, days = 7, path = '/'): void => {
    try {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = `expires=${date.toUTCString()}`;
      document.cookie = `${name}=${value};${expires};path=${path};samesite=lax`;
    } catch (error) {
      console.error(`Error setting cookie "${name}":`, error);
    }
  },

  remove: (name: string, path = '/'): void => {
    try {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
    } catch (error) {
      console.error(`Error removing cookie "${name}":`, error);
    }
  },
};

// Secure Storage with Encryption (AES-256)
const SECRET_KEY = process.env['REACT_APP_STORAGE_SECRET'] || 'default-secret-key';

const generateKey = async (secret: string): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('secure-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

export const secureStorage = {
  encrypt: async (data: string): Promise<string> => {
    try {
      const key = await generateKey(SECRET_KEY);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encoder = new TextEncoder();
      const encoded = encoder.encode(data);
      
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
      );

      // Combine IV and encrypted data
      const result = new Uint8Array(iv.length + encrypted.byteLength);
      result.set(iv, 0);
      result.set(new Uint8Array(encrypted), iv.length);

      // Convert to base64 for storage
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  },

  decrypt: async (data: string): Promise<string> => {
    try {
      const key = await generateKey(SECRET_KEY);
      const decoded = Uint8Array.from(atob(data), c => c.charCodeAt(0));
      
      // Extract IV and encrypted data
      const iv = decoded.slice(0, 12);
      const encrypted = decoded.slice(12);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  },
};

// Storage with expiration
export const expiringStorage = {
  set: <T>(key: string, value: T, ttl: number): void => {
    const now = new Date();
    const item = {
      value,
      expiry: now.getTime() + ttl,
    };
    storage.set(key, item);
  },

  get: <T>(key: string, defaultValue: T | null = null): T | null => {
    const item = storage.get<{ value: T; expiry: number }>(key);
    
    if (!item) return defaultValue;
    
    const now = new Date().getTime();
    if (now > item.expiry) {
      storage.remove(key);
      return defaultValue;
    }
    
    return item.value;
  },
};
