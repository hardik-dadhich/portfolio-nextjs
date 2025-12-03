import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const blogsDirectory = path.join(process.cwd(), 'content/blog');

/**
 * GET /api/blogs/[slug] - Get a single blog post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const filePath = path.join(blogsDirectory, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const matterResult = matter(fileContents);

    const blog = {
      slug,
      title: matterResult.data.title || 'Untitled',
      date: matterResult.data.date || new Date().toISOString(),
      author: matterResult.data.author || 'Anonymous',
      summary: matterResult.data.summary || '',
      tags: matterResult.data.tags || [],
      content: matterResult.content,
    };

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/blogs/[slug] - Update a blog post
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug } = params;
    const body = await request.json();
    const { title, date, author, summary, tags, content, newSlug } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 }
      );
    }

    const oldFilePath = path.join(blogsDirectory, `${slug}.md`);

    if (!fs.existsSync(oldFilePath)) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Create markdown file with frontmatter
    const frontmatter = {
      title,
      date: date || new Date().toISOString().split('T')[0],
      author: author || 'Hardik Dadhich',
      summary: summary || '',
      tags: tags || [],
      slug: newSlug || slug,
    };

    const fileContent = matter.stringify(content, frontmatter);

    // If slug changed, rename the file
    if (newSlug && newSlug !== slug) {
      const newFilePath = path.join(blogsDirectory, `${newSlug}.md`);
      
      // Check if new slug already exists
      if (fs.existsSync(newFilePath)) {
        return NextResponse.json(
          { error: 'Blog post with new slug already exists' },
          { status: 409 }
        );
      }

      fs.writeFileSync(newFilePath, fileContent, 'utf8');
      fs.unlinkSync(oldFilePath);

      return NextResponse.json({
        message: 'Blog post updated successfully',
        slug: newSlug,
      });
    } else {
      fs.writeFileSync(oldFilePath, fileContent, 'utf8');

      return NextResponse.json({
        message: 'Blog post updated successfully',
        slug,
      });
    }
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blogs/[slug] - Delete a blog post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug } = params;
    const filePath = path.join(blogsDirectory, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({
      message: 'Blog post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
