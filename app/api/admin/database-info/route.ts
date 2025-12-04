import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { papersDB, adminDB, blogViewsDB } from '@/lib/db';

/**
 * GET /api/admin/database-info
 * 
 * View database statistics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get database statistics
    const [papers, adminUsers, blogViews] = await Promise.all([
      papersDB.getAllPapers(),
      adminDB.getAllUsers(),
      blogViewsDB.getAllViewCounts(),
    ]);

    const stats = {
      database: process.env.TURSO_DATABASE_URL ? 'Turso (Production)' : 'SQLite (Local)',
      papers: {
        total: papers.length,
        byType: {
          paper: papers.filter(p => p.type === 'paper').length,
          blog: papers.filter(p => p.type === 'blog').length,
        },
        recent: papers.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title,
          type: p.type,
          date: p.date,
        })),
      },
      adminUsers: {
        total: adminUsers.length,
        emails: adminUsers.map(u => u.email),
      },
      blogViews: {
        total: blogViews.size,
        topPosts: Array.from(blogViews.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([slug, count]) => ({ slug, views: count })),
      },
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Error fetching database info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database info' },
      { status: 500 }
    );
  }
}
