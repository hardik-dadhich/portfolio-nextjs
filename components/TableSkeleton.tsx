export default function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
              </th>
              <th className="px-6 py-3 text-right">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 ml-auto animate-pulse"></div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index}>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
