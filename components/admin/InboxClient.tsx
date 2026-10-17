'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { 
  markNotificationReadAction, 
  markAllNotificationsReadAction, 
  deleteAllReadNotificationsAction 
} from '@/app/actions/notifications';
import { resolveSupportInquiryAction } from '@/app/actions/support';

export type NotificationType =
  // Admin-facing
  | 'NEW_USER'
  | 'PENDING_FARMER'
  | 'NEW_LISTING'
  | 'NEW_ORDER'
  | 'ORDER_STATUS_CHANGE'
  | 'PAYMENT_CONFIRMED'
  | 'SUPPORT_INQUIRY'
  // Farmer-facing
  | 'ACCOUNT_APPROVED'
  | 'LISTING_APPROVED'
  | 'LISTING_REMOVED'
  | 'NEW_CUSTOMER_ORDER'
  | 'ORDER_CONFIRMED'
  | 'ORDER_READY'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  // Refund notifications
  | 'REFUND_REQUESTED'
  | 'REFUND_APPROVED'
  | 'REFUND_REJECTED';

export type Notification = {
  id: string;
  recipientId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedId: string | null;
  relatedType: string | null;
  createdAt: Date;
};

export type SupportInquiryItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case 'NEW_USER': return 'person_add';
    case 'PENDING_FARMER': return 'agriculture';
    case 'NEW_LISTING': return 'inventory_2';
    case 'NEW_ORDER': return 'shopping_cart';
    case 'ORDER_STATUS_CHANGE': return 'local_shipping';
    case 'PAYMENT_CONFIRMED': return 'payments';
    case 'SUPPORT_INQUIRY': return 'contact_support';
    case 'REFUND_REQUESTED': return 'assignment_return';
    case 'REFUND_APPROVED': return 'published_with_changes';
    case 'REFUND_REJECTED': return 'cancel_presentation';
    default: return 'notifications';
  }
};

const getRouteForNotification = (n: Notification) => {
  if (n.type === 'REFUND_REQUESTED' || n.type === 'REFUND_APPROVED' || n.type === 'REFUND_REJECTED') {
    return `/admin/orders`;
  }
  if (!n.relatedId) return null;
  switch (n.relatedType) {
    case 'farmer': return `/admin/farmers/${n.relatedId}`;
    case 'user': return `/admin/farmers?search=${n.relatedId}`;
    case 'product': return `/admin/listings`;
    case 'order': return `/admin/orders`;
    default: return null;
  }
};

export default function InboxClient({
  initialNotifications,
  unreadCount,
  initialInquiries = [],
}: {
  initialNotifications: Notification[];
  unreadCount: number;
  initialInquiries?: SupportInquiryItem[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ALL');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [inquiries, setInquiries] = useState<SupportInquiryItem[]>(initialInquiries);
  const [inquiryFilter, setInquiryFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  const [updatingInquiryId, setUpdatingInquiryId] = useState<string | null>(null);

  const openInquiriesCount = inquiries.filter((i) => i.status === 'OPEN').length;

  const tabs = [
    { id: 'ALL', label: 'All Notifications' },
    { id: 'UNREAD', label: `Unread (${unreadCount})` },
    { id: 'SUPPORT_INQUIRIES', label: `Support Tickets (${openInquiriesCount} Open)` },
    { id: 'REFUND_REQUESTED', label: 'Refund Requests' },
    { id: 'PENDING_FARMER', label: 'Farmers' },
    { id: 'NEW_ORDER', label: 'Orders' },
    { id: 'NEW_LISTING', label: 'Listings' },
    { id: 'NEW_USER', label: 'New Users' },
    { id: 'PAYMENT_CONFIRMED', label: 'Payments' },
  ];

  const filteredNotifications = initialNotifications.filter((n) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'UNREAD') return !n.isRead;
    return n.type === activeTab;
  });

  const filteredInquiries = inquiries.filter((i) => {
    if (inquiryFilter === 'ALL') return true;
    return i.status === inquiryFilter;
  });

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      await markNotificationReadAction(n.id);
    }

    if (n.type === 'SUPPORT_INQUIRY') {
      setActiveTab('SUPPORT_INQUIRIES');
      return;
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

  const handleToggleInquiryStatus = async (inquiryId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'OPEN' ? 'RESOLVED' : 'OPEN';
    setUpdatingInquiryId(inquiryId);

    try {
      const res = await resolveSupportInquiryAction(inquiryId, nextStatus);
      if (res.success) {
        toast.success(res.message || `Inquiry marked as ${nextStatus.toLowerCase()}`);
        setInquiries((prev) =>
          prev.map((i) => (i.id === inquiryId ? { ...i, status: nextStatus } : i))
        );
      } else {
        toast.error(res.error || 'Failed to update inquiry status');
      }
    } catch {
      toast.error('Failed to update inquiry status');
    } finally {
      setUpdatingInquiryId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Notification & Support Inbox</h1>
          <p className="text-sm text-slate-500">Manage system notifications, customer inquiries, and dispute alerts</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab !== 'SUPPORT_INQUIRIES' && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Primary Tabs */}
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

      {/* SUPPORT INQUIRIES VIEW */}
      {activeTab === 'SUPPORT_INQUIRIES' ? (
        <div className="flex flex-col gap-4">
          {/* Sub-filter for Support Inquiries */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-sm font-semibold text-slate-700">Filter Inquiries:</span>
            <div className="flex items-center gap-2">
              {(['ALL', 'OPEN', 'RESOLVED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setInquiryFilter(filter)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    inquiryFilter === filter
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredInquiries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-500">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">mark_email_read</span>
              <p className="text-lg font-medium text-slate-700">No support inquiries found</p>
              <p className="text-sm">There are currently no tickets matching the selected filter.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    inquiry.status === 'OPEN'
                      ? 'bg-white border-amber-200 shadow-sm'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        inquiry.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        <span className="material-symbols-outlined text-[20px]">
                          {inquiry.status === 'OPEN' ? 'contact_support' : 'check_circle'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{inquiry.name}</h3>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            inquiry.status === 'OPEN'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {inquiry.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span>{inquiry.email}</span>
                          {inquiry.phone && <span>• {inquiry.phone}</span>}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md mb-2">
                      Subject: {inquiry.subject}
                    </span>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {inquiry.message}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <a
                      href={`mailto:${inquiry.email}?subject=FarmFlow Support: ${encodeURIComponent(inquiry.subject)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">reply</span>
                      Reply via Email ({inquiry.email})
                    </a>

                    <button
                      type="button"
                      disabled={updatingInquiryId === inquiry.id}
                      onClick={() => handleToggleInquiryStatus(inquiry.id, inquiry.status)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 ${
                        inquiry.status === 'OPEN'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                    >
                      {updatingInquiryId === inquiry.id ? (
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">
                          {inquiry.status === 'OPEN' ? 'done_all' : 'restart_alt'}
                        </span>
                      )}
                      {inquiry.status === 'OPEN' ? 'Mark as Resolved' : 'Reopen Ticket'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* NOTIFICATIONS LIST */
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
      )}
    </div>
  );
}
