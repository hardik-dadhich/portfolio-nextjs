import { NextRequest, NextResponse } from 'next/server';
import { blogViewsDB } from '@/lib/db';
import { getPostBySlug } from '@/lib/blog';

/**
 * POST /api/blog/[slug]/view - Increment view count for a blog post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Validate slug parameter exists and is a string
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid slug parameter' },
        { status: 400 }
      );
    }

    // Sanitize slug to prevent SQL injection (alphanumeric, hyphens, underscores only)
    const sanitizedSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '');
    
    // Additional validation: ensure sanitized slug is not empty
    if (!sanitizedSlug) {
      return NextResponse.json(
        { error: 'Invalid slug format' },
        { status: 400 }
      );
    }

    // Verify blog post exists using getPostBySlug()
    const post = await getPostBySlug(sanitizedSlug);
    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Increment view count using blogViewsDB.incrementViewCount()
    const newViewCount = blogViewsDB.incrementViewCount(sanitizedSlug);

    // Return success response with updated view count
    return NextResponse.json({
      success: true,
      slug: sanitizedSlug,
      viewCount: newViewCount,
    });
  } catch (error) {
    console.error('Error tracking blog view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}
