'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, useRef, useEffect } from 'react';

type Props = {
  initialSearch: string;
};

export default function FarmersSearchBar({ initialSearch }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local state in sync if navigated externally
  useEffect(() => {
    setValue(initialSearch);
  }, [initialSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setValue(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q.trim()) {
        params.set('search', q.trim());
      } else {
        params.delete('search');
      }
      // Reset to page 1 on new search
      params.delete('page');
      startTransition(() => {
        router.push(`/farmers?${params.toString()}`);
      });
    }, 400);
  };

  const handleClear = () => {
    setValue('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    startTransition(() => {
      router.push(`/farmers?${params.toString()}`);
    });
  };

  return (
    <div className="w-full md:w-auto flex-grow relative max-w-lg">
      <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isPending ? 'text-primary animate-pulse' : 'text-outline'}`}>
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search farms by name or location..."
        className="w-full bg-surface-container rounded-xl py-3 pl-12 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50 font-body-md text-on-surface transition-shadow"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
          aria-label="Clear search"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      )}
    </div>
  );
}
