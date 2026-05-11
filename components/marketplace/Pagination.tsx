'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
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
              onClick={() => onPageChange(page)}
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
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 border border-surface-variant rounded-lg text-on-surface disabled:opacity-50 hover:bg-surface-container transition-colors disabled:hover:bg-transparent"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}
