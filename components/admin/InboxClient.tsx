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
import PaginationBar from '@/components/ui/PaginationBar';

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

  const [notifPage, setNotifPage] = useState(1);
  const [notifPageSize, setNotifPageSize] = useState(6);
  const [inquiryPage, setInquiryPage] = useState(1);
  const [inquiryPageSize, setInquiryPageSize] = useState(5);

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

  const notifTotalPages = Math.max(1, Math.ceil(filteredNotifications.length / notifPageSize));
  const safeNotifPage = Math.min(notifPage, notifTotalPages);
  const paginatedNotifications = filteredNotifications.slice(
    (safeNotifPage - 1) * notifPageSize,
    safeNotifPage * notifPageSize
  );

  const filteredInquiries = inquiries.filter((i) => {
    if (inquiryFilter === 'ALL') return true;
    return i.status === inquiryFilter;
  });

  const inquiryTotalPages = Math.max(1, Math.ceil(filteredInquiries.length / inquiryPageSize));
  const safeInquiryPage = Math.min(inquiryPage, inquiryTotalPages);
  const paginatedInquiries = filteredInquiries.slice(
    (safeInquiryPage - 1) * inquiryPageSize,
    safeInquiryPage * inquiryPageSize
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Admin Notification & Support Inbox</h1>
          <p className="text-sm text-gray-500">Manage system notifications, customer inquiries, and dispute alerts</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab !== 'SUPPORT_INQUIRIES' && (
            <>
              <button
                onClick={handleMarkAllRead}
                disabled={isMarkingAll || unreadCount === 0}
                className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isMarkingAll ? 'Marking...' : 'Mark all as read'}
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={isDeleting || unreadCount > 0 || initialNotifications.length === 0}
                className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete read'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Primary Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setNotifPage(1);
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-green-800 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
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
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Filter Inquiries:</span>
            <div className="flex items-center gap-1.5">
              {(['ALL', 'OPEN', 'RESOLVED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setInquiryFilter(filter)}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    inquiryFilter === filter
                      ? 'bg-green-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredInquiries.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
              <p className="text-sm font-semibold text-gray-700">No support inquiries found</p>
              <p className="text-xs text-gray-400 mt-1">There are currently no tickets matching the selected filter.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {paginatedInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className={`p-5 rounded-lg border transition-colors ${
                    inquiry.status === 'OPEN'
                      ? 'bg-white border-gray-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-sm">{inquiry.name}</h3>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          inquiry.status === 'OPEN'
                            ? 'bg-gray-100 text-gray-800 border-gray-300'
                            : 'bg-green-50 text-green-800 border-green-200'
                        }`}>
                          {inquiry.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span>{inquiry.email}</span>
                        {inquiry.phone && <span>• {inquiry.phone}</span>}
                      </div>
                    </div>

                    <span className="text-xs text-gray-400 tabular-nums">
                      {formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded mb-2">
                      Subject: {inquiry.subject}
                    </span>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">
                      {inquiry.message}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
                    <a
                      href={`mailto:${inquiry.email}?subject=FarmFlow Support: ${encodeURIComponent(inquiry.subject)}`}
                      className="text-xs font-semibold text-green-800 hover:text-green-900 transition-colors"
                    >
                      Reply via Email ({inquiry.email})
                    </a>

                    <button
                      type="button"
                      disabled={updatingInquiryId === inquiry.id}
                      onClick={() => handleToggleInquiryStatus(inquiry.id, inquiry.status)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors disabled:opacity-50 cursor-pointer ${
                        inquiry.status === 'OPEN'
                          ? 'bg-green-800 hover:bg-green-900 text-white'
                          : 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {updatingInquiryId === inquiry.id
                        ? 'Updating...'
                        : inquiry.status === 'OPEN'
                        ? 'Mark as Resolved'
                        : 'Reopen Ticket'}
                    </button>
                  </div>
                </div>
              ))}
              <PaginationBar
                currentPage={safeInquiryPage}
                totalPages={inquiryTotalPages}
                totalItems={filteredInquiries.length}
                pageSize={inquiryPageSize}
                onPageChange={setInquiryPage}
                onPageSizeChange={(size) => {
                  setInquiryPageSize(size);
                  setInquiryPage(1);
                }}
                pageSizeOptions={[3, 5, 10, 20]}
                itemLabel="support tickets"
              />
            </div>
          )}
        </div>
      ) : (
        /* NOTIFICATIONS LIST */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-sm font-semibold text-gray-700">No notifications found</p>
              <p className="text-xs text-gray-400 mt-1">You are all caught up.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {paginatedNotifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left p-4 flex items-start justify-between gap-4 transition-colors hover:bg-gray-50 cursor-pointer ${
                    !n.isRead ? 'bg-green-50/40' : 'bg-white'
                  }`}
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-4">
                      <span className={`text-xs font-semibold ${!n.isRead ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                        {n.title}
                      </span>
                      <span className="text-[11px] whitespace-nowrap text-gray-400 tabular-nums">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-xs ${!n.isRead ? 'text-gray-800' : 'text-gray-500'}`}>
                      {n.message}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-green-800 mt-1.5 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <PaginationBar
              currentPage={safeNotifPage}
              totalPages={notifTotalPages}
              totalItems={filteredNotifications.length}
              pageSize={notifPageSize}
              onPageChange={setNotifPage}
              onPageSizeChange={(size) => {
                setNotifPageSize(size);
                setNotifPage(1);
              }}
              pageSizeOptions={[4, 6, 12, 24]}
              itemLabel="notifications"
              className="shadow-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
