'use client';

import { useState, useEffect, useTransition } from 'react';
import { getFarmerNotificationsAction, markNotificationAsReadAction } from '@/app/actions/farm';

export default function NotificationDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;
    
    let isMounted = true;
    const fetchNotifs = async () => {
      const data = await getFarmerNotificationsAction();
      if (isMounted) setNotifications(data);
    };

    fetchNotifs();

    const interval = setInterval(() => {
      fetchNotifs();
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    
    const result = await markNotificationAsReadAction(id);
    if (!result.success) {
      // Revert if failed
      const data = await getFarmerNotificationsAction();
      setNotifications(data);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[100] transition-opacity" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-80 bg-surface shadow-2xl z-[101] flex flex-col transform transition-transform duration-300">
        <div className="p-4 border-b border-surface-variant flex justify-between items-center bg-surface-container-low">
          <h2 className="text-lg font-bold text-on-surface">Notifications</h2>
          <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-on-surface rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-70">
              <span className="material-symbols-outlined text-[48px] mb-3 text-outline font-light">notifications_off</span>
              <p className="text-[14px] font-medium">You have no notifications yet.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const date = new Date(n.createdAt);
              const now = new Date();
              const diffMs = now.getTime() - date.getTime();
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMins / 60);
              const diffDays = Math.floor(diffHours / 24);
              
              let timeAgo = '';
              if (diffDays > 0) timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
              else if (diffHours > 0) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
              else if (diffMins > 0) timeAgo = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
              else timeAgo = 'Just now';

              return (
                <div 
                  key={n.id} 
                  onClick={() => handleMarkAsRead(n.id, n.isRead)}
                  className={`p-3 rounded-xl border transition-all ${
                    n.isRead 
                      ? 'bg-surface border-surface-variant text-on-surface-variant' 
                      : 'bg-primary-container/20 border-primary-container text-on-surface shadow-sm cursor-pointer hover:bg-primary-container/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-[14px] ${n.isRead ? 'font-medium' : 'font-bold'}`}>{n.title}</h3>
                    {!n.isRead && <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                  </div>
                  <p className={`text-[12px] leading-[1.4] mb-2 ${n.isRead ? 'opacity-80' : 'opacity-90'}`}>{n.message}</p>
                  <div className="text-[10px] font-bold text-primary opacity-80 uppercase tracking-wider">{timeAgo}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
