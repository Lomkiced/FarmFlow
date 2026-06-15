'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { 
  markNotificationReadAction, 
  markAllNotificationsReadAction, 
  deleteAllReadNotificationsAction 
} from '@/app/actions/notifications';

type NotificationType = 'NEW_USER' | 'PENDING_FARMER' | 'NEW_LISTING' | 'NEW_ORDER' | 'ORDER_STATUS_CHANGE' | 'PAYMENT_CONFIRMED';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedId: string | null;
  relatedType: string | null;
  createdAt: Date;
};

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case 'NEW_USER': return 'person_add';
    case 'PENDING_FARMER': return 'agriculture';
    case 'NEW_LISTING': return 'inventory_2';
    case 'NEW_ORDER': return 'shopping_cart';
    case 'ORDER_STATUS_CHANGE': return 'local_shipping';
    case 'PAYMENT_CONFIRMED': return 'payments';
    default: return 'notifications';
  }
};

const getRouteForNotification = (n: Notification) => {
  if (!n.relatedId) return null;
  switch (n.relatedType) {
    case 'farmer': return `/admin/farmers/${n.relatedId}`;
    case 'user': return `/admin/farmers?search=${n.relatedId}`;
    case 'product': return `/admin/listings`;
    case 'order': return `/admin/orders?buyer=${n.relatedId}`; // Could be order id if supported
    default: return null;
  }
};

export default function InboxClient({
  initialNotifications,
  unreadCount,
}: {
  initialNotifications: Notification[];
  unreadCount: number;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ALL');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const tabs = [
    { id: 'ALL', label: 'All' },
    { id: 'UNREAD', label: `Unread (${unreadCount})` },
    { id: 'NEW_USER', label: 'New Users' },
    { id: 'PENDING_FARMER', label: 'Farmers' },
    { id: 'NEW_LISTING', label: 'Listings' },
    { id: 'NEW_ORDER', label: 'Orders' },
    { id: 'PAYMENT_CONFIRMED', label: 'Payments' },
  ];

  const filteredNotifications = initialNotifications.filter((n) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'UNREAD') return !n.isRead;
    return n.type === activeTab;
  });

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      await markNotificationReadAction(n.id);
    }
    const route = getRouteForNotification(n);
    if (route) {
      router.push(route);
    } else {
      router.refresh();
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    await markAllNotificationsReadAction();
    setIsMarkingAll(false);
    router.refresh();
  };

  const handleDeleteAll = async () => {
    if (unreadCount > 0) return;
    setIsDeleting(true);
    await deleteAllReadNotificationsAction();
    setIsDeleting(false);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notification Inbox</h1>
          <p className="text-sm text-slate-500">All system notifications and alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll || unreadCount === 0}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isMarkingAll ? 'Marking...' : 'Mark all as read'}
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={isDeleting || unreadCount > 0 || initialNotifications.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            {isDeleting ? 'Deleting...' : 'Delete all'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">notifications_off</span>
            <p className="text-lg font-medium text-slate-700">No notifications found</p>
            <p className="text-sm">You are all caught up!</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {filteredNotifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`w-full text-left p-4 flex gap-4 transition-colors hover:bg-slate-50 ${
                  !n.isRead ? 'bg-blue-50/50' : 'bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  !n.isRead ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">{getIconForType(n.type)}</span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-4">
                    <span className={`text-sm font-semibold ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                      {n.title}
                    </span>
                    <span className="text-xs whitespace-nowrap text-slate-500 mt-0.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`text-sm ${!n.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                    {n.message}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
