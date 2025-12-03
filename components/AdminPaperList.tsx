'use client';

import { useState } from 'react';
import { PaperEntry } from '@/lib/types';

interface AdminPaperListProps {
  papers: PaperEntry[];
  onEdit: (paper: PaperEntry) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export default function AdminPaperList({ papers, onEdit, onDelete, isLoading = false }: AdminPaperListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteClick = async (id: number) => {
    if (deleteConfirm === id) {
      // Second click - confirm deletion
      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
        setDeleteConfirm(null);
      }
    } else {
      // First click - set confirmation state
      setDeleteConfirm(id);
      
      // Reset confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirm(null);
      }, 3000);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getTypeBadgeColor = (type: 'paper' | 'blog') => {
    return type === 'paper'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          All Papers ({papers.length})
        </h2>
      </div>

      {/* Desktop: Table view */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Authors
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : papers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No papers found. Add your first paper entry above.
                </td>
              </tr>
            ) : (
              papers.map((paper) => (
                <tr
                  key={paper.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">
                      {paper.title}
                    </div>
                    {paper.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs truncate">
                        {paper.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-300 max-w-xs truncate">
                      {paper.authors}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-300">
                      {formatDate(paper.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(
                        paper.type
                      )}`}
                    >
                      {paper.type === 'paper' ? 'Paper' : 'Blog Link'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline max-w-xs truncate block"
                    >
                      {paper.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(paper)}
                        disabled={deletingId === paper.id}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(paper.id)}
                        disabled={deletingId === paper.id}
                        className={`px-3 py-1 rounded focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          deleteConfirm === paper.id
                            ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                            : 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                        }`}
                      >
                        {deletingId === paper.id ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Deleting...
                          </span>
                        ) : deleteConfirm === paper.id ? (
                          'Confirm?'
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet: Card view */}
      <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          // Loading skeleton for mobile
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`mobile-skeleton-${index}`} className="p-4 sm:p-6">
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                <div className="flex gap-2 mt-4">
                  <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
                  <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))
        ) : papers.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500 dark:text-gray-400">
            No papers found. Add your first paper entry above.
          </div>
        ) : (
          papers.map((paper) => (
            <div
              key={paper.id}
              className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="space-y-3">
                {/* Title and Type Badge */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex-1 break-words">
                    {paper.title}
                  </h3>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap flex-shrink-0 ${getTypeBadgeColor(
                      paper.type
                    )}`}
                  >
                    {paper.type === 'paper' ? 'Paper' : 'Blog'}
                  </span>
                </div>

                {/* Description */}
                {paper.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {paper.description}
                  </p>
                )}

                {/* Authors */}
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium text-gray-500 dark:text-gray-400">Authors: </span>
                  {paper.authors}
                </div>

                {/* Date */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-500 dark:text-gray-400">Date: </span>
                  {formatDate(paper.date)}
                </div>

                {/* URL */}
                <div className="text-sm">
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    View Paper →
                  </a>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => onEdit(paper)}
                    disabled={deletingId === paper.id}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(paper.id)}
                    disabled={deletingId === paper.id}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      deleteConfirm === paper.id
                        ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                        : 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
                    }`}
                  >
                    {deletingId === paper.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Deleting...
                      </span>
                    ) : deleteConfirm === paper.id ? (
                      'Confirm Delete?'
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
