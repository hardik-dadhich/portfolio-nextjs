'use client';

import { useState, useEffect, useRef } from 'react';
import { Goal } from '@/lib/types';
import GoalItem from './GoalItem';

interface GoalsGridProps {
  initialGoals: Goal[];
}

export default function GoalsGrid({ initialGoals }: GoalsGridProps) {
  const [displayedCount, setDisplayedCount] = useState(40); // Start with 20 per column
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const totalGoals = initialGoals.length;
  const hasMore = displayedCount < totalGoals;

  // Split goals into left and right columns
  const visibleGoals = initialGoals.slice(0, displayedCount);
  const leftColumnGoals = visibleGoals.filter((_, index) => index % 2 === 0);
  const rightColumnGoals = visibleGoals.filter((_, index) => index % 2 === 1);

  useEffect(() => {
    // Set up intersection observer for infinite scroll
    if (!loadMoreRef.current) return;

    const loadMore = () => {
      if (isLoading || !hasMore) return;
      
      setIsLoading(true);
      
      // Simulate loading delay for smooth UX
      setTimeout(() => {
        setDisplayedCount(prev => Math.min(prev + 40, totalGoals)); // Load 20 more per column
        setIsLoading(false);
      }, 300);
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        rootMargin: '200px', // Start loading before reaching the bottom
      }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, totalGoals]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-3">
          <ol className="space-y-3">
            {leftColumnGoals.map((goal) => (
              <GoalItem
                key={goal.id}
                id={goal.id}
                text={goal.text}
                completed={goal.completed}
                category={goal.category}
                referenceLink={goal.referenceLink}
                referenceLinkType={goal.referenceLinkType}
              />
            ))}
          </ol>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <ol className="space-y-3">
            {rightColumnGoals.map((goal) => (
              <GoalItem
                key={goal.id}
                id={goal.id}
                text={goal.text}
                completed={goal.completed}
                category={goal.category}
                referenceLink={goal.referenceLink}
                referenceLinkType={goal.referenceLinkType}
              />
            ))}
          </ol>
        </div>
      </div>

      {/* Loading indicator and intersection observer target */}
      {hasMore && (
        <div ref={loadMoreRef} className="mt-8 text-center py-8">
          {isLoading && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
        </div>
      )}

      {/* End of list message */}
      {!hasMore && displayedCount > 0 && (
        <div className="mt-8 text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            🎉 You&apos;ve reached the end of the list!
          </p>
        </div>
      )}
    </>
  );
}
