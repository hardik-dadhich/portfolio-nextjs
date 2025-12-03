'use client';

import { PaperEntry } from '@/lib/types';
import PaperTableRow from './PaperTableRow';
import PaperCard from './PaperCard';

interface PaperTableProps {
  papers: PaperEntry[];
  showArchive: boolean;
  onToggleArchive: () => void;
  hasMore: boolean;
  isLoading?: boolean;
}

export default function PaperTable({ 
  papers, 
  showArchive, 
  onToggleArchive, 
  hasMore,
  isLoading = false
}: PaperTableProps) {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Desktop: Table skeleton */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="py-3 px-4 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                </th>
                <th className="py-3 px-4 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                </th>
                <th className="py-3 px-4 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                </th>
                <th className="py-3 px-4 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: Card skeleton */}
        <div className="md:hidden space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`card-skeleton-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle empty state
  if (papers.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          No papers yet
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Check back later for new papers and blog links.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop: Table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300 dark:border-gray-600">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Title
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Authors
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Date
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {papers.map((paper, index) => (
              <PaperTableRow 
                key={paper.id} 
                paper={paper}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card view */}
      <div className="md:hidden space-y-4">
        {papers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>

      {/* Archive toggle button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onToggleArchive}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            {showArchive ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Back to Recent</span>
              </>
            ) : (
              <>
                <span>View Archive</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
