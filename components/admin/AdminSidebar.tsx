'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { logoutAction } from '@/app/actions/auth';
import { useUIStore } from '@/store/uiStore';

interface NavItem {
  label: string;
  icon: string;
  href: string;
  subtitle?: string;
}

interface NavGroup {
  section: string;
  items: NavItem[];
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { isAdminSidebarOpen, closeAdminSidebar } = useUIStore();

  const navGroups: NavGroup[] = [
    {
      section: 'Command Center',
      items: [
        { label: 'Dashboard', icon: 'space_dashboard', href: '/admin', subtitle: 'Overview & KPIs' },
        { label: 'Inbox & Support', icon: 'mark_email_unread', href: '/admin/inbox', subtitle: 'Alerts & Tickets' },
      ],
    },
    {
      section: 'Directory & KYC',
      items: [
        { label: 'Farmers & KYC', icon: 'agriculture', href: '/admin/farmers', subtitle: 'RSBSA & ID Audits' },
        { label: 'Buyers Directory', icon: 'groups', href: '/admin/buyers', subtitle: 'Trust & Accounts' },
      ],
    },
    {
      section: 'Marketplace Ops',
      items: [
        { label: 'Harvest Listings', icon: 'inventory_2', href: '/admin/listings', subtitle: 'Moderation & Stock' },
        { label: 'Orders & Escrow', icon: 'local_shipping', href: '/admin/orders', subtitle: 'Logistics & Disputes' },
      ],
    },
    {
      section: 'Intelligence & System',
      items: [
        { label: 'Analytics & BI', icon: 'monitoring', href: '/admin/analytics', subtitle: 'Revenue & Yield' },
        { label: 'Platform Settings', icon: 'tune', href: '/admin/settings', subtitle: 'Rules & Security' },
      ],
    },
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
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={closeAdminSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 w-[280px] h-screen bg-white border-r border-gray-200 flex flex-col justify-between py-5 z-50 transform transition-transform duration-200 ease-in-out ${
          isAdminSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* TOP BRANDING */}
        <div className="px-5">
          <div className="flex items-center justify-between pb-5 border-b border-gray-200">
            <Link href="/admin" className="flex items-center gap-3 group" onClick={() => closeAdminSidebar()}>
              <div className="w-9 h-9 rounded-lg bg-green-800 flex items-center justify-center text-white font-bold shrink-0">
                <span className="material-symbols-outlined text-[20px]">
                  agriculture
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-900 font-bold tracking-tight text-base">FarmFlow</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-800 border border-green-200 rounded">
                    ERP
                  </span>
                </div>
                <div className="text-[11px] font-medium text-gray-500">
                  Provincial Governance
                </div>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              className="md:hidden text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100"
              onClick={closeAdminSidebar}
              aria-label="Close sidebar"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION GROUPS */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.section} className="space-y-0.5">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">
                {group.section}
              </div>
              {group.items.map((item) => {
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => closeAdminSidebar()}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors select-none ${
                      isActive
                        ? 'bg-green-50 text-green-900 border-l-2 border-green-800 font-semibold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`material-symbols-outlined text-[18px] shrink-0 ${
                          isActive ? 'text-green-800' : 'text-gray-400'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs truncate leading-snug">
                          {item.label}
                        </div>
                        {item.subtitle && (
                          <div className={`text-[10px] truncate ${isActive ? 'text-green-700' : 'text-gray-400'}`}>
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <span className="material-symbols-outlined text-[16px] text-green-800 shrink-0">
                        chevron_right
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* BOTTOM TELEMETRY & LOGOUT */}
        <div className="px-4 pt-3 border-t border-gray-200 space-y-2">
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-800" />
              <div>
                <div className="text-[11px] font-semibold text-gray-900 leading-tight">La Union Agri-Node</div>
                <div className="text-[10px] text-gray-500">Escrow & KYC Active</div>
              </div>
            </div>
            <Link
              href="/"
              target="_blank"
              title="Open Public Marketplace"
              className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </Link>
          </div>

          <button
            onClick={handleLogout}
            disabled={isPending}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-600 hover:text-red-700 hover:bg-red-50/60 border border-transparent transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-gray-400">
                logout
              </span>
              <span>{isPending ? 'Signing out...' : 'Sign Out'}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">ESC</span>
          </button>
        </div>
      </aside>
    </>
  );
}
