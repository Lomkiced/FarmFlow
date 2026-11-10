'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { logoutAction } from '@/app/actions/auth';

interface DesktopSidebarNavProps {
  activePage: string;
}

export default function DesktopSidebarNav({ activePage }: DesktopSidebarNavProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const primaryLinks = [
    { icon: 'grid_view', label: 'Home', href: '/farmer/dashboard' },
    { icon: 'psychiatry', label: 'Crops', href: '/farmer/crops' },
    { icon: 'payments', label: 'Orders', href: '/farmer/orders' },
    { icon: 'person', label: 'Profile', href: '/farmer/farm-profile' },
  ];

  const moreLinks = [
    { icon: 'history', label: 'Activity Log', href: '/farmer/activities' },
    { icon: 'settings', label: 'Farm Settings', href: '/farmer/farm-profile' },
  ];

  return (
    <nav className="hidden md:flex flex-col h-screen w-[260px] border-r border-gray-200 bg-white sticky top-0 z-40">
      <div className="p-5 border-b border-gray-200 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-green-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
          <span className="material-symbols-outlined text-[20px]">agriculture</span>
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900">FarmFlow Farmer</div>
          <div className="text-[11px] text-gray-500">Agoo, La Union</div>
        </div>
      </div>

      <div className="flex-1 py-4 flex flex-col gap-0.5 px-3">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">
          Farmer Operations
        </div>
        {primaryLinks.map((link) => {
          const isActive = link.href.includes(activePage) || (activePage === 'home' && link.href.includes('dashboard'));
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-900 border-l-2 border-green-800 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-green-800' : 'text-gray-400'}`}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}

        <div className="mt-6 mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">
          Logs & Settings
        </div>

        {moreLinks.map((link) => {
          const isActive = link.href.includes(activePage);
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-900 border-l-2 border-green-800 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-green-800' : 'text-gray-400'}`}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* DESKTOP LOGOUT BUTTON */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:text-red-700 hover:bg-red-50/60 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-gray-400">logout</span>
          {isPending ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </nav>
  );
}
