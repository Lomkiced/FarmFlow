'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { logoutAction } from '@/app/actions/auth';

interface DesktopSidebarNavProps {
  activePage: string
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
    { icon: 'settings', label: 'Farm Settings', href: '#' },
  ];

  return (
    <nav className="hidden md:flex flex-col h-screen w-[280px] rounded-r-3xl divide-y divide-stone-100 shadow-2xl bg-white sticky top-0 z-[60]">
      <div className="p-6 flex items-center gap-4">
        <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
        <div>
          <div className="font-['Manrope'] text-sm font-bold text-[#1B4332]">FarmFlow Pro</div>
          <div className="text-xs text-stone-500">Agoo, La Union</div>
          <div className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">Premium Member</div>
        </div>
      </div>

      <div className="flex-1 py-4 flex flex-col gap-1 px-3">
        {primaryLinks.map((link) => {
          const isActive = link.href.includes(activePage) || (activePage === 'home' && link.href.includes('dashboard'));
          return (
            <Link key={link.label} href={link.href} className={isActive ? 'flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 text-[#1B4332] font-bold border-l-4 border-[#1B4332]' : 'flex items-center gap-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors'}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}

        <div className="mt-8 mb-2 px-4 text-xs font-bold text-stone-400 uppercase tracking-wider">More</div>

        {moreLinks.map((link) => {
          const isActive = link.href.includes(activePage);
          return (
            <Link key={link.label} href={link.href} className={isActive ? 'flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 text-[#1B4332] font-bold border-l-4 border-[#1B4332]' : 'flex items-center gap-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors'}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* DESKTOP LOGOUT BUTTON */}
      <div className="p-4 mt-auto border-t border-stone-100">
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600/80 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 font-bold"
        >
          {isPending ? (
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined">logout</span>
          )}
          {isPending ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>

    </nav>
  );
}
