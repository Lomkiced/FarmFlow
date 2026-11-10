'use client';

import React from 'react';
import PaginationBar from '@/components/ui/PaginationBar';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  itemLabel?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems = 0,
  pageSize = 12,
  itemLabel = 'products',
}: PaginationProps) {
  if (totalItems === 0 && totalPages <= 1) return null;

  return (
    <div className="mt-8">
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems || totalPages * pageSize}
        pageSize={pageSize}
        pageSizeOptions={[4, 8, 12, 24]}
        itemLabel={itemLabel}
      />
    </div>
  );
}
