'use client';

import Link from 'next/link';

interface FarmerBottomNavProps {
  activePage: 'home' | 'crops' | 'add' | 'orders' | 'profile'
}

export default function FarmerBottomNav({ activePage }: FarmerBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center px-2 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] bg-white border-t border-stone-100 shadow-[0_-4px_20px_rgba(27,67,50,0.04)] rounded-t-2xl md:hidden">
      
      <Link href="/farmer/dashboard" className={`flex flex-col items-center justify-center transition-all ${activePage === 'home' ? 'text-primary bg-secondary-container/50 rounded-xl px-3 py-1 translate-y-[-2px]' : 'text-stone-400 px-3 py-1'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: activePage === 'home' ? "'FILL' 1" : "'FILL' 0" }}>grid_view</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider">Home</span>
      </Link>

      <Link href="/farmer/crops" className={`flex flex-col items-center justify-center transition-all ${activePage === 'crops' ? 'text-primary bg-secondary-container/50 rounded-xl px-3 py-1 translate-y-[-2px]' : 'text-stone-400 px-3 py-1'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: activePage === 'crops' ? "'FILL' 1" : "'FILL' 0" }}>psychiatry</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider">Crops</span>
      </Link>

      <Link href="/farmer/products/new" className="relative -top-3 flex flex-col items-center justify-center">
        <div className="bg-primary text-on-primary rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-[28px]">add</span>
        </div>
        <span className="sr-only">Add</span>
      </Link>

      <Link href="/farmer/orders" className={`flex flex-col items-center justify-center transition-all ${activePage === 'orders' ? 'text-primary bg-secondary-container/50 rounded-xl px-3 py-1 translate-y-[-2px]' : 'text-stone-400 px-3 py-1'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: activePage === 'orders' ? "'FILL' 1" : "'FILL' 0" }}>payments</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider">Orders</span>
      </Link>

      <Link href="/farmer/farm-profile" className={`flex flex-col items-center justify-center transition-all ${activePage === 'profile' ? 'text-primary bg-secondary-container/50 rounded-xl px-3 py-1 translate-y-[-2px]' : 'text-stone-400 px-3 py-1'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: activePage === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider">Profile</span>
      </Link>

    </nav>
  );
}
