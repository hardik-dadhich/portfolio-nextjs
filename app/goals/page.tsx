import { loadGoals } from '@/lib/data';
import GoalsGrid from '@/components/GoalsGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '100 Things I Want to Do',
  description: 'A personal bucket list of goals and aspirations',
};

export default async function GoalsPage() {
  const goals = await loadGoals();

  // Calculate completion statistics
  const completedCount = goals.filter(goal => goal.completed).length;
  const totalCount = goals.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            100 Things I Want to Do
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
            A personal bucket list of goals, dreams, and aspirations and small things which i have covered
          </p>
          
          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>{completedCount} completed</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-green-500 dark:bg-green-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No goals yet. Start adding your aspirations!
            </p>
          </div>
        ) : (
          <GoalsGrid initialGoals={goals} />
        )}
      </div>
    </div>
  );
}
