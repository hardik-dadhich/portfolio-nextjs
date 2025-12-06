import { WeeklyReadEntry } from '@/lib/types';
import TableSkeleton from './TableSkeleton';

interface WeeklyReadsTableProps {
  reads: WeeklyReadEntry[];
  showArchive: boolean;
  onToggleArchive: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export default function WeeklyReadsTable({
  reads,
  showArchive,
  onToggleArchive,
  hasMore,
  isLoading,
}: WeeklyReadsTableProps) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (reads.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No weekly reads yet. Check back soon!
        </p>
      </div>
    );
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      research: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      article: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      blog: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      documentation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[category as keyof typeof colors] || colors.article}`}>
        {category}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Recent Reads
        </h3>
        {hasMore && (
          <button
            onClick={onToggleArchive}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            {showArchive ? 'Show Recent' : 'View All'}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Authors
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Read Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Link
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {reads.map((read) => (
              <tr key={read.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {read.title}
                  </div>
                  {read.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {read.description}
                    </div>
                  )}
                  {read.source && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Source: {read.source}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {read.authors}
                </td>
                <td className="px-6 py-4 text-sm">
                  {getCategoryBadge(read.category)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(read.readDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4 text-sm">
                  <a
                    href={read.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center gap-1"
                  >
                    <span>Read</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        {hasMore && !showArchive ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {reads.length} {reads.length === 1 ? 'read' : 'reads'} (view all to see more)
          </p>
        ) : !hasMore && showArchive ? (
          <div className="text-center py-4">
            <div className="inline-flex flex-col items-center gap-2">
              <svg
                className="h-12 w-12 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
                🎉 You've reached the end of the list!
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {reads.length} {reads.length === 1 ? 'read' : 'reads'}
          </p>
        )}
      </div>
    </div>
  );
}
