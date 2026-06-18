'use client';

import { useState } from 'react';
import AddActivityModal from './AddActivityModal';

type Activity = {
  id: string;
  activityType: string;
  description: string | null;
  inputsUsed: string | null;
  quantity: number | null;
  unit: string | null;
  activityDate: Date;
  crop: {
    cropName: string;
    variety: string | null;
  } | null;
};

const activityIcons: Record<string, { icon: string; bg: string; color: string }> = {
  PLANTING: { icon: 'psychiatry', bg: 'bg-primary-container', color: 'text-on-primary-container' },
  WATERING: { icon: 'water_drop', bg: 'bg-secondary-container', color: 'text-on-secondary-container' },
  FERTILIZING: { icon: 'eco', bg: 'bg-tertiary-container', color: 'text-on-tertiary-container' },
  PEST_CONTROL: { icon: 'pest_control', bg: 'bg-error-container', color: 'text-on-error-container' },
  WEEDING: { icon: 'grass', bg: 'bg-surface-variant', color: 'text-on-surface-variant' },
  HARVESTING: { icon: 'spa', bg: 'bg-[#fef3c7]', color: 'text-[#b45309]' },
  OTHER: { icon: 'agriculture', bg: 'bg-surface-container-high', color: 'text-on-surface' },
};

export default function ActivitiesClient({
  activities,
  crops,
}: {
  activities: Activity[];
  crops: { id: string; cropName: string }[];
}) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const filters = ['All', 'Planting', 'Watering', 'Fertilizing', 'Pest Control', 'Weeding', 'Harvesting', 'Other'];

  const filteredActivities = activities.filter((act) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Planting' && act.activityType === 'PLANTING') return true;
    if (activeFilter === 'Watering' && act.activityType === 'WATERING') return true;
    if (activeFilter === 'Fertilizing' && act.activityType === 'FERTILIZING') return true;
    if (activeFilter === 'Pest Control' && act.activityType === 'PEST_CONTROL') return true;
    if (activeFilter === 'Weeding' && act.activityType === 'WEEDING') return true;
    if (activeFilter === 'Harvesting' && act.activityType === 'HARVESTING') return true;
    if (activeFilter === 'Other' && act.activityType === 'OTHER') return true;
    return false;
  });

  // Group by date
  const grouped = filteredActivities.reduce((acc, act) => {
    const dateStr = new Date(act.activityDate).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(act);
    return acc;
  }, {} as Record<string, Activity[]>);

  const activityGroups = Object.entries(grouped).map(([date, acts]) => ({
    date,
    activities: acts,
  }));

  return (
    <>
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
        {activityGroups.length === 0 ? (
          <p className="text-[14px] text-on-surface-variant text-center py-8">No activities found.</p>
        ) : (
          activityGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <div className="text-[14px] font-medium text-on-surface-variant mb-[8px] mt-[8px]">{group.date}</div>
              <div className="relative pl-7 border-l-2 border-surface-variant ml-4 pb-[16px]">
                {group.activities.map((act) => {
                  const style = activityIcons[act.activityType] || activityIcons.OTHER;
                  const time = new Date(act.activityDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={act.id} className="relative mb-[16px] last:mb-0 group">
                      <div className={`absolute -left-[37px] top-1 w-8 h-8 rounded-full ${style.bg} ${style.color} flex items-center justify-center border-4 border-background z-10`}>
                        <span className="material-symbols-outlined text-[16px]">{style.icon}</span>
                      </div>
                      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_20px_rgba(27,67,50,0.04)] border border-surface-variant/50 hover:-translate-y-1 transition-transform duration-200">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-[18px] font-semibold text-on-surface capitalize">
                            {act.activityType.toLowerCase().replace('_', ' ')}
                          </h3>
                        </div>
                        {act.crop && (
                          <div className="inline-flex items-center gap-1 bg-surface-container py-1 px-2 rounded-md mb-2">
                            <span className="material-symbols-outlined text-[12px]">local_florist</span>
                            <span className="text-[12px] font-semibold text-secondary">{act.crop.cropName}</span>
                          </div>
                        )}
                        {act.description && (
                          <p className="text-[14px] text-on-surface-variant mt-1">{act.description}</p>
                        )}
                        {act.inputsUsed && (
                          <div className="mt-2 text-[12px] text-on-surface-variant bg-surface-variant/30 p-2 rounded-md">
                            <span className="font-medium text-on-surface">Input:</span> {act.inputsUsed} 
                            {act.quantity ? ` (${act.quantity} ${act.unit || ''})` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB - Record Activity */}
      <button 
        className="fixed bottom-[88px] right-4 bg-primary text-on-primary shadow-[0_12px_32px_rgba(27,67,50,0.15)] rounded-xl px-5 py-3 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity z-40"
        onClick={() => setShowAddModal(true)}
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        <span className="text-[14px] font-semibold">Record Activity</span>
      </button>

      <AddActivityModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        crops={crops} 
      />
    </>
  );
}
