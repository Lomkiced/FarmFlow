'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import NotificationDrawer from './NotificationDrawer';
import { getFarmerNotificationsAction } from '@/app/actions/farm';

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isDrawerOpenRef = useRef(isDrawerOpen);
  isDrawerOpenRef.current = isDrawerOpen;

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      const data = await getFarmerNotificationsAction();
      if (isMounted) {
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      }
    };
    fetchUnread();
    
    const interval = setInterval(() => {
      if (!isDrawerOpenRef.current) {
        fetchUnread();
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const renderBellIcon = (iconClass: string) => (
    <div className="relative flex items-center justify-center">
      <span className={`material-symbols-outlined ${iconClass}`}>notifications</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );

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
        <button onClick={() => setIsDrawerOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container transition-colors hover:bg-surface-container-high relative">
          {renderBellIcon("text-primary")}
        </button>
        <NotificationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
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
      <button onClick={() => setIsDrawerOpen(true)} className="text-[#1B4332] hover:opacity-80 transition-opacity relative p-1">
        {renderBellIcon("")}
      </button>
      <NotificationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </header>
  );
}
