import { PaperEntry } from '@/lib/types';

interface PaperTableRowProps {
  paper: PaperEntry;
}

export default function PaperTableRow({ paper }: PaperTableRowProps) {
  // Format date for display
  const formattedDate = new Date(paper.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {/* Title with external link */}
      <td className="py-4 px-4">
        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors group"
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
      </td>

      {/* Authors */}
      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
        {paper.authors}
      </td>

      {/* Date */}
      <td className="py-4 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
        {formattedDate}
      </td>

      {/* Type badge */}
      <td className="py-4 px-4">
        <span
          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
            paper.type === 'paper'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
          }`}
        >
          {paper.type === 'paper' ? 'Paper' : 'Blog Link'}
        </span>
      </td>
    </tr>
  );
}
