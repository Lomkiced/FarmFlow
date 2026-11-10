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
    { label: 'Register Crop', href: '/farmer/crops' },
    { label: 'Post Harvest', href: '/farmer/products/new' },
    { label: 'Orders & Escrow', href: '/farmer/orders' },
    { label: 'Activity Logs', href: '/farmer/activities' },
  ];

  return (
    <>
      <FarmerHeader variant="dashboard" userName={userName} avatarUrl={avatarUrl} />
      <main className="max-w-5xl mx-auto px-4 md:px-8 pt-6 pb-24 flex flex-col gap-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Crops" value={stats.activeCropsCount.toString()} />
          <StatCard label="Pending Orders" value={stats.pendingOrdersCount.toString()} />
          <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              This Month Earnings
            </span>
            <div className="text-2xl font-bold text-green-800 tabular-nums">
              ₱{stats.thisMonthEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Harvest Due Soon
            </span>
            <div className="text-2xl font-bold text-gray-900 tabular-nums">
              {stats.upcomingHarvests.length}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map((action, idx) => (
            <Link
              key={idx}
              href={action.href}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:border-green-800 hover:bg-green-50/40 text-center transition-colors group cursor-pointer"
            >
              <span className="text-xs font-semibold text-gray-900 group-hover:text-green-900">
                {action.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Upcoming Harvests */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Upcoming Harvests</h2>
            <Link href="/farmer/crops" className="text-xs font-semibold text-green-800 hover:text-green-900">
              View All Crops →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {stats.upcomingHarvests.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No upcoming harvests in the next 14 days.</p>
            ) : (
              stats.upcomingHarvests.map((harvest) => {
                const planted = new Date(harvest.datePlanted).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const expected = new Date(harvest.expectedHarvest).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const totalDays = new Date(harvest.expectedHarvest).getTime() - new Date(harvest.datePlanted).getTime();
                const passedDays = Date.now() - new Date(harvest.datePlanted).getTime();
                const progress = Math.min(100, Math.max(0, Math.round((passedDays / totalDays) * 100)));
                
                return (
                  <div key={harvest.id} className="p-3.5 rounded-lg border border-gray-200 bg-gray-50 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-gray-900">{harvest.cropName}</p>
                        <p className="text-[11px] text-gray-500 tabular-nums">Planted: {planted} • Target Harvest: {expected}</p>
                      </div>
                      <span className="text-xs font-bold text-green-800 tabular-nums">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-green-800 rounded-full h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-2">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Recent Orders</h2>
            <Link href="/farmer/orders" className="text-xs font-semibold text-green-800 hover:text-green-900">
              View All Orders →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentOrders.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No recent orders.</p>
            ) : (
              stats.recentOrders.map((order) => {
                const productNames = order.items.map(i => i.product.name).join(', ');
                const isPending = order.orderStatus === 'PENDING';

                return (
                  <div key={order.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">{order.buyer.name}</p>
                      <p className="text-[11px] text-gray-500 truncate max-w-[240px] sm:max-w-md">{productNames}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-green-800 tabular-nums mb-0.5">
                        ₱{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.2 rounded border ${
                        isPending
                          ? 'bg-gray-100 text-gray-700 border-gray-300'
                          : 'bg-green-50 text-green-800 border-green-200'
                      }`}>
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
