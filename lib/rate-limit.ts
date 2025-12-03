/**
 * Rate Limiting Utility
 * 
 * Implements in-memory rate limiting for login attempts
 * - Limits to 5 attempts per 15 minutes per IP address
 * - Returns 429 status code when exceeded
 * 
 * Requirements: 4.3
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, consider using Redis or similar for distributed systems
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Clean up expired entries from the rate limit store
 * This prevents memory leaks by removing old entries
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Unique identifier (typically IP address)
 * @returns Object with isLimited flag and remaining attempts
 */
export function checkRateLimit(identifier: string): {
  isLimited: boolean;
  remaining: number;
  resetTime: number;
} {
  // Clean up expired entries periodically
  if (Math.random() < 0.1) { // 10% chance to clean up
    cleanupExpiredEntries();
  }

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No entry exists or entry has expired
  if (!entry || now > entry.resetTime) {
    const resetTime = now + WINDOW_MS;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });

    return {
      isLimited: false,
      remaining: MAX_ATTEMPTS - 1,
      resetTime,
    };
  }

  // Entry exists and is still valid
  if (entry.count >= MAX_ATTEMPTS) {
    return {
      isLimited: true,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count += 1;
  rateLimitStore.set(identifier, entry);

  return {
    isLimited: false,
    remaining: MAX_ATTEMPTS - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Reset rate limit for a specific identifier
 * Useful for clearing limits after successful authentication
 * 
 * @param identifier - Unique identifier (typically IP address)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get the client IP address from request headers
 * Handles various proxy headers
 * 
 * @param headers - Request headers
 * @returns IP address or 'unknown'
 */
export function getClientIp(headers: Headers): string {
  // Check common proxy headers
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to a generic identifier
  return 'unknown';
}
