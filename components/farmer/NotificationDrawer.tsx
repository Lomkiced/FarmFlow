'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  getFarmerNotificationsAction,
  markNotificationAsReadAction,
  markAllFarmerNotificationsReadAction,
} from '@/app/actions/farm';

// ─── Type icon/color map ──────────────────────────────────────────────────────

type NotifStyle = {
  icon: string;
  iconBg: string;
  iconColor: string;
};

function getNotifStyle(type: string): NotifStyle {
  switch (type) {
    case 'ACCOUNT_APPROVED':
      return { icon: 'verified', iconBg: 'bg-secondary-container', iconColor: 'text-secondary' };
    case 'LISTING_APPROVED':
      return { icon: 'storefront', iconBg: 'bg-secondary-container', iconColor: 'text-secondary' };
    case 'LISTING_REMOVED':
      return { icon: 'remove_shopping_cart', iconBg: 'bg-error/10', iconColor: 'text-error' };
    case 'NEW_CUSTOMER_ORDER':
      return { icon: 'shopping_bag', iconBg: 'bg-primary/10', iconColor: 'text-primary' };
    case 'ORDER_CONFIRMED':
      return { icon: 'task_alt', iconBg: 'bg-primary/10', iconColor: 'text-primary' };
    case 'ORDER_READY':
      return { icon: 'inventory_2', iconBg: 'bg-primary/10', iconColor: 'text-primary' };
    case 'ORDER_DELIVERED':
      return { icon: 'local_shipping', iconBg: 'bg-secondary-container', iconColor: 'text-secondary' };
    case 'ORDER_CANCELLED':
      return { icon: 'cancel', iconBg: 'bg-error/10', iconColor: 'text-error' };
    default:
      return { icon: 'notifications', iconBg: 'bg-surface-container-high', iconColor: 'text-on-surface-variant' };
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'Just now';
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotificationDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Fetch notifications when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const fetchNotifs = async () => {
      setIsLoading(true);
      const data = await getFarmerNotificationsAction();
      if (isMounted) {
        setNotifications(data);
        setIsLoading(false);
      }
    };

    fetchNotifs();

    const interval = setInterval(fetchNotifs, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen]);

  const handleMarkAsRead = (id: string, isRead: boolean) => {
    if (isRead) return;
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    markNotificationAsReadAction(id).then((result) => {
      if (!result.success) {
        // Revert on failure
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
      }
    });
  };

  const handleMarkAllRead = () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    startTransition(async () => {
      await markAllFarmerNotificationsReadAction();
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[100] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[320px] sm:w-80 bg-surface shadow-2xl z-[101] flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-surface-variant flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-bold text-on-surface">Notifications</h2>
            {unreadCount > 0 && (
              <span className="text-[11px] font-bold bg-primary text-on-primary px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[12px] font-semibold text-primary hover:text-primary/70 transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col gap-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-surface-container-high rounded w-3/4" />
                    <div className="h-3 bg-surface-container-high rounded w-full" />
                    <div className="h-2 bg-surface-container rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px] text-outline">notifications_off</span>
              </div>
              <p className="text-[15px] font-semibold text-on-surface mb-1">No notifications yet</p>
              <p className="text-[13px] text-on-surface-variant">
                You'll be notified when your account is approved, listings change status, or customers place orders.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-surface-variant">
              {notifications.map((n) => {
                const style = getNotifStyle(n.type);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleMarkAsRead(n.id, n.isRead)}
                    className={`w-full text-left p-4 flex gap-3 transition-colors ${
                      n.isRead
                        ? 'bg-surface hover:bg-surface-container-low'
                        : 'bg-primary/5 hover:bg-primary/10 cursor-pointer'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${style.iconBg}`}>
                      <span
                        className={`material-symbols-outlined text-[20px] ${style.iconColor}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {style.icon}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-[13px] leading-snug ${n.isRead ? 'font-medium text-on-surface-variant' : 'font-bold text-on-surface'}`}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[12px] text-on-surface-variant leading-snug mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[11px] font-semibold text-primary/70 mt-1.5 uppercase tracking-wider">
                        {formatTimeAgo(n.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
