// String Helpers
export const truncate = (str: string, max: number, ellipsis = '...'): string => 
  str.length <= max ? str : `${str.slice(0, max)}${ellipsis}`;

export const capitalize = (str: string): string => 
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const slugify = (str: string): string => 
  str.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s-]+/g, '-');

// Number Helpers
export const formatCurrency = (value: number, locale = 'en-US', currency = 'USD'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);

export const formatPercentage = (value: number, decimals = 2): string =>
  `${(value * 100).toFixed(decimals)}%`;

// Array Helpers
export const unique = <T>(arr: T[]): T[] => [...new Set(arr)];

export const groupBy = <T>(arr: T[], key: keyof T | ((item: T) => string)): Record<string, T[]> => 
  arr.reduce((acc, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
    acc[groupKey] = [...(acc[groupKey] || []), item];
    return acc;
  }, {} as Record<string, T[]>);

// Object Helpers
export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => 
  keys.reduce((acc, key) => (key in obj && (acc[key] = obj[key]), acc), {} as Pick<T, K>);

export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

// Date Helpers
export const formatDate = (date: Date | string, locale = 'en-US'): string =>
  new Date(date).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });

export const timeAgo = (date: Date | string): string => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals = { year: 31536000, month: 2592000, day: 86400, hour: 3600, minute: 60 };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
  }
  return 'just now';
};

// Type Guards
export const isObject = (value: unknown): value is object => 
  value !== null && typeof value === 'object';

export const isFunction = (value: unknown): value is Function => 
  typeof value === 'function';

export const isString = (value: unknown): value is string => 
  typeof value === 'string';

// Promise Helpers
export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const retry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};
