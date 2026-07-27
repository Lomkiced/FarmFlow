import { getAnalyticsStatsAction } from '@/app/actions/admin';
import AnalyticsHeader from '@/components/admin/AnalyticsHeader';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const stats = await getAnalyticsStatsAction();

  const formatCompact = (num: number) =>
    Intl.NumberFormat('en-PH', { notation: 'compact', maximumFractionDigits: 1 }).format(num);

  const formatCurrency = (num: number) =>
    Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(num);

  const revenueGrowthText =
    stats.revenueGrowth !== null
      ? Number(stats.revenueGrowth) > 0
        ? `+${stats.revenueGrowth}% from last month`
        : `${stats.revenueGrowth}% from last month`
      : 'No prior data';

  const revenueGrowthPositive =
    stats.revenueGrowth !== null && Number(stats.revenueGrowth) > 0;

  return (
    <div className="flex-1 p-[32px] overflow-x-hidden">

      {/* PAGE HEADER */}
      <AnalyticsHeader />

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">

        {/* KPI ROW */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-[16px]">

          {/* Total Revenue */}
          <div className="bg-admin-surface-container-lowest border border-admin-outline-variant p-[16px] rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase">Total Revenue</span>
              <span className="material-symbols-outlined text-primary-container bg-admin-surface-container p-1 rounded">payments</span>
            </div>
            <div className="font-admin-h2 text-admin-h2 text-admin-on-surface mb-1">
              {stats.totalRevenue > 0 ? formatCompact(stats.totalRevenue) : '₱0'}
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${revenueGrowthPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span className="material-symbols-outlined text-[16px]">
                {revenueGrowthPositive ? 'trending_up' : 'trending_flat'}
              </span>
              {revenueGrowthText}
            </div>
          </div>

          {/* Active Farmers */}
          <div className="bg-admin-surface-container-lowest border border-admin-outline-variant p-[16px] rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase">Active Farmers</span>
              <span className="material-symbols-outlined text-primary-container bg-admin-surface-container p-1 rounded">group</span>
            </div>
            <div className="font-admin-h2 text-admin-h2 text-admin-on-surface mb-1">
              {stats.activeFarmerCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              +{stats.newFarmerCount} new this month
            </div>
          </div>

          {/* Total Harvest Volume */}
          <div className="bg-admin-surface-container-lowest border border-admin-outline-variant p-[16px] rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase">Active Stock</span>
              <span className="material-symbols-outlined text-primary-container bg-admin-surface-container p-1 rounded">local_shipping</span>
            </div>
            <div className="font-admin-h2 text-admin-h2 text-admin-on-surface mb-1">
              {formatCompact(stats.totalHarvestVolumeKg)} kg
            </div>
            <div className="flex items-center gap-1 text-sm text-admin-on-surface-variant font-medium">
              Across all active listings
            </div>
          </div>

          {/* Avg Order Value */}
          <div className="bg-admin-surface-container-lowest border border-admin-outline-variant p-[16px] rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase">Avg Order Value</span>
              <span className="material-symbols-outlined text-primary-container bg-admin-surface-container p-1 rounded">receipt</span>
            </div>
            <div className="font-admin-h2 text-admin-h2 text-admin-on-surface mb-1">
              {stats.avgOrderValue > 0 ? formatCompact(stats.avgOrderValue) : '₱0'}
            </div>
            <div className="flex items-center gap-1 text-sm text-admin-on-surface-variant font-medium">
              Per delivered order
            </div>
          </div>

        </div>

        {/* REVENUE TREND CHART (6 months) */}
        <div className="lg:col-span-2 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl flex flex-col overflow-hidden h-[400px]">
          <div className="p-[24px] border-b border-admin-outline-variant bg-admin-surface-bright flex justify-between items-center">
            <div>
              <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Revenue Trend</h3>
              <p className="font-admin-body-sm text-admin-on-surface-variant mt-0.5">Last 6 months (paid & delivered orders)</p>
            </div>
            <div className="text-right">
              <div className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase">This Month</div>
              <div className="font-admin-h3 text-admin-h3 text-primary">{formatCurrency(stats.thisMonthRevenue)}</div>
            </div>
          </div>

          {stats.monthlyTrend.every(m => m.value === 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-admin-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] opacity-30">bar_chart</span>
              <p className="font-admin-body-sm">No revenue data yet. Complete your first orders to see trends.</p>
            </div>
          ) : (
            <div className="flex-1 p-[24px] flex flex-col justify-end">
              <div className="flex items-end justify-around h-full gap-3">
                {stats.monthlyTrend.map((month, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full group">
                    <div className="flex-1 flex items-end w-full">
                      <div
                        className="w-full rounded-t-lg transition-all duration-500 group-hover:opacity-90 relative"
                        style={{
                          height: `${Math.max(month.percent, month.value > 0 ? 4 : 0)}%`,
                          backgroundColor: month.value > 0
                            ? `color-mix(in srgb, var(--color-primary-container) ${50 + month.percent / 2}%, transparent)`
                            : 'var(--color-admin-surface-container)',
                        }}
                      >
                        {month.value > 0 && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-admin-on-surface text-admin-surface text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap z-10">
                            {formatCompact(month.value)}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant text-[10px]">
                      {month.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TOP CATEGORIES */}
        <div className="lg:col-span-1 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl flex flex-col h-[400px]">
          <div className="p-[24px] border-b border-admin-outline-variant bg-admin-surface-bright">
            <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Top Categories</h3>
            <p className="font-admin-body-sm text-admin-on-surface-variant mt-0.5">By active listings count</p>
          </div>
          <div className="p-[24px] flex-1 flex flex-col justify-center gap-5">
            {stats.topCrops.length === 0 ? (
              <div className="flex flex-col items-center gap-2 text-admin-on-surface-variant text-center">
                <span className="material-symbols-outlined text-[40px] opacity-30">psychiatry</span>
                <p className="font-admin-body-sm">No active listings yet.</p>
              </div>
            ) : (
              stats.topCrops.map((crop, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="font-admin-body-sm text-admin-on-surface font-medium truncate max-w-[130px]">{crop.category}</span>
                    <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant">
                      {crop.count} listing{crop.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-admin-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-container rounded-full transition-all duration-500"
                      style={{ width: `${crop.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MOST ACTIVE FARMERS TABLE */}
        <div className="lg:col-span-2 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="p-[24px] border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-bright">
            <div>
              <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Top Farmers</h3>
              <p className="font-admin-body-sm text-admin-on-surface-variant mt-0.5">By total sales volume</p>
            </div>
          </div>
          {stats.mostActiveFarmers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-admin-on-surface-variant py-12">
              <span className="material-symbols-outlined text-[48px] opacity-30">agriculture</span>
              <p className="font-admin-body-sm">No delivered orders yet.</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead className="bg-admin-surface-container-low border-b border-admin-outline-variant">
                  <tr>
                    {['Farmer', 'Barangay', 'Orders', 'Sales'].map((h) => (
                      <th key={h} className="py-[12px] px-[20px] font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-admin-table-data text-admin-table-data text-admin-on-surface divide-y divide-admin-outline-variant/50">
                  {stats.mostActiveFarmers.map((farmer, idx) => (
                    <tr key={farmer.id} className="hover:bg-admin-surface-bright transition-colors">
                      <td className="py-[14px] px-[20px]">
                        <div className="flex items-center gap-3">
                          {farmer.avatarUrl ? (
                            <img
                              src={farmer.avatarUrl}
                              alt={farmer.userName}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {farmer.userName.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium truncate max-w-[120px]">{farmer.userName}</div>
                            <div className="font-admin-body-sm text-admin-on-surface-variant truncate max-w-[120px]">{farmer.farmName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-[14px] px-[20px] text-admin-on-surface-variant">{farmer.barangay}</td>
                      <td className="py-[14px] px-[20px]">{farmer.completedOrderCount}</td>
                      <td className="py-[14px] px-[20px] font-medium text-primary-container">
                        {formatCurrency(farmer.totalSalesAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* REVENUE BY BARANGAY */}
        <div className="lg:col-span-1 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl p-[24px] flex flex-col">
          <div className="flex items-center gap-2 mb-[20px]">
            <span className="material-symbols-outlined text-admin-outline">map</span>
            <div>
              <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Revenue by Barangay</h3>
              <p className="font-admin-body-sm text-admin-on-surface-variant mt-0.5">From fulfilled orders</p>
            </div>
          </div>

          {stats.revenueByBarangay.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-admin-on-surface-variant text-center">
              <span className="material-symbols-outlined text-[40px] opacity-30">location_off</span>
              <p className="font-admin-body-sm">No location data yet.</p>
            </div>
          ) : (
            <div className="bg-admin-surface-container-low rounded-lg p-4 flex flex-col gap-4 flex-1 justify-center">
              {stats.revenueByBarangay.map((brgy, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface w-24 truncate text-[11px]" title={brgy.name}>
                    {brgy.name}
                  </span>
                  <div className="flex-1 h-7 bg-admin-surface-container rounded overflow-hidden relative">
                    <div
                      className="h-full rounded transition-all duration-700 flex items-center"
                      style={{
                        width: `${brgy.percent}%`,
                        backgroundColor: `color-mix(in srgb, var(--color-primary-container) ${40 + brgy.percent * 0.6}%, transparent)`,
                      }}
                    />
                  </div>
                  <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant text-[10px] w-12 text-right">
                    {formatCompact(brgy.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-between font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

      </div>
    </div>
  );
}
