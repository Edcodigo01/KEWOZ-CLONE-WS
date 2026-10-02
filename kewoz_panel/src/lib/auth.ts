import { jwtDecode } from 'jwt-decode';

/**
 * Interface for the decoded JWT token
 */
export interface DecodedToken {
  userId?: string;
  email?: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

/**
 * Checks if a JWT token is expired
 * @param token The JWT token to check
 * @returns boolean indicating if the token is expired
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  
  try {
    const decoded = decodeToken(token);
    if (!decoded?.exp) return true;
    
    const currentTime = Date.now() / 1000; // Convert to seconds
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}

/**
 * Decodes a JWT token without verification
 * @param token The JWT token to decode
 * @returns Decoded token or null if invalid
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Extracts the user ID from a JWT token
 * @param token The JWT token
 * @returns User ID or null if not found
 */
export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.userId || null;
}

/**
 * Extracts the expiration time from a JWT token
 * @param token The JWT token
 * @returns Expiration time in seconds or null if not found
 */
export function getTokenExpiration(token: string | null): number | null {
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.exp || null;
}
