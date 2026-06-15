import Link from 'next/link';
import FarmerHeader from '@/components/farmer/FarmerHeader';
import FarmerBottomNav from '@/components/farmer/FarmerBottomNav';
import StatCard from '@/components/farmer/StatCard';
import { getFarmerDashboardStatsAction, getFarmProfileAction } from '@/app/actions/farm';

export default async function FarmerDashboard() {
  const [stats, farmProfile] = await Promise.all([
    getFarmerDashboardStatsAction(),
    getFarmProfileAction(),
  ]);

  const userName = farmProfile?.user?.name || 'Farmer';
  const avatarUrl = farmProfile?.user?.avatarUrl;

  const actions = [
    { icon: 'add_circle', bg: 'bg-primary', color: 'text-on-primary', label: 'Add\nCrop', shadow: 'shadow-md', href: '/farmer/crops' },
    { icon: 'storefront', bg: 'bg-secondary', color: 'text-on-secondary', label: 'Post\nProduct', shadow: 'shadow-md', href: '/farmer/products/new' },
    { icon: 'receipt_long', bg: 'bg-surface-container-highest', color: 'text-on-surface', label: 'View\nOrders', shadow: 'shadow-sm', href: '/farmer/orders' },
    { icon: 'history_edu', bg: 'bg-surface-container-highest', color: 'text-on-surface', label: 'Record\nActivity', shadow: 'shadow-sm', href: '/farmer/activities' },
  ];

  return (
    <>
      <FarmerHeader variant="dashboard" userName={userName} avatarUrl={avatarUrl} />
      <main className="px-[16px] pt-[16px] pb-24 flex flex-col gap-[32px]">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-[8px]">
          <StatCard icon="psychiatry" iconBg="bg-secondary-container" iconColor="text-secondary" label="Active Crops" value={stats.activeCropsCount.toString()} filled />
          <StatCard icon="pending_actions" iconBg="bg-surface-variant" iconColor="text-on-surface-variant" label="Pending Orders" value={stats.pendingOrdersCount.toString()} filled />
          
          {/* This Month Earnings */}
          <div className="bg-surface-container-lowest p-[16px] rounded-[16px] shadow-[0_4px_20px_rgba(27,67,50,0.04)] col-span-2 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 blur-xl" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-[12px] font-semibold tracking-[0.03em] text-on-surface-variant mb-1">This Month Earnings</p>
                <p className="text-[32px] font-bold leading-[1.2] tracking-[-0.01em] text-primary">
                  ₱{stats.thisMonthEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
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
              <span className="bg-error-container text-on-error-container text-[12px] font-semibold tracking-[0.03em] px-2 py-0.5 rounded-full">
                {stats.upcomingHarvests.length}
              </span>
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
            <Link href="/farmer/crops" className="text-secondary text-[12px]">View All</Link>
          </div>
          <div className="flex flex-col gap-3">
            {stats.upcomingHarvests.length === 0 ? (
              <p className="text-[14px] text-on-surface-variant text-center py-4">No upcoming harvests in the next 14 days.</p>
            ) : (
              stats.upcomingHarvests.map((harvest) => {
                const planted = new Date(harvest.datePlanted).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const expected = new Date(harvest.expectedHarvest).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const totalDays = new Date(harvest.expectedHarvest).getTime() - new Date(harvest.datePlanted).getTime();
                const passedDays = Date.now() - new Date(harvest.datePlanted).getTime();
                const progress = Math.min(100, Math.max(0, Math.round((passedDays / totalDays) * 100)));
                
                return (
                  <div key={harvest.id} className="bg-surface-container-lowest p-[16px] rounded-[16px] shadow-[0_4px_20px_rgba(27,67,50,0.04)] border border-surface-variant/50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#fef3c7] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#b45309]">spa</span>
                        </div>
                        <div>
                          <p className="text-[14px] font-medium">{harvest.cropName}</p>
                          <p className="text-[12px] text-on-surface-variant mt-0.5">Planting: {planted} • Harvest: {expected}</p>
                        </div>
                      </div>
                      <span className="bg-surface-container text-on-surface text-[12px] font-semibold px-2 py-1 rounded-md">{progress}%</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                      <div className="bg-primary rounded-full h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex justify-between items-center mb-[16px]">
            <h2 className="text-[20px] font-semibold">Recent Orders</h2>
            <Link href="/farmer/orders" className="text-secondary text-[12px]">View All</Link>
          </div>
          <div className="bg-surface-container-lowest rounded-[16px] shadow-[0_4px_20px_rgba(27,67,50,0.04)] overflow-hidden">
            {stats.recentOrders.length === 0 ? (
              <p className="text-[14px] text-on-surface-variant text-center py-4">No recent orders.</p>
            ) : (
              stats.recentOrders.map((order) => {
                const initials = order.buyer.name.substring(0, 2).toUpperCase();
                const productNames = order.items.map(i => i.product.name).join(', ');
                const isPending = order.orderStatus === 'PENDING';
                const statusBg = isPending ? 'bg-surface-variant' : 'bg-secondary-container';
                const statusColor = isPending ? 'text-on-surface-variant' : 'text-on-secondary-container';

                return (
                  <div key={order.id} className="flex items-center justify-between p-[16px] border-b border-surface-variant/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-[14px] font-medium">
                        {initials}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium">{order.buyer.name}</p>
                        <p className="text-[12px] text-on-surface-variant mt-0.5 truncate max-w-[150px]">{productNames}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-medium mb-1">
                        ₱{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <span className={`${statusBg} ${statusColor} text-[12px] font-semibold tracking-[0.03em] px-2 py-0.5 rounded-full inline-block`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </main>
      <FarmerBottomNav activePage="home" />
    </>
  );
}

