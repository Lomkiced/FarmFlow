'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FarmerHeader from '@/components/farmer/FarmerHeader';
import FarmerBottomNav from '@/components/farmer/FarmerBottomNav';
import DesktopSidebarNav from '@/components/farmer/DesktopSidebarNav';
import CropStageBadge from '@/components/farmer/CropStageBadge';
import CropProgressBar from '@/components/farmer/CropProgressBar';
import { MockCrop } from '@/types';

export default function CropsPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  const mockCrops: MockCrop[] = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80',
      name: 'Heirloom Tomatoes',
      variety: 'Cherry Variety',
      stage: 'growing',
      planted: 'Oct 1',
      harvest: 'Nov 15',
      progress: 75,
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400&q=80',
      name: 'Japanese Eggplant',
      variety: 'Slim Variety',
      stage: 'ready',
      planted: 'Sep 10',
      harvest: 'Oct 25',
      progress: 100,
      harvestDue: true,
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400&q=80',
      name: 'Organic Carrots',
      variety: 'Nantes Variety',
      stage: 'seedling',
      planted: 'Sep 20',
      harvest: 'Calculating...',
      progress: 30,
    },
  ];

  return (
    <div className="bg-background min-h-screen pb-24 md:pb-0 flex md:flex-row flex-col font-body-md text-body-md w-full max-w-full">
      {/* Mobile header */}
      <FarmerHeader variant="default" />
      
      {/* Desktop sidebar */}
      <DesktopSidebarNav activePage="crops" />
      
      {/* Main content */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-[16px] md:px-[48px] py-8">
        
        <div className="flex justify-between items-end mb-[32px]">
          <div>
            <h1 className="text-[32px] font-bold text-primary">My Crops</h1>
            <p className="text-[16px] text-on-surface-variant mt-1">Manage your current active harvest.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-[#D4A373] text-white px-4 py-2 rounded-xl text-[14px] font-medium flex items-center gap-2 hover:bg-[#C28E5C] transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden sm:inline">Add Crop</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {mockCrops.map((crop) => (
            <div key={crop.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(27,67,50,0.04)] hover:shadow-[0_12px_32px_rgba(27,67,50,0.08)] transition-shadow duration-300 flex flex-col group relative">
              <div className="h-48 w-full relative overflow-hidden">
                <Image src={crop.image} alt={crop.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4">
                  <CropStageBadge stage={crop.stage} />
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-[20px] font-semibold text-primary mb-1">{crop.name}</h3>
                <p className="text-sm text-on-surface-variant mb-4">{crop.variety}</p>
                
                <div className="flex flex-col gap-3 mt-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Planted</span>
                    <span className="font-medium text-on-background">{crop.planted}</span>
                  </div>
                  
                  {crop.harvestDue ? (
                    <div className="flex justify-between text-sm text-[#F57F17] font-medium bg-[#FFF8E1] -mx-2 px-2 py-1 rounded-md">
                      <span>Harvest Due</span>
                      <span>{crop.harvest}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Harvest</span>
                      <span className="font-medium text-on-background">{crop.harvest}</span>
                    </div>
                  )}

                  <div className="mt-2 pt-4 border-t border-surface-variant">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[12px] font-semibold tracking-wider text-on-surface-variant uppercase">PROGRESS</span>
                      <span className={`text-[12px] font-semibold ${crop.stage === 'seedling' ? 'text-[#1565C0]' : crop.stage === 'growing' ? 'text-primary' : crop.stage === 'ready' ? 'text-[#F57F17]' : 'text-on-surface-variant'}`}>
                        {crop.progress}%
                      </span>
                    </div>
                    <CropProgressBar progress={crop.progress} stage={crop.stage} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* ADD NEW CROP placeholder card */}
          <div onClick={() => setShowAddModal(true)} className="bg-surface-variant/30 rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-8 text-center hover:bg-surface-variant/50 transition-colors cursor-pointer min-h-[350px]">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-3xl">add</span>
            </div>
            <h3 className="text-[20px] font-semibold text-primary mb-2">Plant Something New</h3>
            <p className="text-sm text-on-surface-variant max-w-[200px]">Expand your inventory by registering a new crop cycle.</p>
          </div>

        </div>

      </main>
      
      {/* Mobile bottom nav */}
      <FarmerBottomNav activePage="crops" />
    </div>
  );
}
