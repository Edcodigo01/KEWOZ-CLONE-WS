// Date/Time Formatters

export const formatDate = (date: Date | string, locale = 'en-US'): string => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date | string, locale = 'en-US'): string => {
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeAgo = (date: Date | string): string => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'just now';
};

// Number Formatters

export const formatCurrency = (
  value: number, 
  locale = 'en-US', 
  currency = 'USD'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};

export const formatNumber = (
  value: number, 
  locale = 'en-US',
  options: Intl.NumberFormatOptions = {}
): string => {
  return new Intl.NumberFormat(locale, options).format(value);
};

// Text Formatters

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const titleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// File Size Formatter

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Phone Number Formatter

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = ('' + phone).replace(/\D/g, '');
  
  // Check if number contains country code
  const hasCountryCode = cleaned.length > 10;
  
  // Format: (123) 456-7890 or +1 (123) 456-7890
  const match = cleaned.match(hasCountryCode ? 
    /^(\d{1})(\d{3})(\d{3})(\d{4})$/ : 
    /^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    if (hasCountryCode) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    }
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phone; // Return original if format doesn't match
};

// Address Formatter

type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export const formatAddress = (address: Address): string => {
  const parts = [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
  ];
  
  return parts.filter(Boolean).join('\n');
};

// JSON Formatter

export const formatJSON = (data: unknown): string => {
  return JSON.stringify(data, null, 2);
};

// URL Formatter

export const formatUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '') + urlObj.pathname;
  } catch {
    return url;
  }
};

// Initials Formatter

export const formatInitials = (name: string, count = 2): string => {
  return name
    .split(' ')
    .slice(0, count)
    .map(part => part[0]?.toUpperCase() || '')
    .join('');
};
