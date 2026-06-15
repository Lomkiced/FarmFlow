import { getAdminDashboardStatsAction } from '@/app/actions/admin';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStatsAction();

  // Helper to safely format numbers to K/M
  const formatCompact = (num: number) => {
    return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
  };

  const revenueGrowthText = stats.revenueGrowth !== null 
    ? (Number(stats.revenueGrowth) > 0 ? `+${stats.revenueGrowth}% this month` : `${stats.revenueGrowth}% this month`)
    : 'No prior data';

  return (
    <div className="flex-1 p-[40px] flex flex-col gap-[24px]">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-admin-h1 text-admin-h1 text-admin-on-surface">Admin Dashboard</h2>
          <p className="font-admin-body-base text-admin-body-base text-secondary mt-1">Overview of marketplace activity and system health.</p>
        </div>

      </div>

      {/* KPI BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-[16px]">
        
        {/* Total Farmers */}
        <div className="bg-admin-surface-container-lowest border border-admin-outline-variant p-[16px] rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-admin-label-caps text-admin-label-caps text-secondary uppercase">Total Farmers</span>
            <div className="bg-admin-surface-container p-1.5 rounded-lg text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">agriculture</span>
            </div>
          </div>
          <div>
            <div className="font-admin-h2 text-admin-h2 text-admin-on-surface">{stats.totalFarmers.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1 font-admin-body-sm text-admin-body-sm text-primary">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              All verified and pending
            </div>
          </div>
        </div>

        {/* Active Listings */}
        <div className="bg-admin-surface-container-lowest border border-admin-outline-variant p-[16px] rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-admin-label-caps text-admin-label-caps text-secondary uppercase">Active Listings</span>
            <div className="bg-admin-surface-container p-1.5 rounded-lg text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
          </div>
          <div>
            <div className="font-admin-h2 text-admin-h2 text-admin-on-surface">{stats.activeListings.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1 font-admin-body-sm text-admin-body-sm text-secondary">
              Currently live on marketplace
            </div>
          </div>
        </div>

        {/* Monthly Orders */}
        <div className="bg-admin-surface-container-lowest border border-admin-outline-variant p-[16px] rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-admin-label-caps text-admin-label-caps text-secondary uppercase">Total Orders</span>
            <div className="bg-admin-surface-container p-1.5 rounded-lg text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
          </div>
          <div>
            <div className="font-admin-h2 text-admin-h2 text-admin-on-surface">{stats.totalOrders.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1 font-admin-body-sm text-admin-body-sm text-secondary">
              All-time orders
            </div>
          </div>
        </div>

        {/* Total Sales Vol */}
        <div className="bg-admin-surface-container-lowest border border-admin-outline-variant p-[16px] rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-admin-label-caps text-admin-label-caps text-secondary uppercase">This Month Sales</span>
            <div className="bg-admin-surface-container p-1.5 rounded-lg text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div>
            <div className="font-admin-h2 text-admin-h2 text-admin-on-surface">₱{formatCompact(stats.thisMonthRevenue)}</div>
            <div className="flex items-center gap-1 mt-1 font-admin-body-sm text-admin-body-sm text-primary">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              {revenueGrowthText}
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] p-[16px] rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FDE68A] rounded-bl-full opacity-20"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-[#92400E] uppercase font-admin-label-caps text-admin-label-caps">Pending Approvals</span>
            <div className="bg-[#FEF3C7] text-[#D97706] p-1.5 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            </div>
          </div>
          <div className="relative z-10">
            <div className="font-admin-h2 text-admin-h2 text-[#92400E]">{stats.pendingFarmers + stats.pendingListings}</div>
            <div className="flex items-center gap-1 mt-1 font-admin-body-sm text-admin-body-sm text-[#D97706] font-medium">
              {stats.pendingFarmers} Farmers, {stats.pendingListings} Listings
            </div>
          </div>
        </div>

      </div>

      {/* CHARTS & ACTIVITY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
        
        {/* RECENT REGISTRATIONS (Replacing Sales Trend placeholder for now) */}
        <div className="lg:col-span-2 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl h-[400px] flex flex-col">
          <div className="p-[16px] border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-bright/50">
            <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Recent Registrations</h3>
            <button className="text-secondary"><span className="material-symbols-outlined">more_horiz</span></button>
          </div>
          
          <div className="p-[16px] flex-1 overflow-auto">
             <table className="w-full text-left border-collapse">
              <thead className="bg-admin-surface-container-low border-b border-admin-outline-variant">
                <tr>
                  <th className="font-admin-label-caps text-admin-label-caps text-secondary font-semibold tracking-wider p-[8px]">User</th>
                  <th className="font-admin-label-caps text-admin-label-caps text-secondary font-semibold tracking-wider p-[8px]">Role</th>
                  <th className="font-admin-label-caps text-admin-label-caps text-secondary font-semibold tracking-wider p-[8px]">Joined</th>
                </tr>
              </thead>
              <tbody className="font-admin-table-data text-admin-table-data text-admin-on-surface">
                {stats.recentRegistrations.map(user => (
                  <tr key={user.id} className="border-b border-admin-outline-variant/50 hover:bg-admin-surface-bright transition-colors">
                    <td className="p-[12px]">
                      <div className="font-medium text-admin-on-surface">{user.name}</div>
                      <div className="text-secondary text-sm">{user.email}</div>
                    </td>
                    <td className="p-[12px] capitalize">{user.role.toLowerCase()}</td>
                    <td className="p-[12px] text-secondary">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
                {stats.recentRegistrations.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-[16px] text-center text-secondary">No recent registrations</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-[24px] h-[400px]">
          
          {/* ORDERS BY STATUS */}
          <div className="flex-1 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl overflow-hidden flex flex-col">
            <div className="p-[8px] px-[16px] border-b border-admin-outline-variant bg-admin-surface-bright/50 font-admin-body-base font-semibold text-admin-on-surface">
              Orders by Status
            </div>
            <div className="p-[16px] flex-1 flex flex-col justify-center px-4 gap-2">
              {stats.ordersByStatus.map(status => (
                <div key={status.orderStatus} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${status.orderStatus === 'DELIVERED' ? 'bg-primary' : status.orderStatus === 'CANCELLED' ? 'bg-error' : 'bg-[#e1e3e4]'}`}></div>
                    <span className="font-admin-label-caps text-admin-label-caps text-secondary">{status.orderStatus}</span>
                  </div>
                  <span className="font-medium text-admin-on-surface">{status._count.id}</span>
                </div>
              ))}
              {stats.ordersByStatus.length === 0 && (
                <div className="text-secondary text-center text-sm">No orders yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
