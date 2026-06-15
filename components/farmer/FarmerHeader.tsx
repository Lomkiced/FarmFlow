'use client';

import Image from 'next/image';

interface FarmerHeaderProps {
  variant?: 'default' | 'dashboard' | 'back'
  title?: string
  showNotifications?: boolean
  userName?: string
  avatarUrl?: string | null
}

export default function FarmerHeader({ 
  variant = 'default', 
  userName = 'Farmer', 
  avatarUrl 
}: FarmerHeaderProps) {
  const avatarToUse = avatarUrl || "https://i.pravatar.cc/150?img=12";

  if (variant === 'dashboard') {
    return (
      <header className="flex justify-between items-center w-full px-[16px] h-16 sticky top-0 z-40 bg-[#FAFAF7] border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Image src={avatarToUse} width={40} height={40} className="rounded-full object-cover border-2 border-surface" alt="Farmer" />
          <div>
            <p className="text-[12px] font-semibold tracking-[0.03em] text-on-surface-variant">Good morning,</p>
            <h1 className="text-[20px] font-semibold leading-[1.4] text-on-background">{userName}</h1>
          </div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container">
          <span className="material-symbols-outlined text-primary">notifications</span>
        </button>
      </header>
    );
  }

  if (variant === 'back') {
    return (
      <header className="flex justify-between items-center w-full px-4 h-16 sticky top-0 z-40 bg-[#FAFAF7] border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button className="text-[#1B4332] p-1" onClick={() => window.history.back()}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-[#1B4332] font-black text-xl tracking-tighter">FarmFlow</h1>
        </div>
        <button className="text-[#1B4332] p-1">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>
    );
  }

  return (
    <header className="flex justify-between items-center w-full px-4 h-16 sticky top-0 z-40 bg-[#FAFAF7] border-b border-stone-200 md:hidden">
      <div className="flex items-center gap-3">
        <Image src={avatarToUse} width={32} height={32} className="rounded-full object-cover" alt="Farmer" />
        <h1 className="text-[#1B4332] font-black text-xl tracking-tighter">FarmFlow</h1>
      </div>
      <button className="text-[#1B4332] hover:opacity-80 transition-opacity">
        <span className="material-symbols-outlined">notifications</span>
      </button>
    </header>
  );
}
