import { NextRequest, NextResponse } from 'next/server';
import { weeklyReadsDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { validateCSRFHeaders } from '@/lib/csrf-verification';
import type { WeeklyReadsResponse } from '@/lib/types';
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
 * GET /api/weekly-reads
 * Fetch weekly reads with optional pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    
    if (limitParam && (isNaN(limit!) || limit! < 1)) {
      return NextResponse.json(
        { error: 'Invalid limit parameter' },
        { status: 400 }
      );
    }
    
    if (offsetParam && (isNaN(offset) || offset < 0)) {
      return NextResponse.json(
        { error: 'Invalid offset parameter' },
        { status: 400 }
      );
    }
    
    const reads = await weeklyReadsDB.getAllReads(limit, offset);
    const total = await weeklyReadsDB.getTotalCount();
    const hasMore = limit ? (offset + limit) < total : false;
    
    const response: WeeklyReadsResponse = {
      reads,
      total,
      hasMore,
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/weekly-reads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly reads' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/weekly-reads
 * Create a new weekly read entry (admin only)
 */
export async function POST(request: NextRequest) {
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
    
    const read = await weeklyReadsDB.createRead(validationResult.data);
    
    return NextResponse.json({ read }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/weekly-reads:', error);
    return NextResponse.json(
      { error: 'Failed to create weekly read' },
      { status: 500 }
    );
  }
}
