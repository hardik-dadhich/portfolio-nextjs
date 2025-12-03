import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Route Protection
 * 
 * This middleware protects admin routes by:
 * - Checking authentication status for /admin/dashboard routes
 * - Redirecting unauthenticated users to the login page
 * - Allowing authenticated users to access protected routes
 * 
 * Note: Uses cookie-based session checking to avoid Edge Runtime issues
 * 
 * Requirements: 4.4
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user is trying to access admin dashboard
  const isOnAdminDashboard = pathname.startsWith('/admin/dashboard');
  
  if (isOnAdminDashboard) {
    // Check for NextAuth session cookie
    const sessionCookie = request.cookies.get('next-auth.session-token') || 
                         request.cookies.get('__Secure-next-auth.session-token');
    
    const isLoggedIn = !!sessionCookie;
    
    // Redirect unauthenticated users to login page
    if (!isLoggedIn) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Allow access to authenticated users or non-protected routes
  return NextResponse.next();
}

/**
 * Middleware Configuration
 * 
 * Specify which routes should be processed by this middleware
 * - Only run on /admin routes (excluding /admin/login)
 * - This prevents middleware from interfering with other routes
 */
export const config = {
  matcher: [
    '/admin/dashboard/:path*',
  ],
};
