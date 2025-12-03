'use client';

import { useState, useEffect } from 'react';
import { sanitizeText } from '@/lib/sanitize';

interface BlogFormData {
  title: string;
  date: string;
  author: string;
  summary: string;
  tags: string;
  content: string;
  slug: string;
}

interface AdminBlogFormProps {
  blog?: {
    slug: string;
    title: string;
    date: string;
    author: string;
    summary: string;
    tags: string[];
    content: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdminBlogForm({ blog, onSuccess, onCancel }: AdminBlogFormProps) {
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    author: 'Hardik Dadhich',
    summary: '',
    tags: '',
    content: '',
    slug: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title,
        date: blog.date,
        author: blog.author,
        summary: blog.summary,
        tags: blog.tags.join(', '),
        content: blog.content,
        slug: blog.slug,
      });
    }
  }, [blog]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: !blog ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sanitize inputs
      const sanitizedData = {
        title: sanitizeText(formData.title),
        date: formData.date,
        author: sanitizeText(formData.author),
        summary: sanitizeText(formData.summary),
        tags: formData.tags
          .split(',')
          .map(tag => sanitizeText(tag.trim()))
          .filter(tag => tag.length > 0),
        content: formData.content, // Keep markdown as-is
        slug: formData.slug,
      };

      // Validate
      if (!sanitizedData.title || !sanitizedData.content || !sanitizedData.slug) {
        setError('Title, content, and slug are required');
        setLoading(false);
        return;
      }

      const url = blog ? `/api/blogs/${blog.slug}` : '/api/blogs';
      const method = blog ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blog ? { ...sanitizedData, newSlug: sanitizedData.slug } : sanitizedData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save blog post');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          required
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Slug * <span className="text-xs text-gray-500">(URL-friendly identifier)</span>
        </label>
        <input
          type="text"
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white font-mono text-sm"
          required
          pattern="[a-z0-9-]+"
          title="Only lowercase letters, numbers, and hyphens"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Author
          </label>
          <input
            type="text"
            id="author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Summary
        </label>
        <textarea
          id="summary"
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          placeholder="Brief description of the blog post"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags <span className="text-xs text-gray-500">(comma-separated)</span>
        </label>
        <input
          type="text"
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          placeholder="react, typescript, web-development"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content * <span className="text-xs text-gray-500">(Markdown supported)</span>
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={20}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white font-mono text-sm"
          placeholder="Write your blog post content in Markdown..."
          required
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : blog ? 'Update Blog Post' : 'Create Blog Post'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
