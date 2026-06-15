'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { approveListingAction, removeListingAction } from '@/app/actions/admin';
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

  const toggleSelection = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const res = await approveListingAction(id);
      if (res.success) {
        toast.success(res.message || 'Listing approved');
        setSelected(prev => prev.filter(i => i !== id));
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
        setSelected(prev => prev.filter(i => i !== id));
      } else {
        toast.error(res.error || 'Failed to remove listing');
      }
    });
  };

  const handleBulkApprove = () => {
    selected.forEach(id => handleApprove(id));
  };

  const handleBulkRemove = () => {
    selected.forEach(id => handleRemove(id));
  };

  return (
    <div className="flex-1 p-[40px] flex flex-col gap-[24px] overflow-y-auto bg-admin-background">
      
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-[24px]">
        <div>
          <h2 className="font-admin-h1 text-admin-h1 text-admin-on-background">Listing Moderation</h2>
          <p className="font-admin-body-sm text-admin-on-surface-variant mt-1">Review, approve, or remove marketplace products.</p>
        </div>

        {/* BULK ACTION TOOLBAR */}
        {selected.length > 0 && (
          <div className="flex items-center gap-[16px] bg-admin-surface-container-lowest p-[8px] rounded-lg border border-admin-outline-variant shadow-sm">
            <div className="font-admin-body-sm text-admin-on-surface-variant px-2 border-r border-admin-outline-variant">
              {selected.length} selected
            </div>
            <button 
              disabled={isPending}
              onClick={handleBulkRemove} 
              className="flex items-center gap-2 bg-admin-surface-container-lowest hover:bg-admin-surface-container-high border border-admin-outline-variant text-admin-on-surface font-admin-body-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">block</span>
              Remove Selected
            </button>
            <button 
              disabled={isPending}
              onClick={handleBulkApprove} 
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-on-primary font-admin-body-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Approve Selected
            </button>
          </div>
        )}
      </div>

      {/* CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[24px]">
        {initialListings.map(listing => (
          <div 
            key={listing.id} 
            className={`bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl overflow-hidden flex flex-col group hover:border-admin-outline transition-colors relative ${selected.includes(listing.id) ? 'ring-2 ring-primary' : ''}`}
          >
            
            {/* CHECKBOX OVERLAY */}
            <div className="absolute top-3 left-3 z-10">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-admin-outline-variant text-primary focus:ring-primary focus:ring-opacity-20 cursor-pointer shadow-sm"
                checked={selected.includes(listing.id)}
                onChange={() => toggleSelection(listing.id)}
              />
            </div>

            {/* IMAGE */}
            <div className="h-48 w-full bg-admin-surface-container-highest relative overflow-hidden">
              <Image 
                src={listing.photos[0] || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80'} 
                fill 
                sizes="(max-width: 768px) 100vw, 300px"
                alt={listing.name} 
                className={`object-cover ${listing.status === 'ACTIVE' ? '' : 'grayscale opacity-80'}`} 
              />
              
              {/* STATUS BADGE */}
              <div className="absolute top-3 right-3">
                <span className={`font-admin-label-caps text-admin-label-caps px-2 py-1 rounded shadow-sm backdrop-blur-md text-[11px] uppercase tracking-wider flex items-center gap-1 ${
                  listing.status === 'PENDING_REVIEW' ? 'bg-admin-surface-variant text-admin-on-surface-variant border border-admin-outline-variant' :
                  listing.status === 'REMOVED' ? 'bg-error-container text-on-error-container border border-error/20' :
                  'bg-primary-container text-on-primary-container border border-primary/20'
                }`}>
                  {listing.status === 'REMOVED' && <span className="material-symbols-outlined text-[14px]">flag</span>}
                  {listing.status === 'PENDING_REVIEW' ? 'Pending Review' : listing.status}
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-[16px] flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface line-clamp-1">{listing.name}</h3>
                <div className="relative flex group/menu">
                  <button className="text-admin-outline hover:text-admin-on-surface transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                  <div className="absolute right-0 top-6 bg-admin-surface border border-admin-outline-variant shadow-lg rounded-md hidden group-hover/menu:flex flex-col w-32 z-20">
                    {listing.status !== 'ACTIVE' && (
                      <button onClick={() => handleApprove(listing.id)} className="text-left px-3 py-2 text-sm text-admin-on-surface hover:bg-admin-surface-container transition-colors">Approve</button>
                    )}
                    {listing.status !== 'REMOVED' && (
                      <button onClick={() => handleRemove(listing.id)} className="text-left px-3 py-2 text-sm text-error hover:bg-error-container/20 transition-colors">Remove</button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                <span className="font-admin-body-sm text-admin-on-surface-variant">{listing.farm.farmName}</span>
              </div>

              {/* BOTTOM ROW */}
              <div className="mt-auto pt-4 border-t border-admin-surface-container-highest flex items-end justify-between">
                <div>
                  <span className="font-admin-body-sm text-admin-outline block mb-1">Wholesale Price</span>
                  <div className="font-admin-h2 text-admin-h2 text-primary">
                    ₱{listing.pricePerKg.toFixed(2)}
                    <span className="font-admin-body-sm text-admin-on-surface-variant ml-1">/kg</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-admin-table-data text-admin-outline block">Posted</span>
                  <span className="font-admin-body-sm text-admin-on-surface-variant">{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
                </div>
              </div>

            </div>

          </div>
        ))}

        {initialListings.length === 0 && (
          <div className="col-span-full py-12 text-center text-admin-on-surface-variant">
            No listings found.
          </div>
        )}
      </div>

    </div>
  );
}
