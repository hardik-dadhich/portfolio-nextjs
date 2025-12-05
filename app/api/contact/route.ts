import { NextRequest, NextResponse } from 'next/server';
import { validateContactForm, sendContactEmail } from '@/lib/email';
import { ContactFormData } from '@/lib/types';
import { contactRateLimiter } from '@/lib/contact-rate-limit';

const MAX_SUBMISSIONS = 3;
const WINDOW_HOURS = 24;

export async function POST(request: NextRequest) {
  try {
    // Parse request body first to get email
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

    // Validate form data first
    const validation = validateContactForm(formData);
    
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Check rate limit based on email address
    const rateLimitCheck = await contactRateLimiter.checkRateLimit(formData.email);
    
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: rateLimitCheck.message || `You can only send ${MAX_SUBMISSIONS} messages per ${WINDOW_HOURS} hours. Please try again later.`,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': MAX_SUBMISSIONS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitCheck.resetAt?.toISOString() || '',
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
            'X-RateLimit-Limit': MAX_SUBMISSIONS.toString(),
            'X-RateLimit-Remaining': rateLimitCheck.remaining.toString(),
          }
        }
      );
    }

    // Record successful submission
    await contactRateLimiter.recordSubmission(formData.email);

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message! I\'ll get back to you soon.',
      },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Limit': MAX_SUBMISSIONS.toString(),
          'X-RateLimit-Remaining': (rateLimitCheck.remaining - 1).toString(),
          'X-RateLimit-Reset': rateLimitCheck.resetAt?.toISOString() || '',
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
