'use client';

import { useState } from 'react';
import { WeeklyReadEntry, WeeklyReadFormData } from '@/lib/types';

interface AdminWeeklyReadFormProps {
  onSubmit: (data: WeeklyReadFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: WeeklyReadEntry;
  isLoading?: boolean;
}

export default function AdminWeeklyReadForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}: AdminWeeklyReadFormProps) {
  const [formData, setFormData] = useState<WeeklyReadFormData>({
    title: initialData?.title || '',
    authors: initialData?.authors || '',
    source: initialData?.source || '',
    url: initialData?.url || '',
    description: initialData?.description || '',
    category: initialData?.category || 'article',
    readDate: initialData?.readDate || new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await onSubmit(formData);
    } catch (error: any) {
      if (error.details) {
        setErrors(error.details);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder="e.g., Attention Is All You Need"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      {/* Authors */}
      <div>
        <label htmlFor="authors" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Authors *
        </label>
        <input
          type="text"
          id="authors"
          name="authors"
          value={formData.authors}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder="e.g., Vaswani et al."
        />
        {errors.authors && <p className="mt-1 text-sm text-red-600">{errors.authors}</p>}
      </div>

      {/* Source and Category Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Source */}
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Source
          </label>
          <input
            type="text"
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="e.g., arXiv, Medium, Dev.to"
          />
          {errors.source && <p className="mt-1 text-sm text-red-600">{errors.source}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          >
            <option value="research">Research Paper</option>
            <option value="article">Article</option>
            <option value="blog">Blog Post</option>
            <option value="documentation">Documentation</option>
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>
      </div>

      {/* URL */}
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          URL *
        </label>
        <input
          type="url"
          id="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder="https://example.com/article"
        />
        {errors.url && <p className="mt-1 text-sm text-red-600">{errors.url}</p>}
      </div>

      {/* Read Date */}
      <div>
        <label htmlFor="readDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Read Date *
        </label>
        <input
          type="date"
          id="readDate"
          name="readDate"
          value={formData.readDate}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
        />
        {errors.readDate && <p className="mt-1 text-sm text-red-600">{errors.readDate}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder="Brief summary or key takeaways..."
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
