import { NextRequest, NextResponse } from 'next/server';
import { papersDB } from '@/lib/db';
import { paperFormSchema } from '@/lib/validations';
import { auth } from '@/lib/auth';
import { validateCSRFHeaders } from '@/lib/csrf-verification';

/**
 * GET /api/papers/[id]
 * 
 * Fetch a single paper by ID
 * 
 * Requirements: 6.2
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    
    // Validate ID parameter
    if (isNaN(id) || id < 1) {
      return NextResponse.json(
        { error: 'Invalid paper ID. Must be a positive integer.' },
        { status: 400 }
      );
    }
    
    // Fetch paper from database
    const paper = await papersDB.getPaperById(id);
    
    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ paper }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/papers/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch paper. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/papers/[id]
 * 
 * Update an existing paper entry
 * Requires authentication
 * Body: PaperFormData
 * 
 * Requirements: 6.3, 6.4
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Unauthorized. Please log in to update papers.' },
        { status: 401 }
      );
    }
    
    const id = parseInt(params.id, 10);
    
    // Validate ID parameter
    if (isNaN(id) || id < 1) {
      return NextResponse.json(
        { error: 'Invalid paper ID. Must be a positive integer.' },
        { status: 400 }
      );
    }
    
    // Check if paper exists
    const existingPaper = await papersDB.getPaperById(id);
    
    if (!existingPaper) {
      return NextResponse.json(
        { error: 'Paper not found.' },
        { status: 404 }
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
    
    // Update paper in database
    const paper = await papersDB.updatePaper(id, validationResult.data);
    
    return NextResponse.json(
      { paper },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in PUT /api/papers/${params.id}:`, error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update paper. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/papers/[id]
 * 
 * Delete a paper entry
 * Requires authentication
 * 
 * Requirements: 7.3, 7.4
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Unauthorized. Please log in to delete papers.' },
        { status: 401 }
      );
    }
    
    const id = parseInt(params.id, 10);
    
    // Validate ID parameter
    if (isNaN(id) || id < 1) {
      return NextResponse.json(
        { error: 'Invalid paper ID. Must be a positive integer.' },
        { status: 400 }
      );
    }
    
    // Check if paper exists
    const existingPaper = await papersDB.getPaperById(id);
    
    if (!existingPaper) {
      return NextResponse.json(
        { error: 'Paper not found.' },
        { status: 404 }
      );
    }
    
    // Delete paper from database
    const success = await papersDB.deletePaper(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete paper.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Paper deleted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in DELETE /api/papers/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete paper. Please try again later.' },
      { status: 500 }
    );
  }
}
