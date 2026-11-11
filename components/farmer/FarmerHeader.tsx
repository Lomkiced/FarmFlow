'use client';

import { useState, useEffect, useRef } from 'react';
import NotificationDrawer from './NotificationDrawer';
import { getFarmerNotificationsAction } from '@/app/actions/farm';
import { ProfileAvatar } from '@/components/ui/ProfileMediaPlaceholders';

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
      <header className="flex justify-between items-center w-full px-4 h-16 sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <ProfileAvatar src={avatarUrl} alt={userName} className="w-10 h-10 border border-gray-200" sizes="40px" />
          <div>
            <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Good morning,</p>
            <h1 className="text-base font-bold text-gray-900">{userName}</h1>
          </div>
        </div>
        <button onClick={() => setIsDrawerOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 transition-colors hover:bg-gray-100 relative">
          {renderBellIcon("text-green-800")}
        </button>
        <NotificationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      </header>
    );
  }

  if (variant === 'back') {
    return (
      <header className="flex justify-between items-center w-full px-4 h-16 sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button className="text-gray-700 p-1" onClick={() => window.history.back()}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-green-800 font-bold text-xl tracking-tight">FarmFlow</h1>
        </div>
        <button className="text-gray-700 p-1">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>
    );
  }

  return (
    <header className="flex justify-between items-center w-full px-4 h-16 sticky top-0 z-40 bg-white border-b border-gray-200 md:hidden">
      <div className="flex items-center gap-3">
        <ProfileAvatar src={avatarUrl} alt={userName} className="w-8 h-8 border border-gray-200" sizes="32px" />
        <h1 className="text-green-800 font-bold text-xl tracking-tight">FarmFlow</h1>
      </div>
      <button onClick={() => setIsDrawerOpen(true)} className="text-gray-700 hover:text-green-800 transition-colors relative p-1">
        {renderBellIcon("")}
      </button>
      <NotificationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </header>
  );
}
