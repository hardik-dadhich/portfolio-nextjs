import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const blogsDirectory = path.join(process.cwd(), 'content/blog');

/**
 * GET /api/blogs - Get all blog posts
 */
export async function GET(request: NextRequest) {
  try {
    // Ensure directory exists
    if (!fs.existsSync(blogsDirectory)) {
      fs.mkdirSync(blogsDirectory, { recursive: true });
    }

    const fileNames = fs.readdirSync(blogsDirectory);
    const markdownFiles = fileNames.filter(fileName => fileName.endsWith('.md'));

    const blogs = markdownFiles.map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(blogsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      return {
        slug,
        title: matterResult.data.title || 'Untitled',
        date: matterResult.data.date || new Date().toISOString(),
        author: matterResult.data.author || 'Anonymous',
        summary: matterResult.data.summary || '',
        tags: matterResult.data.tags || [],
        content: matterResult.content,
      };
    });

    // Sort by date descending
    blogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ blogs, total: blogs.length });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blogs - Create a new blog post
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, date, author, summary, tags, content, slug } = body;

    // Validate required fields
    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, slug' },
        { status: 400 }
      );
    }

    // Ensure directory exists
    if (!fs.existsSync(blogsDirectory)) {
      fs.mkdirSync(blogsDirectory, { recursive: true });
    }

    // Create markdown file with frontmatter
    const frontmatter = {
      title,
      date: date || new Date().toISOString().split('T')[0],
      author: author || 'Hardik Dadhich',
      summary: summary || '',
      tags: tags || [],
      slug,
    };

    const fileContent = matter.stringify(content, frontmatter);
    const filePath = path.join(blogsDirectory, `${slug}.md`);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Blog post with this slug already exists' },
        { status: 409 }
      );
    }

    fs.writeFileSync(filePath, fileContent, 'utf8');

    return NextResponse.json(
      { message: 'Blog post created successfully', slug },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
