'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <html>
      <body className="flex items-center justify-center min-h-screen bg-background text-on-background">
        <div className="bg-surface-container border border-outline-variant p-[40px] rounded-2xl flex flex-col items-center max-w-md text-center shadow-lg">
          <span className="material-symbols-outlined text-[64px] text-error mb-[16px]">error</span>
          <h2 className="font-h2 text-h2 text-on-surface mb-2">Something went wrong!</h2>
          <p className="font-body-base text-secondary mb-[24px]">
            We've encountered an unexpected error. Please try again.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 border border-outline text-on-surface rounded-full font-label-caps hover:bg-surface-variant transition-colors"
            >
              Refresh Page
            </button>
            <button
              onClick={() => reset()}
              className="px-6 py-2 bg-primary text-on-primary rounded-full font-label-caps hover:bg-primary/90 transition-colors shadow-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
