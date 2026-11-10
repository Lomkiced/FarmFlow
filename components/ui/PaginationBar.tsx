'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  compact?: boolean;
  className?: string;
  pageParamName?: string;
  pageSizeParamName?: string;
}

export default function PaginationBar({
  currentPage,
  totalPages: rawTotalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  itemLabel = 'records',
  compact = false,
  className = '',
  pageParamName = 'page',
  pageSizeParamName = 'pageSize',
}: PaginationBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const totalPages = Math.max(1, rawTotalPages || Math.ceil(totalItems / Math.max(1, pageSize)));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(safePage * pageSize, totalItems);

  const triggerPageChange = (targetPage: number) => {
    const clamped = Math.min(Math.max(1, targetPage), totalPages);
    if (clamped === safePage) return;

    if (onPageChange) {
      onPageChange(clamped);
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set(pageParamName, String(clamped));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const triggerPageSizeChange = (newSize: number) => {
    if (newSize === pageSize) return;

    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set(pageSizeParamName, String(newSize));
      params.set(pageParamName, '1');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  // Build visible page numbers with smart ellipsis
  const getPageNumbers = (): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [1];

    if (safePage > 3) {
      pages.push('ellipsis-start');
    }

    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (safePage < totalPages - 2) {
      pages.push('ellipsis-end');
    }

    pages.push(totalPages);
    return pages;
  };

  const normalizedOptions = Array.from(new Set([...pageSizeOptions, pageSize])).sort((a, b) => a - b);

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl ${
        compact ? 'px-4 py-2.5' : 'px-5 py-3.5'
      } shadow-xs transition-all ${className}`}
    >
      {/* Left: Range Telemetry & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>
            Showing{' '}
            <span className="font-bold text-slate-900 font-mono">
              {startItem}–{endItem}
            </span>{' '}
            of <span className="font-bold text-slate-900 font-mono">{totalItems}</span> {itemLabel}
          </span>
        </div>

        {normalizedOptions.length > 1 && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <label htmlFor={`page-size-${pageParamName}`} className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Show
            </label>
            <select
              id={`page-size-${pageParamName}`}
              value={pageSize}
              onChange={(e) => triggerPageSizeChange(Number(e.target.value))}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-colors cursor-pointer"
            >
              {normalizedOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Controls */}
      <div className="flex items-center gap-1.5">
        <span className="hidden md:inline-block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-2">
          Page <span className="text-slate-700 font-mono">{safePage}</span> of{' '}
          <span className="text-slate-700 font-mono">{totalPages}</span>
        </span>

        {/* First Page */}
        <button
          type="button"
          onClick={() => triggerPageChange(1)}
          disabled={safePage <= 1}
          title="First page"
          aria-label="First page"
          className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">first_page</span>
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => triggerPageChange(safePage - 1)}
          disabled={safePage <= 1}
          title="Previous page"
          aria-label="Previous page"
          className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          {!compact && <span className="hidden sm:inline">Prev</span>}
        </button>

        {/* Page Number Pills */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((item) => {
            if (item === 'ellipsis-start' || item === 'ellipsis-end') {
              return (
                <span
                  key={item}
                  className="w-7 h-8 flex items-center justify-center text-xs font-bold text-slate-400 select-none"
                >
                  …
                </span>
              );
            }

            const isActive = item === safePage;
            return (
              <button
                key={item}
                type="button"
                onClick={() => triggerPageChange(item)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold font-mono flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0B291B] text-white shadow-xs border border-[#0B291B]'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50/60 hover:border-emerald-300 hover:text-emerald-900'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => triggerPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          title="Next page"
          aria-label="Next page"
          className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
        >
          {!compact && <span className="hidden sm:inline">Next</span>}
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => triggerPageChange(totalPages)}
          disabled={safePage >= totalPages}
          title="Last page"
          aria-label="Last page"
          className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">last_page</span>
        </button>
      </div>
    </nav>
  );
}

