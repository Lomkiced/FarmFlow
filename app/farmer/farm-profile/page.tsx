'use client';

import { useState, useTransition } from 'react';
import FarmerHeader from '@/components/farmer/FarmerHeader';
import FarmerBottomNav from '@/components/farmer/FarmerBottomNav';
import StatCard from '@/components/farmer/StatCard';
import { logoutAction } from '@/app/actions/auth';

export default function FarmProfilePage() {
  const [activeTab, setActiveTab] = useState<'products' | 'activity'>('products');
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const chips = [
    { icon: 'landscape', label: '2.5 Hectares' },
    { icon: 'history', label: '15 years farming' },
  ];

  const primaryCrops = ['Rice', 'Tomatoes', 'Carrots', 'Bok Choy'];

  const stats = [
    { icon: 'payments', label: 'TOTAL SALES', value: '₱145k' },
    { icon: 'inventory_2', label: 'PRODUCTS LISTED', value: '8' },
    { icon: 'star', label: 'RATING', value: '4.9', filled: true },
    { icon: 'local_shipping', label: 'TOTAL ORDERS', value: '342' },
  ];

  const myProducts = [
    {
      image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80',
      name: 'Organic Tomatoes',
      badge: 'Fresh',
      badgeBg: 'bg-secondary-container',
      badgeColor: 'text-on-secondary-container',
      price: '₱85',
    },
    {
      image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400&q=80',
      name: 'Sweet Carrots',
      badge: 'Low Stock',
      badgeBg: 'bg-surface-variant',
      badgeColor: 'text-on-surface-variant',
      price: '₱120',
    },
  ];

  return (
    <>
      <FarmerHeader variant="default" />
      <main className="pb-32">
        
        {/* Cover + Avatar */}
        <div className="relative bg-surface">
          <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80')` }} />
          <div className="px-[16px] relative -mt-12 flex items-end justify-between">
            <div className="relative">
              <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" className="w-24 h-24 rounded-full border-4 border-surface object-cover shadow-sm" />
              <div className="absolute bottom-1 right-1 bg-surface rounded-full p-0.5">
                <span className="material-symbols-outlined text-primary-fixed-dim text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
            </div>
            <button className="mb-2 bg-secondary-container text-on-secondary-container text-[14px] font-medium px-4 py-2 rounded-lg hover:bg-secondary-fixed transition-colors border border-outline-variant">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="px-[16px] mt-4 space-y-[8px]">
          <h1 className="text-[32px] font-bold leading-[1.2] tracking-[-0.01em] text-on-background">Agoo Valley Farms</h1>
          <div className="flex items-center gap-1 text-[16px] text-on-surface-variant mt-1">
            <span className="material-symbols-outlined text-outline text-[16px]">location_on</span>
            <span>San Julian, Agoo</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {chips.map((chip, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-high text-[12px] font-semibold tracking-[0.03em] text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">{chip.icon}</span>
                {chip.label}
              </span>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-surface-variant">
            <h3 className="text-[12px] font-semibold tracking-[0.05em] text-outline uppercase mb-2">PRIMARY CROPS</h3>
            <div className="flex flex-wrap gap-2">
               {primaryCrops.map((crop, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-[14px] font-medium border border-primary-fixed-dim">
                  {crop}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-[16px] mt-[32px] grid grid-cols-2 gap-[8px]">
          {stats.map((stat, idx) => (
            <StatCard key={idx} icon={stat.icon} iconBg="bg-surface-container-high" iconColor="text-primary-container" label={stat.label} value={stat.value} filled={stat.filled} />
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-[32px]">
          <div className="flex border-b border-surface-variant px-[16px]">
            <button 
              onClick={() => setActiveTab('products')}
              className={`flex-1 pb-3 text-[14px] font-medium transition-colors ${activeTab === 'products' ? 'text-primary-container border-b-2 border-primary-container' : 'text-outline hover:text-on-surface-variant'}`}
            >
              My Products
            </button>
            <button 
              onClick={() => setActiveTab('activity')}
              className={`flex-1 pb-3 text-[14px] font-medium transition-colors ${activeTab === 'activity' ? 'text-primary-container border-b-2 border-primary-container' : 'text-outline hover:text-on-surface-variant'}`}
            >
              Farm Activity
            </button>
          </div>

          {activeTab === 'products' && (
            <div className="px-[16px] mt-[16px] grid grid-cols-2 gap-[8px]">
              {myProducts.map((product, idx) => (
                <div key={idx} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(27,67,50,0.04)]">
                  <div className="h-32 w-full bg-cover bg-center" style={{ backgroundImage: `url('${product.image}')` }} />
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-1 gap-1">
                      <p className="text-[14px] font-medium text-on-background truncate">{product.name}</p>
                      <span className={`${product.badgeBg} ${product.badgeColor} px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide whitespace-nowrap`}>
                        {product.badge}
                      </span>
                    </div>
                    <p className="text-[20px] font-semibold text-primary-container mt-1">
                      {product.price}
                      <span className="text-sm text-on-surface-variant font-normal">/kg</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="px-[16px] mt-[16px] flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined text-outline text-[48px] mb-4">history</span>
              <p className="text-on-surface-variant font-medium">No activities recorded yet.</p>
            </div>
          )}
        </div>

        {/* LOGOUT BUTTON */}
        <div className="px-[16px] mt-8 mb-8">
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="w-full py-3.5 bg-error-container text-on-error-container font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-error hover:text-on-error transition-colors disabled:opacity-50 border border-error/20"
          >
            {isPending ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined">logout</span>
            )}
            {isPending ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>

      </main>
      <FarmerBottomNav activePage="profile" />
    </>
  );
}
