import Link from 'next/link';

export default function BlogNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Blog Post Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/blog"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Posts
          </Link>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
