'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route Error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh] p-4">
      <div className="bg-surface-container-lowest border border-outline-variant p-[40px] rounded-2xl flex flex-col items-center max-w-md text-center shadow-md">
        <span className="material-symbols-outlined text-[48px] text-error mb-[16px]">warning</span>
        <h2 className="font-h3 text-h3 text-on-surface mb-2">Failed to load content</h2>
        <p className="font-body-sm text-secondary mb-[24px]">
          There was an issue loading this section. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-primary text-on-primary rounded-full font-label-caps hover:bg-primary/90 transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
