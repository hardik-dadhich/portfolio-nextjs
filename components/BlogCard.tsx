import Link from 'next/link';

interface BlogCardProps {
  title: string;
  date: string;
  summary: string;
  slug: string;
  readTime: number;
  tags: string[];
  viewCount: number;
}

export default function BlogCard({ title, date, summary, slug, readTime, tags, viewCount }: BlogCardProps) {
  // Format date for display
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format view count for display
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-4">
            <time dateTime={date}>{formattedDate}</time>
            <span>{readTime} min read</span>
          </div>
          
          {/* View count badge */}
          <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
            <svg 
              className="w-4 h-4 text-blue-600 dark:text-blue-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
              />
            </svg>
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {formatViewCount(viewCount)}
            </span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <Link href={`/blog/${slug}`}>
            {title}
          </Link>
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {summary}
        </p>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <Link
          href={`/blog/${slug}`}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
        >
          Read More
          <svg
            className="ml-2 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}
