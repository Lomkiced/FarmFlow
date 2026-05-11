'use client';

import { useState } from 'react';

const CATEGORIES = ['All Produce', 'Rice', 'Vegetables', 'Fruits', 'Herbs', 'Root Crops'];

export default function CategoryFilter() {
  const [activeCategory, setActiveCategory] = useState('All Produce');

  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-2">
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`
              font-label-md text-[14px] whitespace-nowrap shrink-0 px-6 py-2 rounded-xl transition-colors
              ${
                isActive
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-highest text-on-surface border border-outline-variant/30 hover:bg-surface-variant'
              }
            `}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
