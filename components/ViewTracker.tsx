'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  slug: string;
}

export default function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch(`/api/blog/${slug}/view`, {
          method: 'POST',
        });
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.error('Failed to track view:', error);
      }
    };

    trackView();
  }, [slug]);

  // This component doesn't render anything
  return null;
}
