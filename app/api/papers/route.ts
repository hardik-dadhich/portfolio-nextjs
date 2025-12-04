import { NextRequest, NextResponse } from 'next/server';
import { papersDB } from '@/lib/db';
import { paperFormSchema } from '@/lib/validations';
import { auth } from '@/lib/auth';
import { validateCSRFHeaders } from '@/lib/csrf-verification';
import type { PapersResponse } from '@/lib/types';

/**
 * GET /api/papers
 * 
 * Fetch papers with optional filtering and pagination
 * Query params:
 * - limit: Maximum number of papers to return (optional)
 * - offset: Number of papers to skip (optional, default: 0)
 * - type: Filter by paper type ('paper' or 'blog') (optional)
 * 
 * Requirements: 2.1, 2.2, 2.3, 8.1, 8.2
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const typeParam = searchParams.get('type');
    
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    const type = typeParam || undefined;
    
    // Validate parameters
    if (limitParam && (isNaN(limit!) || limit! < 1)) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be a positive integer.' },
        { status: 400 }
      );
    }
    
    if (offsetParam && (isNaN(offset) || offset < 0)) {
      return NextResponse.json(
        { error: 'Invalid offset parameter. Must be a non-negative integer.' },
        { status: 400 }
      );
    }
    
    if (type && type !== 'paper' && type !== 'blog') {
      return NextResponse.json(
        { error: 'Invalid type parameter. Must be "paper" or "blog".' },
        { status: 400 }
      );
    }
    
    // Fetch papers from database
    const papers = await papersDB.getAllPapers(limit, offset, type);
    const total = await papersDB.getTotalCount(type);
    
    // Determine if there are more papers
    const hasMore = limit ? (offset + limit) < total : false;
    
    const response: PapersResponse = {
      papers,
      total,
      hasMore,
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/papers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/papers
 * 
 * Create a new paper entry
 * Requires authentication
 * Body: PaperFormData
 * 
 * Requirements: 5.2, 5.4
 */
export async function POST(request: NextRequest) {
  try {
    // Validate CSRF protection
    if (!validateCSRFHeaders(request.headers)) {
      return NextResponse.json(
        { error: 'Invalid request origin. CSRF validation failed.' },
        { status: 403 }
      );
    }
    
    // Check authentication
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to create papers.' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data with Zod schema
    const validationResult = paperFormSchema.safeParse(body);
    
    if (!validationResult.success) {
      // Extract field-specific errors
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      
      return NextResponse.json(
        { 
          error: 'Validation failed. Please check your input.',
          details: fieldErrors 
        },
        { status: 400 }
      );
    }
    
    // Create paper in database
    const paper = await papersDB.createPaper(validationResult.data);
    
    return NextResponse.json(
      { paper },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/papers:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create paper. Please try again later.' },
      { status: 500 }
    );
  }
}
