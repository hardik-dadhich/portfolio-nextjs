import { NextRequest, NextResponse } from 'next/server';
import { weeklyReadsDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { validateCSRFHeaders } from '@/lib/csrf-verification';
import { z } from 'zod';

const weeklyReadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  authors: z.string().min(1, 'Authors are required'),
  source: z.string().optional(),
  url: z.string().url('Must be a valid URL'),
  description: z.string().optional(),
  category: z.enum(['research', 'article', 'blog', 'documentation']),
  readDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

/**
 * GET /api/weekly-reads/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    
    if (isNaN(id) || id < 1) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }
    
    const read = await weeklyReadsDB.getReadById(id);
    
    if (!read) {
      return NextResponse.json(
        { error: 'Weekly read not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ read }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/weekly-reads/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly read' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/weekly-reads/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!validateCSRFHeaders(request.headers)) {
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      );
    }
    
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = parseInt(params.id, 10);
    
    if (isNaN(id) || id < 1) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }
    
    const existingRead = await weeklyReadsDB.getReadById(id);
    if (!existingRead) {
      return NextResponse.json(
        { error: 'Weekly read not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const validationResult = weeklyReadSchema.safeParse(body);
    
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      
      return NextResponse.json(
        { error: 'Validation failed', details: fieldErrors },
        { status: 400 }
      );
    }
    
    const read = await weeklyReadsDB.updateRead(id, validationResult.data);
    
    return NextResponse.json({ read }, { status: 200 });
  } catch (error) {
    console.error(`Error in PUT /api/weekly-reads/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update weekly read' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/weekly-reads/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!validateCSRFHeaders(request.headers)) {
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      );
    }
    
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = parseInt(params.id, 10);
    
    if (isNaN(id) || id < 1) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }
    
    const existingRead = await weeklyReadsDB.getReadById(id);
    if (!existingRead) {
      return NextResponse.json(
        { error: 'Weekly read not found' },
        { status: 404 }
      );
    }
    
    const success = await weeklyReadsDB.deleteRead(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete weekly read' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Weekly read deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in DELETE /api/weekly-reads/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete weekly read' },
      { status: 500 }
    );
  }
}
