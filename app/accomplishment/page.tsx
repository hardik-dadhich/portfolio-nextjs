'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PaperTable from '@/components/PaperTable';
import WeeklyReadsTable from '@/components/WeeklyReadsTable';
import { PaperEntry, PapersResponse, WeeklyReadEntry, WeeklyReadsResponse } from '@/lib/types';

export default function AccomplishmentPage() {
  const [papers, setPapers] = useState<PaperEntry[]>([]);
  const [weeklyReads, setWeeklyReads] = useState<WeeklyReadEntry[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [showReadsArchive, setShowReadsArchive] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [hasMoreReads, setHasMoreReads] = useState(false);
  const [loading, setLoading] = useState(true);
  const [readsLoading, setReadsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch papers (my publications)
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const limit = showArchive ? undefined : 10;
        const url = `/api/papers${limit ? `?limit=${limit}` : ''}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to load papers');
        }
        
        const data: PapersResponse = await response.json();
        
        setPapers(data.papers);
        setHasMore(data.hasMore);
      } catch (err) {
        console.error('Error fetching papers:', err);
        setError('Unable to load papers. Please try again later.');
        toast.error('Failed to load papers');
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [showArchive]);

  // Fetch weekly reads
  useEffect(() => {
    const fetchWeeklyReads = async () => {
      try {
        setReadsLoading(true);
        
        const limit = showReadsArchive ? undefined : 10;
        const url = `/api/weekly-reads${limit ? `?limit=${limit}` : ''}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to load weekly reads');
        }
        
        const data: WeeklyReadsResponse = await response.json();
        
        setWeeklyReads(data.reads);
        setHasMoreReads(data.hasMore);
      } catch (err) {
        console.error('Error fetching weekly reads:', err);
        toast.error('Failed to load weekly reads');
      } finally {
        setReadsLoading(false);
      }
    };

    fetchWeeklyReads();
  }, [showReadsArchive]);

  const handleToggleArchive = () => {
    setShowArchive(!showArchive);
  };

  const handleToggleReadsArchive = () => {
    setShowReadsArchive(!showReadsArchive);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
            Papershelf
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            My research papers, publications, and weekly reading list
          </p>
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-start">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error loading papers
                  </h3>
                  <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Publications Section */}
        {!error && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              📝 My Publications
            </h2>
            <PaperTable
              papers={papers}
              showArchive={showArchive}
              onToggleArchive={handleToggleArchive}
              hasMore={hasMore}
              isLoading={loading}
            />
          </div>
        )}

        {/* Weekly Reading List Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            📚 Weekly Reading List
          </h2>
          <WeeklyReadsTable
            reads={weeklyReads}
            showArchive={showReadsArchive}
            onToggleArchive={handleToggleReadsArchive}
            hasMore={hasMoreReads}
            isLoading={readsLoading}
          />
        </div>
      </div>
    </div>
  );
}
