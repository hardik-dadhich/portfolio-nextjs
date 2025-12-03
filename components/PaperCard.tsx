import { PaperEntry } from '@/lib/types';

interface PaperCardProps {
  paper: PaperEntry;
}

export default function PaperCard({ paper }: PaperCardProps) {
  // Format date for display
  const formattedDate = new Date(paper.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow duration-300">
      {/* Type badge and date */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
            paper.type === 'paper'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
          }`}
        >
          {paper.type === 'paper' ? 'Paper' : 'Blog Link'}
        </span>
        <time className="text-sm text-gray-600 dark:text-gray-400">
          {formattedDate}
        </time>
      </div>

      {/* Title with external link */}
      <h3 className="text-lg font-bold mb-2">
        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group"
        >
          <span>{paper.title}</span>
          {/* External link indicator icon */}
          <svg
            className="w-4 h-4 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </h3>

      {/* Authors */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
        <span className="font-medium text-gray-500 dark:text-gray-400">Authors: </span>
        {paper.authors}
      </p>

      {/* Description if available */}
      {paper.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {paper.description}
        </p>
      )}
    </article>
  );
}
