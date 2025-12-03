import { NextRequest, NextResponse } from 'next/server';
import { validateContactForm, sendContactEmail } from '@/lib/email';
import { ContactFormData } from '@/lib/types';

// Simple in-memory rate limiting
// In production, use Redis or a proper rate limiting service
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 5; // Maximum 5 submissions per hour per IP

/**
 * Check if the request should be rate limited
 */
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  // Increment count
  record.count += 1;
  rateLimitMap.set(identifier, record);

  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

/**
 * Clean up old rate limit records periodically
 */
function cleanupRateLimitMap() {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  rateLimitMap.forEach((record, key) => {
    if (now > record.resetTime) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => rateLimitMap.delete(key));
}

// Run cleanup every 10 minutes
setInterval(cleanupRateLimitMap, 10 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    // Get client identifier (IP address or fallback)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    
    // Check rate limit
    const { allowed, remaining } = checkRateLimit(ip);
    
    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many requests. Please try again later.',
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields exist
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request body',
        },
        { status: 400 }
      );
    }

    const formData: ContactFormData = {
      name: body.name || '',
      email: body.email || '',
      message: body.message || '',
      preferredTime: body.preferredTime || '',
    };

    // Validate form data
    const validation = validateContactForm(formData);
    
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        },
        { 
          status: 400,
          headers: {
            'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
          }
        }
      );
    }

    // Send email
    const emailSent = await sendContactEmail(formData);

    if (!emailSent) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send email. Please try again later or contact me directly.',
        },
        { 
          status: 500,
          headers: {
            'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
          }
        }
      );
    }

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message! I\'ll get back to you soon.',
      },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
        }
      }
    );

  } catch (error) {
    console.error('Error processing contact form:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed',
    },
    { status: 405 }
  );
}
