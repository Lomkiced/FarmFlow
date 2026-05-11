'use client';

import { useState } from 'react';
import FarmerHeader from '@/components/farmer/FarmerHeader';
import FarmerBottomNav from '@/components/farmer/FarmerBottomNav';

export default function ActivitiesPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const filters = ['All', 'Irrigation', 'Pests', 'Fertilizing'];

  const activityGroups = [
    {
      date: 'Today, Oct 30',
      activities: [
        { id: '1', icon: 'water_drop', iconBg: 'bg-secondary-container', iconColor: 'text-on-secondary-container', title: 'Watering', time: '8:00 AM', crop: 'Heirloom Tomatoes', notes: '2 hours automatic system' },
        { id: '2', icon: 'eco', iconBg: 'bg-tertiary-container', iconColor: 'text-on-tertiary-container', title: 'Organic Feed', time: '10:30 AM', crop: 'Organic Carrots', notes: 'Applied compost tea' },
      ],
    },
    {
      date: 'Yesterday, Oct 29',
      activities: [
        { id: '3', icon: 'grass', iconBg: 'bg-surface-variant', iconColor: 'text-on-surface-variant', title: 'Manual Weeding', time: '4:00 PM', crop: 'Japanese Eggplant', notes: 'Section A cleared' },
      ],
    },
  ];

  return (
    <>
      <FarmerHeader variant="default" />
      <main className="flex-1 overflow-y-auto px-[16px] pt-[16px] pb-32">
        
        <h1 className="text-[24px] font-semibold text-on-surface mb-[16px]">Farm Activity Log</h1>

        {/* Filter chips */}
        <div className="flex gap-[8px] overflow-x-auto pb-4 scrollbar-hide">
          {filters.map(filter => (
            <button 
              key={filter} 
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-colors ${activeFilter === filter ? 'bg-secondary-container text-on-secondary-container' : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'}`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Activity feed timeline */}
        <div className="flex flex-col mt-[8px]">
          {activityGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <div className="text-[14px] font-medium text-on-surface-variant mb-[8px] mt-[8px]">{group.date}</div>
              <div className="relative pl-7 border-l-2 border-surface-variant ml-4 pb-[16px]">
                {group.activities.map((act) => (
                  <div key={act.id} className="relative mb-[16px] last:mb-0 group">
                    <div className={`absolute -left-[37px] top-1 w-8 h-8 rounded-full ${act.iconBg} ${act.iconColor} flex items-center justify-center border-4 border-background z-10`}>
                      <span className="material-symbols-outlined text-[16px]">{act.icon}</span>
                    </div>
                    <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_20px_rgba(27,67,50,0.04)] border border-surface-variant/50 hover:-translate-y-1 transition-transform duration-200">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-[20px] font-semibold text-on-surface">{act.title}</h3>
                        <span className="text-[12px] font-semibold text-outline">{act.time}</span>
                      </div>
                      <div className="inline-flex items-center gap-1 bg-surface-container py-1 px-2 rounded-md mb-2">
                        <span className="material-symbols-outlined text-[12px]">local_florist</span>
                        <span className="text-[12px] font-semibold text-secondary">{act.crop}</span>
                      </div>
                      <p className="text-[16px] text-on-surface-variant">{act.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </main>
      
      {/* FAB - Record Activity */}
      <button 
        className="fixed bottom-[88px] right-4 bg-primary text-on-primary shadow-[0_12px_32px_rgba(27,67,50,0.15)] rounded-xl px-5 py-3 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity z-40"
        onClick={() => setShowAddModal(true)}
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        <span className="text-[14px] font-semibold">Record Activity</span>
      </button>

      {/* <FarmerBottomNav activePage="activities" /> -> Wait, activities is not in bottom nav. We use home as fallback or remove it. The prompt specifies FarmerBottomNav activePage="home" */}
      <FarmerBottomNav activePage="home" />
    </>
  );
}
