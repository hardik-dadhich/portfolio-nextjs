'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 5000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        // Success toast style
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            background: '#10b981',
            color: '#fff',
          },
        },
        // Error toast style
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        },
        // Loading toast style
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#fff',
          },
          style: {
            background: '#3b82f6',
            color: '#fff',
          },
        },
      }}
    />
  );
}
