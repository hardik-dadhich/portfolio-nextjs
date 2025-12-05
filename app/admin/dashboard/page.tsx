'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import AdminPaperList from '@/components/AdminPaperList';
import AdminPaperForm from '@/components/AdminPaperForm';
import AdminBlogList from '@/components/AdminBlogList';
import AdminWeeklyReadList from '@/components/AdminWeeklyReadList';
import AdminWeeklyReadForm from '@/components/AdminWeeklyReadForm';
import TypeFilter from '@/components/TypeFilter';
import { PaperEntry, PaperFormData, WeeklyReadEntry, WeeklyReadFormData } from '@/lib/types';

type TabType = 'papers' | 'blogs' | 'weekly-reads';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [activeTab, setActiveTab] = useState<TabType>('papers');
  const [papers, setPapers] = useState<PaperEntry[]>([]);
  const [editingPaper, setEditingPaper] = useState<PaperEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Weekly reads state
  const [weeklyReads, setWeeklyReads] = useState<WeeklyReadEntry[]>([]);
  const [editingRead, setEditingRead] = useState<WeeklyReadEntry | null>(null);
  const [showReadForm, setShowReadForm] = useState(false);
  const [isLoadingReads, setIsLoadingReads] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPapers, setTotalPapers] = useState(0);
  const papersPerPage = 20;
  const totalPages = Math.ceil(totalPapers / papersPerPage);
  
  // Type filter state
  const [selectedType, setSelectedType] = useState<'all' | 'paper' | 'blog'>('all');

  const fetchPapers = async () => {
    try {
      setIsLoading(true);
      const offset = (currentPage - 1) * papersPerPage;
      const typeParam = selectedType !== 'all' ? `&type=${selectedType}` : '';
      const response = await fetch(`/api/papers?limit=${papersPerPage}&offset=${offset}${typeParam}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch papers');
      }
      
      const data = await response.json();
      setPapers(data.papers || []);
      setTotalPapers(data.total || 0);
    } catch (error) {
      console.error('Error fetching papers:', error);
      toast.error('Failed to load papers');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchWeeklyReads = async () => {
    try {
      setIsLoadingReads(true);
      const response = await fetch('/api/weekly-reads');
      
      if (!response.ok) {
        throw new Error('Failed to fetch weekly reads');
      }
      
      const data = await response.json();
      setWeeklyReads(data.reads || []);
    } catch (error) {
      console.error('Error fetching weekly reads:', error);
      toast.error('Failed to load weekly reads');
    } finally {
      setIsLoadingReads(false);
    }
  };

  // Fetch all papers on mount and when page or filter changes
  useEffect(() => {
    if (status === 'authenticated') {
      fetchPapers();
      fetchWeeklyReads();
    } else if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, currentPage, selectedType]);

  const handleFilterChange = (type: 'all' | 'paper' | 'blog') => {
    setSelectedType(type);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleCreate = async (data: PaperFormData) => {
    try {
      const response = await fetch('/api/papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create paper');
      }

      const result = await response.json();
      
      // Add new paper to the list
      setPapers((prev) => [result.paper, ...prev]);
      setShowForm(false);
      toast.success('Paper added successfully!');
    } catch (error) {
      console.error('Error creating paper:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add paper');
      throw error; // Re-throw to prevent form from closing
    }
  };

  const handleUpdate = async (data: PaperFormData) => {
    if (!editingPaper) return;

    try {
      const response = await fetch(`/api/papers/${editingPaper.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update paper');
      }

      const result = await response.json();
      
      // Update paper in the list
      setPapers((prev) =>
        prev.map((paper) => (paper.id === editingPaper.id ? result.paper : paper))
      );
      setEditingPaper(null);
      toast.success('Paper updated successfully!');
    } catch (error) {
      console.error('Error updating paper:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update paper');
      throw error; // Re-throw to prevent form from closing
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/papers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete paper');
      }

      // Remove paper from the list
      setPapers((prev) => prev.filter((paper) => paper.id !== id));
      toast.success('Paper deleted successfully!');
    } catch (error) {
      console.error('Error deleting paper:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete paper');
    }
  };

  const handleEdit = (paper: PaperEntry) => {
    setEditingPaper(paper);
    setShowForm(false); // Close add form if open
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPaper(null);
  };

  // Weekly reads handlers
  const handleCreateRead = async (data: WeeklyReadFormData) => {
    try {
      const response = await fetch('/api/weekly-reads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create weekly read');
      }

      const result = await response.json();
      setWeeklyReads((prev) => [result.read, ...prev]);
      setShowReadForm(false);
      toast.success('Weekly read added successfully!');
    } catch (error) {
      console.error('Error creating weekly read:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add weekly read');
      throw error;
    }
  };

  const handleUpdateRead = async (data: WeeklyReadFormData) => {
    if (!editingRead) return;

    try {
      const response = await fetch(`/api/weekly-reads/${editingRead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update weekly read');
      }

      const result = await response.json();
      setWeeklyReads((prev) =>
        prev.map((read) => (read.id === editingRead.id ? result.read : read))
      );
      setEditingRead(null);
      toast.success('Weekly read updated successfully!');
    } catch (error) {
      console.error('Error updating weekly read:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update weekly read');
      throw error;
    }
  };

  const handleDeleteRead = async (id: number) => {
    try {
      const response = await fetch(`/api/weekly-reads/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete weekly read');
      }

      setWeeklyReads((prev) => prev.filter((read) => read.id !== id));
      toast.success('Weekly read deleted successfully!');
    } catch (error) {
      console.error('Error deleting weekly read:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete weekly read');
    }
  };

  const handleEditRead = (read: WeeklyReadEntry) => {
    setEditingRead(read);
    setShowReadForm(false);
  };

  const handleCancelReadForm = () => {
    setShowReadForm(false);
    setEditingRead(null);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  // Show loading state while checking authentication
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage your papershelf entries and blog posts
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {session?.user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg sm:rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('papers')}
                className={`${
                  activeTab === 'papers'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                📝 My Publications
              </button>
              <button
                onClick={() => setActiveTab('weekly-reads')}
                className={`${
                  activeTab === 'weekly-reads'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                📚 Weekly Reads
              </button>
              <button
                onClick={() => setActiveTab('blogs')}
                className={`${
                  activeTab === 'blogs'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                ✍️ Blog Posts
              </button>
            </nav>
          </div>
        </div>

        {/* Papers Tab Content */}
        {activeTab === 'papers' && (
          <>
            {/* Add New Paper Button */}
            {!showForm && !editingPaper && (
              <div className="mb-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg sm:rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  + Add New Paper
                </button>
              </div>
            )}

            {/* Paper Form (Create or Edit) */}
            {(showForm || editingPaper) && (
              <AdminPaperForm
                paper={editingPaper || undefined}
                onSubmit={editingPaper ? handleUpdate : handleCreate}
                onCancel={handleCancelForm}
              />
            )}

            {/* Type Filter */}
            {!showForm && !editingPaper && (
              <TypeFilter
                selectedType={selectedType}
                onFilterChange={handleFilterChange}
              />
            )}

            {/* Papers List */}
            <AdminPaperList
              papers={papers}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:px-6 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
                Showing {(currentPage - 1) * papersPerPage + 1} to{' '}
                {Math.min(currentPage * papersPerPage, totalPapers)} of {totalPapers} papers
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Previous/Next buttons for mobile */}
                <div className="flex gap-2 sm:hidden">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    Next →
                  </button>
                </div>
                
                {/* Page indicator for mobile */}
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 sm:hidden">
                  Page {currentPage} of {totalPages}
                </div>
                
                {/* Full pagination for desktop */}
                <div className="hidden sm:flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {/* Show first page */}
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => setCurrentPage(1)}
                          className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          1
                        </button>
                        {currentPage > 4 && (
                          <span className="text-gray-500 dark:text-gray-400">...</span>
                        )}
                      </>
                    )}
                    
                    {/* Show pages around current page */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === currentPage ||
                          page === currentPage - 1 ||
                          page === currentPage + 1
                      )
                      .map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    
                    {/* Show last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="text-gray-500 dark:text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
            )}
          </>
        )}

        {/* Weekly Reads Tab Content */}
        {activeTab === 'weekly-reads' && (
          <>
            {/* Add New Weekly Read Button */}
            {!showReadForm && !editingRead && (
              <div className="mb-6">
                <button
                  onClick={() => setShowReadForm(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg sm:rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  + Add Weekly Read
                </button>
              </div>
            )}

            {/* Weekly Read Form (Create or Edit) */}
            {(showReadForm || editingRead) && (
              <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  {editingRead ? 'Edit Weekly Read' : 'Add New Weekly Read'}
                </h2>
                <AdminWeeklyReadForm
                  initialData={editingRead || undefined}
                  onSubmit={editingRead ? handleUpdateRead : handleCreateRead}
                  onCancel={handleCancelReadForm}
                />
              </div>
            )}

            {/* Weekly Reads List */}
            {!showReadForm && !editingRead && (
              <AdminWeeklyReadList
                reads={weeklyReads}
                onEdit={handleEditRead}
                onDelete={handleDeleteRead}
              />
            )}
          </>
        )}

        {/* Blogs Tab Content */}
        {activeTab === 'blogs' && (
          <AdminBlogList />
        )}
      </main>
    </div>
  );
}
