import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { BlogPost } from './types';
import { blogViewsDB } from './db';

const postsDirectory = path.join(process.cwd(), 'content/blog');

/**
 * Calculate estimated read time based on word count
 * Assumes average reading speed of 200 words per minute
 */
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return readTime;
}

/**
 * Parse markdown content to HTML using remark
 */
export async function parseMarkdown(content: string): Promise<string> {
  const processedContent = await remark()
    .use(html, { sanitize: false })
    .process(content);
  return processedContent.toString();
}

/**
 * Get all blog posts from the content/blog directory
 * Returns posts sorted in reverse chronological order
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    // Check if directory exists
    if (!fs.existsSync(postsDirectory)) {
      console.warn(`Blog directory not found: ${postsDirectory}`);
      return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const markdownFiles = fileNames.filter(fileName => fileName.endsWith('.md'));

    const allPostsData = await Promise.all(
      markdownFiles.map(async (fileName) => {
        // Remove ".md" from file name to get slug
        const slug = fileName.replace(/\.md$/, '');

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);

        // Calculate read time from content
        const readTime = calculateReadTime(matterResult.content);

        // Parse markdown content to HTML
        const contentHtml = await parseMarkdown(matterResult.content);

        // Combine the data with the slug
        return {
          slug,
          title: matterResult.data.title || 'Untitled',
          date: matterResult.data.date || new Date().toISOString(),
          author: matterResult.data.author || 'Anonymous',
          summary: matterResult.data.summary || '',
          tags: matterResult.data.tags || [],
          content: contentHtml,
          readTime,
          viewCount: 0, // Will be populated below
        } as BlogPost;
      })
    );

    // Fetch all view counts in a single query
    const viewCounts = await blogViewsDB.getAllViewCounts();
    
    // Map view counts to blog posts by slug
    const postsWithViews = allPostsData.map(post => ({
      ...post,
      viewCount: viewCounts.get(post.slug) || 0,
    }));

    // Sort posts by date in descending order (newest first)
    return postsWithViews.sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    });
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
}

/**
 * Get a single blog post by slug
 * Returns null if post is not found
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.warn(`Blog post not found: ${slug}`);
      return null;
    }

    // Read markdown file as string
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Calculate read time from content
    const readTime = calculateReadTime(matterResult.content);

    // Parse markdown content to HTML
    const contentHtml = await parseMarkdown(matterResult.content);

    // Fetch view count for this post
    const viewCount = await blogViewsDB.getViewCount(slug);

    return {
      slug,
      title: matterResult.data.title || 'Untitled',
      date: matterResult.data.date || new Date().toISOString(),
      author: matterResult.data.author || 'Anonymous',
      summary: matterResult.data.summary || '',
      tags: matterResult.data.tags || [],
      content: contentHtml,
      readTime,
      viewCount,
    } as BlogPost;
  } catch (error) {
    console.error(`Error loading blog post ${slug}:`, error);
    return null;
  }
}
