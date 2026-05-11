'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AdminListing } from '@/types';

const mockListings: AdminListing[] = [
  {
    id: 'l1',
    name: 'Organic Heirloom Tomatoes',
    farm: 'Reyes Family Farm',
    price: 120,
    unit: 'kg',
    postedAgo: '2 hrs ago',
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80',
  },
  {
    id: 'l2',
    name: 'Premium Sweet Potatoes',
    farm: 'Dela Cruz Coop',
    price: 85,
    unit: 'kg',
    postedAgo: '5 hrs ago',
    status: 'flagged',
    image: 'https://images.unsplash.com/photo-1596097635121-14b38c5d7b47?w=400&q=80',
  },
  {
    id: 'l3',
    name: 'Green Bell Peppers (Class A)',
    farm: 'Northern Valley Farms',
    price: 150,
    unit: 'kg',
    postedAgo: '1 day ago',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80',
  },
  {
    id: 'l4',
    name: 'Washed White Potatoes',
    farm: 'AgriTech Supply',
    price: 65,
    unit: 'kg',
    postedAgo: '2 days ago',
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
  },
];

export default function ListingModerationPage() {
  const [selected, setSelected] = useState<string[]>(['l1', 'l2']);

  const toggleSelection = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex-1 p-[40px] flex flex-col gap-[24px]">
      
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-[24px]">
        <div>
          <h2 className="font-admin-h1 text-admin-h1 text-admin-on-background">Listing Moderation</h2>
          <p className="font-admin-body-sm text-admin-on-surface-variant mt-1">Review, approve, or flag marketplace products.</p>
        </div>

        {/* BULK ACTION TOOLBAR */}
        {selected.length > 0 && (
          <div className="flex items-center gap-[16px] bg-admin-surface-container-lowest p-[8px] rounded-lg border border-admin-outline-variant shadow-sm">
            <div className="font-admin-body-sm text-admin-on-surface-variant px-2 border-r border-admin-outline-variant">
              {selected.length} selected
            </div>
            <button onClick={() => setSelected([])} className="flex items-center gap-2 bg-admin-surface-container-lowest hover:bg-admin-surface-container-high border border-admin-outline-variant text-admin-on-surface font-admin-body-sm px-4 py-2 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[18px]">block</span>
              Remove Selected
            </button>
            <button onClick={() => setSelected([])} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-on-primary font-admin-body-sm px-4 py-2 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Approve Selected
            </button>
          </div>
        )}
      </div>

      {/* CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[24px]">
        {mockListings.map(listing => (
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
                src={listing.image} 
                fill 
                alt={listing.name} 
                className={`object-cover ${listing.status === 'active' ? '' : 'grayscale opacity-80'}`} 
              />
              
              {/* STATUS BADGE */}
              <div className="absolute top-3 right-3">
                <span className={`font-admin-label-caps text-admin-label-caps px-2 py-1 rounded shadow-sm backdrop-blur-md text-[11px] uppercase tracking-wider flex items-center gap-1 ${
                  listing.status === 'pending' ? 'bg-admin-surface-variant text-admin-on-surface-variant border border-admin-outline-variant' :
                  listing.status === 'flagged' ? 'bg-error-container text-on-error-container border border-error/20' :
                  'bg-primary-container text-on-primary-container border border-primary/20'
                }`}>
                  {listing.status === 'flagged' && <span className="material-symbols-outlined text-[14px]">flag</span>}
                  {listing.status === 'pending' ? 'Pending Review' : listing.status}
                </span>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-[16px] flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface line-clamp-1">{listing.name}</h3>
                <button className="text-admin-outline hover:text-admin-on-surface transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                <span className="font-admin-body-sm text-admin-on-surface-variant">{listing.farm}</span>
              </div>

              {/* BOTTOM ROW */}
              <div className="mt-auto pt-4 border-t border-admin-surface-container-highest flex items-end justify-between">
                <div>
                  <span className="font-admin-body-sm text-admin-outline block mb-1">Wholesale Price</span>
                  <div className="font-admin-h2 text-admin-h2 text-primary">
                    ₱{listing.price}
                    <span className="font-admin-body-sm text-admin-on-surface-variant ml-1">/{listing.unit}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-admin-table-data text-admin-outline block">Posted</span>
                  <span className="font-admin-body-sm text-admin-on-surface-variant">{listing.postedAgo}</span>
                </div>
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
