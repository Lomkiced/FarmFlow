'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(pathname + '?' + params.toString());
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="p-2 border border-surface-variant rounded-lg text-on-surface disabled:opacity-50 hover:bg-surface-container transition-colors disabled:hover:bg-transparent"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1;
        if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 rounded-lg font-label-md flex items-center justify-center transition-colors
                ${currentPage === page
                  ? 'bg-primary text-on-primary'
                  : 'border border-surface-variant text-on-surface hover:bg-surface-container'
                }
              `}
            >
              {page}
            </button>
          );
        }
        
        if (page === currentPage - 2 || page === currentPage + 2) {
          return <span key={page} className="text-on-surface-variant">...</span>;
        }

        return null;
      })}

      <button
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className="p-2 border border-surface-variant rounded-lg text-on-surface disabled:opacity-50 hover:bg-surface-container transition-colors disabled:hover:bg-transparent"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}
