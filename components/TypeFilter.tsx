'use client';

interface TypeFilterProps {
  selectedType: 'all' | 'paper' | 'blog';
  onFilterChange: (type: 'all' | 'paper' | 'blog') => void;
}

export default function TypeFilter({ selectedType, onFilterChange }: TypeFilterProps) {
  const filters = [
    { value: 'all' as const, label: 'All' },
    { value: 'paper' as const, label: 'Papers' },
    { value: 'blog' as const, label: 'Blog Links' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          Filter by type:
        </span>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg sm:rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                selectedType === filter.value
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
