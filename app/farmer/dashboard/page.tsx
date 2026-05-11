'use client';

import Link from 'next/link';
import Image from 'next/image';
import FarmerHeader from '@/components/farmer/FarmerHeader';
import FarmerBottomNav from '@/components/farmer/FarmerBottomNav';
import StatCard from '@/components/farmer/StatCard';

export default function FarmerDashboard() {
  const actions = [
    { icon: 'add_circle', bg: 'bg-primary', color: 'text-on-primary', label: 'Add\nCrop', shadow: 'shadow-md', href: '/farmer/crops' },
    { icon: 'storefront', bg: 'bg-secondary', color: 'text-on-secondary', label: 'Post\nProduct', shadow: 'shadow-md', href: '/farmer/products/new' },
    { icon: 'receipt_long', bg: 'bg-surface-container-highest', color: 'text-on-surface', label: 'View\nOrders', shadow: 'shadow-sm', href: '/farmer/orders' },
    { icon: 'history_edu', bg: 'bg-surface-container-highest', color: 'text-on-surface', label: 'Record\nActivity', shadow: 'shadow-sm', href: '/farmer/activities' },
  ];

  const upcomingHarvests = [
    { icon: 'nutrition', iconBg: 'bg-error-container', iconColor: 'text-on-error-container', name: 'Premium Tomatoes', planted: 'Oct 1', harvest: 'Nov 15', progress: 70 },
    { icon: 'spa', iconBg: 'bg-[#fef3c7]', iconColor: 'text-[#b45309]', name: 'Organic Carrots', planted: 'Sep 20', harvest: 'Nov 5', progress: 90 },
  ];

  const recentOrders = [
    { initials: 'MS', name: 'Maria S.', product: 'Heirloom Tomatoes', amount: '₱360', status: 'Confirmed', statusBg: 'bg-secondary-container', statusColor: 'text-on-secondary-container' },
    { initials: 'JD', name: 'Juan D.', product: 'Bok Choy', amount: '₱170', status: 'Pending', statusBg: 'bg-surface-variant', statusColor: 'text-on-surface-variant' },
  ];

  return (
    <>
      <FarmerHeader variant="dashboard" />
      <main className="px-[16px] pt-[16px] pb-24 flex flex-col gap-[32px]">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-[8px]">
          <StatCard icon="psychiatry" iconBg="bg-secondary-container" iconColor="text-secondary" label="Active Crops" value="12" filled />
          <StatCard icon="pending_actions" iconBg="bg-surface-variant" iconColor="text-on-surface-variant" label="Pending Orders" value="5" filled />
          
          {/* This Month Earnings */}
          <div className="bg-surface-container-lowest p-[16px] rounded-[16px] shadow-[0_4px_20px_rgba(27,67,50,0.04)] col-span-2 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 blur-xl" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-[12px] font-semibold tracking-[0.03em] text-on-surface-variant mb-1">This Month Earnings</p>
                <p className="text-[32px] font-bold leading-[1.2] tracking-[-0.01em] text-primary">₱15,240</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#fcd34d] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#b45309] text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              </div>
            </div>
          </div>

          {/* Harvest Due Soon */}
          <div className="bg-surface-container-lowest p-[16px] rounded-[16px] shadow-[0_4px_20px_rgba(27,67,50,0.04)] col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary-container text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_clock</span>
                <p className="text-[14px] font-medium text-on-background">Harvest Due Soon</p>
              </div>
              <span className="bg-error-container text-on-error-container text-[12px] font-semibold tracking-[0.03em] px-2 py-0.5 rounded-full">2</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-start gap-2">
          {actions.map((action, idx) => (
            <Link key={idx} href={action.href} className="flex-1 flex flex-col items-center gap-2 group">
              <div className={`w-14 h-14 rounded-full ${action.bg} flex items-center justify-center ${action.color} ${action.shadow} group-hover:opacity-90 transition-opacity`}>
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: (idx < 2) ? "'FILL' 1" : "'FILL' 0" }}>{action.icon}</span>
              </div>
              <span className="text-[12px] font-semibold tracking-[0.03em] text-on-surface-variant text-center leading-tight whitespace-pre-line">
                {action.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Upcoming Harvests */}
        <div>
          <div className="flex justify-between items-center mb-[16px]">
            <h2 className="text-[20px] font-semibold">Upcoming Harvests</h2>
            <button className="text-secondary text-[12px]">View All</button>
          </div>
          <div className="flex flex-col gap-3">
            {upcomingHarvests.map((harvest, idx) => (
              <div key={idx} className="bg-surface-container-lowest p-[16px] rounded-[16px] shadow-[0_4px_20px_rgba(27,67,50,0.04)] border border-surface-variant/50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${harvest.iconBg} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined ${harvest.iconColor}`}>{harvest.icon}</span>
                    </div>
                    <div>
                      <p className="text-[14px] font-medium">{harvest.name}</p>
                      <p className="text-[12px] text-on-surface-variant mt-0.5">Planting: {harvest.planted} • Harvest: {harvest.harvest}</p>
                    </div>
                  </div>
                  <span className="bg-surface-container text-on-surface text-[12px] font-semibold px-2 py-1 rounded-md">{harvest.progress}%</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                  <div className="bg-primary rounded-full h-full transition-all duration-500" style={{ width: `${harvest.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex justify-between items-center mb-[16px]">
            <h2 className="text-[20px] font-semibold">Recent Orders</h2>
            <button className="text-secondary text-[12px]">View All</button>
          </div>
          <div className="bg-surface-container-lowest rounded-[16px] shadow-[0_4px_20px_rgba(27,67,50,0.04)] overflow-hidden">
            {recentOrders.map((order, idx) => (
              <div key={idx} className="flex items-center justify-between p-[16px] border-b border-surface-variant/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-[14px] font-medium">
                    {order.initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium">{order.name}</p>
                    <p className="text-[12px] text-on-surface-variant mt-0.5">{order.product}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-medium mb-1">{order.amount}</p>
                  <span className={`${order.statusBg} ${order.statusColor} text-[12px] font-semibold tracking-[0.03em] px-2 py-0.5 rounded-full inline-block`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
      <FarmerBottomNav activePage="home" />
    </>
  );
}
