'use client';

import Image from 'next/image';
import { useUIStore } from '@/store/uiStore';

export default function AdminTopbar() {
  const { toggleAdminSidebar } = useUIStore();

  return (
    <div className="h-16 w-full sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
      
      {/* LEFT: Menu & Search */}
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger */}
        <button 
          onClick={toggleAdminSidebar}
          className="md:hidden p-2 -ml-2 rounded-lg text-admin-on-surface-variant hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Search input */}
        <div className="relative w-48 md:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-outline-variant">
            search
          </span>
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 border border-admin-outline-variant rounded-lg bg-admin-surface-container-lowest text-admin-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary font-admin-body-sm text-admin-body-sm outline-none"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 md:gap-6">
        <button className="p-2 rounded-full hover:bg-slate-50 transition-colors relative text-admin-on-surface-variant">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-admin-outline-variant">
            <Image src="https://i.pravatar.cc/150?img=3" width={32} height={32} className="object-cover" alt="Admin" />
          </div>
          <div className="hidden md:block">
            <div className="font-admin-body-sm font-medium text-admin-on-surface">Admin User</div>
            <div className="font-admin-label-caps text-admin-label-caps text-secondary uppercase">Superadmin</div>
          </div>
        </div>
      </div>

    </div>
  );
}
