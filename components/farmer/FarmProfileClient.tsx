'use client';

import { useState, useTransition } from 'react';
import { logoutAction } from '@/app/actions/auth';

type Product = {
  id: string;
  name: string;
  pricePerKg: number;
  stockKg: number;
  photos: string[];
  status: string;
};

type Activity = {
  id: string;
  activityType: string;
  activityDate: Date;
  description: string | null;
  crop: { cropName: string } | null;
};

export default function FarmProfileClient({
  products,
  activities,
}: {
  products: Product[];
  activities: Activity[];
}) {
  const [activeTab, setActiveTab] = useState<'products' | 'activity'>('products');
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { label: 'Active', bg: 'bg-secondary-container', color: 'text-on-secondary-container' };
      case 'PENDING_REVIEW':
        return { label: 'Reviewing', bg: 'bg-[#fef3c7]', color: 'text-[#b45309]' };
      case 'REMOVED':
        return { label: 'Removed', bg: 'bg-error-container', color: 'text-on-error-container' };
      default:
        return { label: status, bg: 'bg-surface-variant', color: 'text-on-surface-variant' };
    }
  };

  return (
    <>
      {/* Tabs */}
      <div className="mt-[32px]">
        <div className="flex border-b border-surface-variant px-[16px]">
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex-1 pb-3 text-[14px] font-medium transition-colors ${activeTab === 'products' ? 'text-primary-container border-b-2 border-primary-container' : 'text-outline hover:text-on-surface-variant'}`}
          >
            My Products ({products.length})
          </button>
          <button 
            onClick={() => setActiveTab('activity')}
            className={`flex-1 pb-3 text-[14px] font-medium transition-colors ${activeTab === 'activity' ? 'text-primary-container border-b-2 border-primary-container' : 'text-outline hover:text-on-surface-variant'}`}
          >
            Recent Activity
          </button>
        </div>

        {activeTab === 'products' && (
          <div className="px-[16px] mt-[16px] grid grid-cols-2 gap-[8px]">
            {products.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-on-surface-variant text-[14px]">
                No products listed yet.
              </div>
            ) : (
              products.map((product) => {
                const badge = getStatusBadge(product.status);
                // Override with Low Stock if active but stock is low
                if (product.status === 'ACTIVE' && product.stockKg < 10) {
                  badge.label = 'Low Stock';
                  badge.bg = 'bg-surface-variant';
                  badge.color = 'text-on-surface-variant';
                }

                return (
                  <div key={product.id} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(27,67,50,0.04)] flex flex-col">
                    <div className="h-32 w-full bg-cover bg-center" style={{ backgroundImage: `url('${product.photos[0] || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80'}')` }} />
                    <div className="p-3 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1 gap-1">
                        <p className="text-[14px] font-medium text-on-background truncate" title={product.name}>{product.name}</p>
                        <span className={`${badge.bg} ${badge.color} px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide whitespace-nowrap`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="mt-auto">
                        <p className="text-[20px] font-semibold text-primary-container mt-1">
                          ₱{product.pricePerKg.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          <span className="text-sm text-on-surface-variant font-normal">/kg</span>
                        </p>
                        <p className="text-[12px] text-on-surface-variant mt-1">Stock: {product.stockKg} kg</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="px-[16px] mt-[16px] flex flex-col gap-[8px]">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-outline text-[48px] mb-4">history</span>
                <p className="text-on-surface-variant font-medium text-[14px]">No activities recorded yet.</p>
              </div>
            ) : (
              activities.slice(0, 5).map((act) => (
                <div key={act.id} className="bg-surface-container-lowest p-4 rounded-xl shadow-[0_4px_20px_rgba(27,67,50,0.04)]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[14px] font-medium capitalize">{act.activityType.toLowerCase().replace('_', ' ')}</p>
                      {act.crop && <p className="text-[12px] text-secondary mt-0.5">{act.crop.cropName}</p>}
                    </div>
                    <p className="text-[12px] text-on-surface-variant">
                      {new Date(act.activityDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            )}
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
    </>
  );
}
