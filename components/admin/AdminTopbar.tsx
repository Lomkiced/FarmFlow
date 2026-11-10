'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useUIStore } from '@/store/uiStore';
import { globalSearchAdminAction } from '@/app/actions/admin';
import {
  getTopUnreadNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from '@/app/actions/notifications';

const ROUTE_META: Record<string, { title: string; badge: string }> = {
  '/admin': { title: 'Executive Command Center', badge: 'Live Telemetry' },
  '/admin/inbox': { title: 'Notification & Support Inbox', badge: 'Communications' },
  '/admin/farmers': { title: 'Farmers & KYC Verification', badge: 'RSBSA Registry' },
  '/admin/buyers': { title: 'Buyer Directory & Trust', badge: 'B2B / B2C Accounts' },
  '/admin/listings': { title: 'Harvest Listings Moderation', badge: 'Catalog Audit' },
  '/admin/orders': { title: 'Order Logistics & Escrow', badge: 'Fulfillment' },
  '/admin/analytics': { title: 'Platform Intelligence & BI', badge: 'Metrics' },
  '/admin/settings': { title: 'Platform Governance Settings', badge: 'Configuration' },
};

export default function AdminTopbar() {
  const { toggleAdminSidebar } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [results, setResults] = useState<{
    farmers: any[];
    products: any[];
    orders: any[];
    users: any[];
  } | null>(null);

  const [notifs, setNotifs] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentMeta =
    ROUTE_META[pathname] ||
    (pathname.startsWith('/admin/farmers/')
      ? { title: 'Farmer Dossier & Audit', badge: 'KYC Inspector' }
      : { title: 'Admin Portal', badge: 'Governance' });

  // Fetch notifications
  const loadNotifications = () => {
    getTopUnreadNotificationsAction().then((res) => {
      if (res && !('error' in res)) {
        setNotifs((res as any).notifications || []);
        setUnreadCount((res as any).unreadCount || 0);
      }
    });
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Debounce input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 280);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch results
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsSearching(true);
      setIsDropdownOpen(true);
      globalSearchAdminAction(debouncedQuery).then((res) => {
        if (res.error) {
          setResults({ farmers: [], products: [], orders: [], users: [], error: res.error } as any);
        } else {
          setResults(res);
        }
        setIsSearching(false);
      });
    } else {
      setResults(null);
      setIsDropdownOpen(false);
    }
  }, [debouncedQuery]);

  // Click outside and keyboard shortcuts (Ctrl+K / Escape)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsNotifsOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleResultClick = (url: string) => {
    setIsDropdownOpen(false);
    setSearchQuery('');
    setDebouncedQuery('');
    router.push(url);
  };

  return (
    <header className="h-16 w-full sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 gap-4">
      {/* LEFT: Mobile Menu, Route Context & Global Search */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Mobile Hamburger */}
        <button
          onClick={toggleAdminSidebar}
          className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Toggle Menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        {/* Active Module Breadcrumb Badge (Desktop) */}
        <div className="hidden xl:flex items-center gap-2.5 pr-4 border-r border-gray-200 shrink-0">
          <span className="text-sm font-bold text-gray-900 tracking-tight">
            {currentMeta.title}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-green-50 text-green-800 border border-green-200">
            {currentMeta.badge}
          </span>
        </div>

        {/* Global Command Search */}
        <div className="relative flex-1 max-w-md" ref={dropdownRef}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
            search
          </span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search farmers, RSBSA, listings, orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (debouncedQuery.length >= 2) setIsDropdownOpen(true);
            }}
            className="w-full pl-9 pr-14 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white text-gray-900 focus:border-green-800 focus:ring-1 focus:ring-green-800 text-xs font-medium outline-none transition-all"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white border border-gray-200 rounded absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            Ctrl K
          </kbd>

          {/* Results Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full min-w-[300px] md:min-w-[400px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden flex flex-col max-h-[460px]">
              {isSearching ? (
                <div className="p-6 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <span className="text-xs font-medium">Searching directory...</span>
                </div>
              ) : results ? (
                <div className="overflow-y-auto py-1 divide-y divide-gray-100">
                  {(results as any).error ? (
                    <div className="p-6 text-center text-red-700">
                      <p className="text-xs font-semibold">Search Failed</p>
                      <p className="text-[11px] mt-1">{(results as any).error}</p>
                    </div>
                  ) : (results.farmers?.length || 0) === 0 &&
                    (results.products?.length || 0) === 0 &&
                    (results.orders?.length || 0) === 0 &&
                    (results.users?.length || 0) === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <p className="text-xs font-semibold text-gray-800">No matching records</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Nothing matched &ldquo;{debouncedQuery}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <>
                      {results.farmers.length > 0 && (
                        <div>
                          <div className="px-3.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
                            Farmers ({results.farmers.length})
                          </div>
                          {results.farmers.map((f: any) => (
                            <button
                              key={f.id}
                              onClick={() =>
                                handleResultClick(`/admin/farmers?location=${encodeURIComponent(f.farmName)}`)
                              }
                              className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center justify-between transition-colors"
                            >
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-gray-900 truncate">{f.farmName}</span>
                                <span className="text-[11px] text-gray-500 truncate">{f.user.name}</span>
                              </div>
                              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Farmer</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {results.products.length > 0 && (
                        <div>
                          <div className="px-3.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
                            Listings ({results.products.length})
                          </div>
                          {results.products.map((p: any) => (
                            <button
                              key={p.id}
                              onClick={() => handleResultClick(`/admin/listings`)}
                              className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center justify-between transition-colors"
                            >
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-gray-900 truncate">{p.name}</span>
                                <span className="text-[11px] text-gray-500 truncate">{p.farm.farmName}</span>
                              </div>
                              <span className="text-xs font-bold text-green-800 tabular-nums">₱{p.pricePerKg}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {results.orders.length > 0 && (
                        <div>
                          <div className="px-3.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
                            Orders ({results.orders.length})
                          </div>
                          {results.orders.map((o: any) => (
                            <button
                              key={o.id}
                              onClick={() =>
                                handleResultClick(`/admin/orders?buyer=${encodeURIComponent(o.buyer.name)}`)
                              }
                              className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex flex-col transition-colors"
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-xs font-mono font-bold text-green-800">
                                  #{o.id.slice(0, 8).toUpperCase()}
                                </span>
                                <span className="text-xs font-bold text-gray-900 tabular-nums">₱{o.totalAmount}</span>
                              </div>
                              <div className="flex items-center justify-between w-full mt-0.5">
                                <span className="text-[11px] text-gray-500">{o.buyer.name}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded border border-gray-200 bg-gray-50 text-gray-700 font-medium uppercase">
                                  {o.orderStatus}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {results.users.length > 0 && (
                        <div>
                          <div className="px-3.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
                            Users ({results.users.length})
                          </div>
                          {results.users.map((u: any) => (
                            <button
                              key={u.id}
                              onClick={() => handleResultClick(u.role === 'BUYER' ? '/admin/buyers' : '/admin/farmers')}
                              className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center justify-between transition-colors"
                            >
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-gray-900 truncate">{u.name}</span>
                                <span className="text-[11px] text-gray-500 truncate">{u.email}</span>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 font-medium uppercase">
                                {u.role}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Status, Notifications & Profile */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {/* Live Escrow & KYC Status Pill */}
        <Link
          href="/admin/orders"
          className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded border border-green-200 bg-green-50/70 text-[11px] font-semibold text-green-900 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-green-800" />
          <span>Escrow & Cold-Chain Active</span>
        </Link>

        {/* NOTIFICATIONS */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifsOpen(!isNotifsOpen)}
            className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors relative text-gray-700 flex items-center justify-center cursor-pointer"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[19px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-red-700 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifsOpen && (
            <div className="absolute top-[calc(100%+6px)] right-0 w-[340px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                    Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-green-50 text-green-800 border border-green-200 rounded">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={async () => {
                      await markAllNotificationsReadAction();
                      loadNotifications();
                    }}
                    className="text-[11px] font-semibold text-green-800 hover:text-green-900 transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="flex flex-col max-h-[340px] overflow-y-auto divide-y divide-gray-100">
                {notifs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p className="text-xs font-semibold text-gray-700">All caught up</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">No unread notifications.</p>
                  </div>
                ) : (
                  notifs.map((n) => (
                    <button
                      key={n.id}
                      onClick={async () => {
                        await markNotificationReadAction(n.id);
                        setIsNotifsOpen(false);
                        loadNotifications();
                        if (n.relatedType === 'farmer') router.push(`/admin/farmers/${n.relatedId}`);
                        else if (n.relatedType === 'product') router.push(`/admin/listings`);
                        else if (n.relatedType === 'order') router.push(`/admin/orders?buyer=${n.relatedId}`);
                        else router.push('/admin/inbox');
                      }}
                      className="w-full text-left p-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-gray-900 truncate">{n.title}</span>
                        <span className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">{n.message}</span>
                        <span className="text-[10px] text-gray-400 mt-1 tabular-nums">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-gray-200 bg-gray-50 text-center">
                <Link
                  href="/admin/inbox"
                  onClick={() => setIsNotifsOpen(false)}
                  className="w-full py-1 block text-xs font-semibold text-green-800 hover:text-green-900 transition-colors"
                >
                  Open Support & Alerts Inbox →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* SUPERADMIN PROFILE PILL */}
        <Link
          href="/admin/settings"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="leading-tight text-left">
            <div className="text-xs font-bold text-gray-900">Provincial Admin</div>
            <div className="text-[10px] font-semibold text-green-800 uppercase tracking-wider">
              Superadmin
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
