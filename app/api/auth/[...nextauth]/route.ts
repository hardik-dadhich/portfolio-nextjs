import { handlers } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, resetRateLimit } from '@/lib/rate-limit';

/**
 * NextAuth.js API Route Handler with Rate Limiting
 * 
 * This route handles all authentication requests including:
 * - Sign in (with rate limiting)
 * - Sign out
 * - Session management
 * - Callback handling
 * 
 * Rate limiting is applied to login attempts:
 * - Maximum 5 attempts per 15 minutes per IP address
 * - Returns 429 status code when limit is exceeded
 * 
 * Requirements: 4.1, 4.2, 4.3
 */

// Wrap GET handler (no rate limiting needed for GET requests)
export const GET = handlers.GET;

// Wrap POST handler with rate limiting for login attempts
export async function POST(request: NextRequest) {
  try {
    // Get client IP address
    const clientIp = getClientIp(request.headers);
    
    // Check if this is a sign-in request (credentials provider)
    const url = new URL(request.url);
    const isSignIn = url.pathname.includes('/signin') || url.pathname.includes('/callback/credentials');
    
    // Apply rate limiting only to sign-in attempts
    if (isSignIn) {
      const { isLimited, remaining, resetTime } = checkRateLimit(clientIp);
      
      if (isLimited) {
        const resetDate = new Date(resetTime);
        const minutesUntilReset = Math.ceil((resetTime - Date.now()) / 60000);
        
        return NextResponse.json(
          {
            error: 'Too many login attempts. Please try again later.',
            details: {
              message: `Rate limit exceeded. Please try again in ${minutesUntilReset} minute(s).`,
              resetTime: resetDate.toISOString(),
            }
          },
          { 
            status: 429,
            headers: {
              'Retry-After': minutesUntilReset.toString(),
              'X-RateLimit-Limit': '5',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': resetDate.toISOString(),
            }
          }
        );
      }
      
      // Add rate limit headers to response
      const response = await handlers.POST(request);
      
      // If login was successful (status 200 or redirect), reset the rate limit
      if (response.status === 200 || response.status === 302) {
        resetRateLimit(clientIp);
      }
      
      // Add rate limit info to response headers
      response.headers.set('X-RateLimit-Limit', '5');
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
      
      return response;
    }
    
    // For non-sign-in requests, pass through without rate limiting
    return handlers.POST(request);
  } catch (error) {
    console.error('Error in auth POST handler:', error);
    return handlers.POST(request);
  }
}
