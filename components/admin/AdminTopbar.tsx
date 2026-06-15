'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useUIStore } from '@/store/uiStore';
import { globalSearchAdminAction } from '@/app/actions/admin';
import { getTopUnreadNotificationsAction, markNotificationReadAction, markAllNotificationsReadAction } from '@/app/actions/notifications';

export default function AdminTopbar() {
  const { toggleAdminSidebar } = useUIStore();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch results
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsSearching(true);
      setIsDropdownOpen(true);
      globalSearchAdminAction(debouncedQuery).then((res) => {
        if (res.error) {
          console.error("Server Action Error:", res.error);
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

  // Click outside and escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsNotifsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleResultClick = (url: string) => {
    setIsDropdownOpen(false);
    setSearchQuery('');
    setDebouncedQuery('');
    router.push(url);
  };

  return (
    <div className="h-16 w-full sticky top-0 z-[9999] bg-white/95 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
      
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
        <div className="relative w-48 md:w-64" ref={dropdownRef}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-outline-variant">
            search
          </span>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (debouncedQuery.length >= 2) setIsDropdownOpen(true); }}
            className="w-full pl-10 pr-4 py-2 border border-admin-outline-variant rounded-lg bg-admin-surface-container-lowest text-admin-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary font-admin-body-sm text-admin-body-sm outline-none"
          />

          {/* Results Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[280px] md:min-w-[360px] bg-white border border-slate-200 rounded-xl shadow-xl z-[100] overflow-hidden flex flex-col max-h-[450px]">
              {isSearching ? (
                <div className="p-6 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
                  <span className="font-admin-body-sm text-sm">Searching...</span>
                </div>
              ) : results ? (
                <div className="overflow-y-auto py-2 custom-scrollbar">
                  {(results as any).error ? (
                    <div className="p-8 flex flex-col items-center justify-center gap-2 text-error">
                      <span className="material-symbols-outlined text-4xl">error</span>
                      <p className="text-sm font-medium">Search Failed</p>
                      <p className="text-xs text-center">{(results as any).error}</p>
                    </div>
                  ) : (results.farmers?.length || 0) === 0 && (results.products?.length || 0) === 0 && (results.orders?.length || 0) === 0 && (results.users?.length || 0) === 0 ? (
                    <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-500">
                      <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                      <p className="text-sm font-medium">No results found</p>
                      <p className="text-xs text-slate-400">We couldn't find anything for "{debouncedQuery}"</p>
                    </div>
                  ) : (
                    <>
                      {results.farmers.length > 0 && (
                        <div className="pb-2">
                          <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm">
                            Farmers
                          </div>
                          {results.farmers.map((f: any) => (
                            <button 
                              key={f.id}
                              onClick={() => handleResultClick(`/admin/farmers?location=${encodeURIComponent(f.farmName)}`)}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors border-l-2 border-transparent hover:border-primary"
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                {f.farmName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-800">{f.farmName}</span>
                                <span className="text-xs text-slate-500">{f.user.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {results.products.length > 0 && (
                        <div className="pb-2">
                          <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm border-t border-slate-100">
                            Listings
                          </div>
                          {results.products.map((p: any) => (
                            <button 
                              key={p.id}
                              onClick={() => handleResultClick(`/admin/listings`)}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors border-l-2 border-transparent hover:border-primary"
                            >
                              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                                <span className="text-xs text-slate-500">{p.farm.farmName}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {results.orders.length > 0 && (
                        <div className="pb-1">
                          <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm border-t border-slate-100">
                            Orders
                          </div>
                          {results.orders.map((o: any) => (
                            <button 
                              key={o.id}
                              onClick={() => handleResultClick(`/admin/orders?buyer=${encodeURIComponent(o.buyer.name)}`)}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col transition-colors border-l-2 border-transparent hover:border-primary"
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <span className="text-sm font-bold text-primary">#{o.id.slice(0, 8).toUpperCase()}</span>
                                <span className="text-xs font-medium text-slate-600">₱{o.totalAmount}</span>
                              </div>
                              <div className="flex items-center justify-between w-full">
                                <span className="text-xs text-slate-500">{o.buyer.name}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                  {o.orderStatus}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {results.users.length > 0 && (
                        <div className="pb-1">
                          <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm border-t border-slate-100">
                            Users
                          </div>
                          {results.users.map((u: any) => (
                            <button 
                              key={u.id}
                              onClick={() => handleResultClick(`/admin`)}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors border-l-2 border-transparent hover:border-primary"
                            >
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <span className="material-symbols-outlined text-[18px]">person</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-800">{u.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-500">{u.email}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold uppercase">{u.role}</span>
                                </div>
                              </div>
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

      {/* RIGHT */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* NOTIFICATIONS */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifsOpen(!isNotifsOpen)}
            className="p-2 rounded-full hover:bg-slate-50 transition-colors relative text-admin-on-surface-variant"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifsOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-[320px] bg-white border border-slate-200 rounded-xl shadow-xl z-[100] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <span className="font-semibold text-sm text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={async () => {
                      await markAllNotificationsReadAction();
                      loadNotifications();
                    }}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="flex flex-col max-h-[360px] overflow-y-auto custom-scrollbar">
                {notifs.length === 0 ? (
                  <div className="p-8 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <span className="material-symbols-outlined text-4xl text-slate-300">notifications_paused</span>
                    <span className="text-sm font-medium">All caught up!</span>
                  </div>
                ) : (
                  notifs.map(n => (
                    <button 
                      key={n.id}
                      onClick={async () => {
                        await markNotificationReadAction(n.id);
                        setIsNotifsOpen(false);
                        loadNotifications();
                        // Optional routing logic
                        if (n.relatedType === 'farmer') router.push(`/admin/farmers/${n.relatedId}`);
                        else if (n.relatedType === 'product') router.push(`/admin/listings`);
                        else if (n.relatedType === 'order') router.push(`/admin/orders?buyer=${n.relatedId}`);
                        else router.push('/admin/inbox');
                      }}
                      className="w-full text-left p-4 flex gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px]">
                          {n.type === 'NEW_USER' ? 'person_add' : 
                           n.type === 'PENDING_FARMER' ? 'agriculture' : 
                           n.type === 'NEW_LISTING' ? 'inventory_2' : 
                           n.type === 'NEW_ORDER' ? 'shopping_cart' : 
                           n.type === 'ORDER_STATUS_CHANGE' ? 'local_shipping' : 'payments'}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-slate-800 truncate">{n.title}</span>
                        <span className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</span>
                        <span className="text-[10px] text-slate-400 mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                <Link 
                  href="/admin/inbox"
                  onClick={() => setIsNotifsOpen(false)}
                  className="w-full py-2 flex items-center justify-center text-sm font-medium text-slate-600 hover:text-primary transition-colors rounded-lg hover:bg-white"
                >
                  View all — Go to Inbox
                </Link>
              </div>
            </div>
          )}
        </div>

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
