'use client';

import { useState, useTransition, useMemo } from 'react';
import Image from 'next/image';
import { approveListingAction, removeListingAction } from '@/app/actions/admin';
import PaginationBar from '@/components/ui/PaginationBar';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

type ListingData = {
  id: string;
  name: string;
  pricePerKg: number;
  status: string;
  photos: string[];
  createdAt: Date;
  farm: {
    farmName: string;
    user: {
      name: string | null;
    };
  };
};

export default function ListingsClient({ initialListings }: { initialListings: ListingData[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Filter & Pagination state
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING_REVIEW' | 'REMOVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const filteredListings = useMemo(() => {
    return initialListings.filter((l) => {
      if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = l.name.toLowerCase().includes(q);
        const matchFarm = l.farm.farmName.toLowerCase().includes(q);
        const matchFarmer = l.farm.user.name?.toLowerCase().includes(q);
        if (!matchName && !matchFarm && !matchFarmer) return false;
      }
      return true;
    });
  }, [initialListings, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedListings = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredListings.slice(start, start + pageSize);
  }, [filteredListings, safePage, pageSize]);

  const toggleSelection = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const res = await approveListingAction(id);
      if (res.success) {
        toast.success(res.message || 'Listing approved');
        setSelected((prev) => prev.filter((i) => i !== id));
      } else {
        toast.error(res.error || 'Failed to approve listing');
      }
    });
  };

  const handleRemove = (id: string) => {
    startTransition(async () => {
      const res = await removeListingAction(id);
      if (res.success) {
        toast.success(res.message || 'Listing removed');
        setSelected((prev) => prev.filter((i) => i !== id));
      } else {
        toast.error(res.error || 'Failed to remove listing');
      }
    });
  };

  const handleBulkApprove = () => {
    selected.forEach((id) => handleApprove(id));
  };

  const handleBulkRemove = () => {
    selected.forEach((id) => handleRemove(id));
  };

  const activeCount = initialListings.filter((l) => l.status === 'ACTIVE').length;
  const pendingCount = initialListings.filter((l) => l.status === 'PENDING_REVIEW').length;
  const removedCount = initialListings.filter((l) => l.status === 'REMOVED').length;

  return (
    <div className="flex-1 p-6 md:p-8 xl:p-10 flex flex-col gap-6 overflow-y-auto bg-[#F9FAFB] min-h-[calc(100vh-4rem)]">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            Harvest Listing Moderation
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review, approve, or flag marketplace harvest listings across La Union farms.
          </p>
        </div>

        {/* BULK ACTION TOOLBAR */}
        {selected.length > 0 && (
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
            <div className="text-xs font-semibold text-gray-700 px-2 border-r border-gray-200 tabular-nums">
              {selected.length} selected
            </div>
            <button
              disabled={isPending}
              onClick={handleBulkRemove}
              className="border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-50 cursor-pointer"
            >
              Remove Selected
            </button>
            <button
              disabled={isPending}
              onClick={handleBulkApprove}
              className="bg-green-800 hover:bg-green-900 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-50 cursor-pointer"
            >
              Approve Selected
            </button>
          </div>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
          {(
            [
              { id: 'ALL', label: `All (${initialListings.length})` },
              { id: 'ACTIVE', label: `Active (${activeCount})` },
              { id: 'PENDING_REVIEW', label: `Pending Review (${pendingCount})` },
              { id: 'REMOVED', label: `Removed (${removedCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-green-800 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined text-[18px] text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search crop name or farm..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:bg-white focus:border-green-800 text-gray-900"
          />
        </div>
      </div>

      {/* CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {paginatedListings.map((listing) => (
          <div
            key={listing.id}
            className={`bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col hover:border-green-800 transition-colors relative ${
              selected.includes(listing.id) ? 'ring-2 ring-green-800' : ''
            }`}
          >
            {/* CHECKBOX OVERLAY */}
            <div className="absolute top-3 left-3 z-10">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-green-800 focus:ring-green-800 cursor-pointer"
                checked={selected.includes(listing.id)}
                onChange={() => toggleSelection(listing.id)}
              />
            </div>

            {/* IMAGE */}
            <div className="h-44 w-full bg-gray-100 relative overflow-hidden">
              <Image
                src={listing.photos[0] || '/images/crops/generic.jpg'}
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                alt={listing.name}
                className={`object-cover ${
                  listing.status === 'ACTIVE' ? '' : 'grayscale opacity-75'
                }`}
              />

              {/* STATUS BADGE */}
              <div className="absolute top-3 right-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    listing.status === 'PENDING_REVIEW'
                      ? 'bg-gray-100 text-gray-700 border border-gray-300'
                      : listing.status === 'REMOVED'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-green-50 text-green-800 border border-green-200'
                  }`}
                >
                  {listing.status === 'PENDING_REVIEW' ? 'Pending Review' : listing.status}
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-4 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{listing.name}</h3>
                <div className="flex items-center gap-1.5 ml-2 shrink-0">
                  {listing.status !== 'ACTIVE' && (
                    <button
                      onClick={() => handleApprove(listing.id)}
                      className="px-2 py-0.5 rounded border border-green-800 bg-green-50 text-green-800 hover:bg-green-800 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Approve
                    </button>
                  )}
                  {listing.status !== 'REMOVED' && (
                    <button
                      onClick={() => handleRemove(listing.id)}
                      className="px-2 py-0.5 rounded border border-red-300 bg-white text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4 truncate">
                {listing.farm.farmName}
              </div>

              {/* BOTTOM ROW */}
              <div className="mt-auto pt-3 border-t border-gray-100 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Retail Price
                  </span>
                  <div className="text-base font-bold text-green-800 tabular-nums">
                    ₱{listing.pricePerKg.toFixed(2)}
                    <span className="text-xs font-normal text-gray-500 ml-0.5">/kg</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Listed
                  </span>
                  <span className="text-xs text-gray-500 tabular-nums">
                    {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {paginatedListings.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-lg border border-gray-200 text-gray-500 text-xs">
            No harvest listings match your current filter.
          </div>
        )}
      </div>

      {/* PAGINATION BAR */}
      <PaginationBar
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={filteredListings.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        pageSizeOptions={[4, 8, 12, 24]}
        itemLabel="listings"
      />
    </div>
  );
}
