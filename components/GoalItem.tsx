interface GoalItemProps {
  id: number;
  text: string;
  completed: boolean;
  category?: string;
  referenceLink?: string;
  referenceLinkType?: 'youtube' | 'blog' | 'medium' | 'linkedin' | 'other';
}

export default function GoalItem({ 
  id, 
  text, 
  completed, 
  category, 
  referenceLink,
  referenceLinkType 
}: GoalItemProps) {
  const getLinkIcon = () => {
    switch (referenceLinkType) {
      case 'youtube':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
          </svg>
        );
      case 'blog':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        );
    }
  };

  return (
    <li className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
      {/* Completion Status Indicator */}
      <div className="flex-shrink-0 mt-1">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            completed
              ? 'bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600'
              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
          }`}
        >
          {completed && (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Goal Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-base ${
              completed
                ? 'text-gray-500 dark:text-gray-400 line-through'
                : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            <span className="font-medium text-gray-400 dark:text-gray-500 mr-2">
              {id}.
            </span>
            {text}
          </p>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {category && (
              <span className="inline-block px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                {category}
              </span>
            )}
            
            {/* Reference Link Button - Only for completed items */}
            {completed && referenceLink && (
              <a
                href={referenceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-gray-700 dark:bg-gray-600 hover:bg-gray-800 dark:hover:bg-gray-500 rounded-full transition-colors"
                title="View Reference"
              >
                {getLinkIcon()}
                <span>Link</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
