'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { logoutAction } from '@/app/actions/auth';
import { useUIStore } from '@/store/uiStore';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { isAdminSidebarOpen, closeAdminSidebar } = useUIStore();

  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', href: '/admin' },
    { label: 'Inbox', icon: 'inbox', href: '/admin/inbox' },
    { label: 'Farmers', icon: 'agriculture', href: '/admin/farmers' },
    { label: 'Listings', icon: 'inventory_2', href: '/admin/listings' },
    { label: 'Orders', icon: 'receipt_long', href: '/admin/orders' },
    { label: 'Analytics', icon: 'monitoring', href: '/admin/analytics' },
    { label: 'Settings', icon: 'settings', href: '/admin/settings' },
  ];

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isAdminSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={closeAdminSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 w-[280px] h-screen bg-[#1B4332] border-r border-emerald-800 flex flex-col py-8 z-50 transform transition-transform duration-300 ease-in-out ${isAdminSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
        {/* LOGO AREA */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white">agriculture</span>
            </div>
            <div>
              <div className="text-white font-black tracking-widest uppercase font-admin-h3 text-admin-h3">AgriAdmin</div>
              <div className="text-emerald-100/60 font-admin-body-sm text-admin-body-sm">Management Portal</div>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            className="md:hidden text-emerald-100/60 hover:text-white p-1"
            onClick={closeAdminSidebar}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* NAV LINKS */}
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto hide-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => closeAdminSidebar()}
                className={
                  isActive
                    ? "bg-white/10 text-white border-l-4 border-white flex items-center gap-3 px-6 py-4 font-['Inter'] text-sm tracking-normal"
                    : "text-emerald-100/60 flex items-center gap-3 px-6 py-4 hover:text-white hover:bg-white/5 transition-all duration-200 font-['Inter'] text-sm select-none"
                }
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* DIVIDER */}
        <div className="mx-6 border-t border-emerald-700/50 mb-4 mt-4" />

        {/* LOGOUT BUTTON */}
        <div className="px-4">
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100/70 hover:text-white hover:bg-red-600/20 border border-transparent hover:border-red-500/30 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed font-['Inter'] text-sm select-none"
          >
            {isPending ? (
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[20px] group-hover:text-red-400 transition-colors">logout</span>
            )}
            <span className="group-hover:text-red-300 transition-colors">
              {isPending ? 'Signing out...' : 'Sign Out'}
            </span>
          </button>
        </div>

      </div>
    </>
  );
}

