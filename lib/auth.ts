import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { adminDB } from './db';
import { loginSchema } from './validations';

/**
 * NextAuth.js v5 Configuration
 * 
 * Implements authentication for the admin panel with:
 * - Credentials provider (email/password)
 * - JWT session strategy with 24-hour expiration
 * - Password verification with bcrypt
 * - Route protection for admin dashboard
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 10.1, 10.2, 10.3, 10.4
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'admin@example.com'
        },
        password: { 
          label: 'Password', 
          type: 'password' 
        }
      },
      async authorize(credentials) {
        try {
          // Validate credentials format
          const validatedCredentials = loginSchema.safeParse(credentials);
          
          if (!validatedCredentials.success) {
            console.error('Invalid credentials format:', validatedCredentials.error);
            return null;
          }

          const { email, password } = validatedCredentials.data;

          // Fetch user from database
          const user = adminDB.getUserByEmail(email);
          
          if (!user) {
            console.error('User not found:', email);
            return null;
          }

          // Verify password with bcrypt
          const isValidPassword = await bcrypt.compare(password, user.passwordHash);
          
          if (!isValidPassword) {
            console.error('Invalid password for user:', email);
            return null;
          }

          // Return user object for session
          return {
            id: user.id.toString(),
            email: user.email,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    })
  ],
  
  // JWT session strategy with 24-hour expiration
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours in seconds
  },
  
  // Custom pages
  pages: {
    signIn: '/admin/login',
  },
  
  // Callbacks for session and authorization
  callbacks: {
    // Authorized callback for route protection
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdminDashboard = nextUrl.pathname.startsWith('/admin/dashboard');
      
      // Protect admin dashboard routes
      if (isOnAdminDashboard) {
        if (isLoggedIn) {
          return true; // Allow access
        }
        return false; // Redirect to login (handled by middleware)
      }
      
      // Allow access to all other routes
      return true;
    },
    
    // JWT callback to add custom fields to token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    
    // Session callback to add custom fields to session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    }
  },
  
  // Security settings
  secret: process.env.NEXTAUTH_SECRET,
  
  // Cookie configuration with security flags
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  
  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
});
