import { getAdminDashboardStatsAction } from '@/app/actions/admin';
import Link from 'next/link';
import RecentRegistrationsClient from './RecentRegistrationsClient';

export const dynamic = 'force-dynamic';

const STATUS_META: Record<
  string,
  { label: string; barColor: string; pillClass: string }
> = {
  DELIVERED: {
    label: 'Delivered & Completed',
    barColor: 'bg-green-800',
    pillClass: 'border-green-200 bg-green-50 text-green-800',
  },
  COMPLETED: {
    label: 'Escrow Released',
    barColor: 'bg-green-900',
    pillClass: 'border-green-200 bg-green-50 text-green-900 font-semibold',
  },
  OUT_FOR_DELIVERY: {
    label: 'In Transit',
    barColor: 'bg-green-700',
    pillClass: 'border-gray-200 bg-gray-50 text-gray-700',
  },
  READY: {
    label: 'Packed & Ready',
    barColor: 'bg-green-600',
    pillClass: 'border-gray-200 bg-gray-50 text-gray-700',
  },
  CONFIRMED: {
    label: 'Farmer Confirmed',
    barColor: 'bg-gray-400',
    pillClass: 'border-gray-200 bg-gray-50 text-gray-700',
  },
  PENDING: {
    label: 'Awaiting Confirmation',
    barColor: 'bg-gray-300',
    pillClass: 'border-gray-200 bg-gray-50 text-gray-700',
  },
  CANCELLED: {
    label: 'Cancelled / Refunded',
    barColor: 'bg-red-700',
    pillClass: 'border-red-200 bg-red-50/60 text-red-700',
  },
};

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStatsAction();

  const formatCompact = (num: number) => {
    return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
      num
    );
  };

  const revenueGrowthText =
    stats.revenueGrowth !== null
      ? Number(stats.revenueGrowth) > 0
        ? `+${stats.revenueGrowth}% vs last month`
        : `${stats.revenueGrowth}% vs last month`
      : 'Active month';

  const totalPendingApprovals = stats.pendingFarmers + stats.pendingListings;
  const totalStatusCount = Math.max(
    1,
    stats.ordersByStatus.reduce((acc, s) => acc + s._count.id, 0)
  );

  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-50 min-h-[calc(100vh-4rem)] flex flex-col gap-6">
      {/* COMMAND CENTER BANNER */}
      <div className="rounded-xl bg-green-900 text-white p-6 border border-green-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <span className="inline-block text-[11px] font-medium uppercase tracking-wider text-green-200 bg-white/10 px-2.5 py-0.5 rounded border border-white/15">
              Agribusiness ERP • La Union Command Center
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Executive Operations & KYC Governance
            </h1>
            <p className="text-xs text-green-100/80 leading-relaxed">
              Monitor RSBSA farmer verifications, harvest catalog compliance, cold-chain checkpoints, and escrow-protected settlements across La Union.
            </p>
          </div>

          {/* Quick Command Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/admin/farmers?status=PENDING"
              className="px-3.5 py-2 rounded-lg bg-white text-green-900 text-xs font-semibold hover:bg-gray-100 transition-colors"
            >
              Review KYC ({stats.pendingFarmers})
            </Link>
            <Link
              href="/admin/listings"
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition-colors"
            >
              Listings ({stats.pendingListings})
            </Link>
            <Link
              href="/admin/orders"
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition-colors"
            >
              Orders & Logistics
            </Link>
            <Link
              href="/admin/analytics"
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition-colors"
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* 5-CARD KPI BENTO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Farmers */}
        <Link
          href="/admin/farmers"
          className="bg-white border border-gray-200 hover:border-green-800 p-5 rounded-xl transition-colors flex flex-col justify-between"
        >
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
            Registered Farmers
          </span>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900 tabular-nums">
              {stats.totalFarmers.toLocaleString()}
            </div>
            <div className="text-xs text-green-800 font-medium mt-1">
              RSBSA & KYC Tracked
            </div>
          </div>
        </Link>

        {/* 2. Active Listings */}
        <Link
          href="/admin/listings"
          className="bg-white border border-gray-200 hover:border-green-800 p-5 rounded-xl transition-colors flex flex-col justify-between"
        >
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
            Live Listings
          </span>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900 tabular-nums">
              {stats.activeListings.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Active marketplace catalog
            </div>
          </div>
        </Link>

        {/* 3. Total Orders */}
        <Link
          href="/admin/orders"
          className="bg-white border border-gray-200 hover:border-green-800 p-5 rounded-xl transition-colors flex flex-col justify-between"
        >
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
            Platform Orders
          </span>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900 tabular-nums">
              {stats.totalOrders.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Cold-Chain Monitored
            </div>
          </div>
        </Link>

        {/* 4. Monthly GMV */}
        <Link
          href="/admin/analytics"
          className="bg-white border border-gray-200 hover:border-green-800 p-5 rounded-xl transition-colors flex flex-col justify-between"
        >
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
            Monthly GMV
          </span>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900 tabular-nums">
              ₱{formatCompact(stats.thisMonthRevenue)}
            </div>
            <div className="text-xs text-green-800 font-medium mt-1">
              {revenueGrowthText}
            </div>
          </div>
        </Link>

        {/* 5. Pending Approvals */}
        <Link
          href="/admin/farmers?status=PENDING"
          className="bg-white border border-gray-200 hover:border-green-800 p-5 rounded-xl transition-colors flex flex-col justify-between"
        >
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
            Pending Approvals
          </span>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900 tabular-nums">
              {totalPendingApprovals}
            </div>
            <div className="text-xs text-gray-600 font-medium mt-1">
              {stats.pendingFarmers} Farmers • {stats.pendingListings} Listings
            </div>
          </div>
        </Link>
      </div>

      {/* MAIN OPERATIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT (2 COLS): RECENT REGISTRATIONS & KYC QUEUE */}
        <RecentRegistrationsClient initialUsers={stats.recentRegistrations} />

        {/* RIGHT (1 COL): ORDER PIPELINE & AUDIT CENTER */}
        <div className="flex flex-col gap-6">
          {/* Card 1: Order Fulfillment Distribution */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
                  Order Fulfillment Status
                </h3>
                <p className="text-[11px] text-gray-500">
                  {stats.totalOrders} Total Orders
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-medium text-green-800 hover:underline"
              >
                View All →
              </Link>
            </div>

            <div className="p-4 space-y-3.5">
              {stats.ordersByStatus.length === 0 ? (
                <div className="text-gray-400 text-center py-6 text-xs">
                  No orders recorded yet.
                </div>
              ) : (
                stats.ordersByStatus.map((statusObj) => {
                  const meta = STATUS_META[statusObj.orderStatus] || {
                    label: statusObj.orderStatus,
                    barColor: 'bg-gray-400',
                    pillClass: 'border-gray-200 bg-gray-50 text-gray-700',
                  };
                  const count = statusObj._count.id;
                  const pct = Math.round((count / totalStatusCount) * 100);

                  return (
                    <div key={statusObj.orderStatus} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${meta.pillClass}`}>
                          {statusObj.orderStatus}
                        </span>
                        <div className="font-mono text-gray-700">
                          <span className="font-semibold tabular-nums">{count}</span>{' '}
                          <span className="text-[11px] text-gray-400">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${meta.barColor}`}
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Card 2: Compliance Checklist */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
                Governance Quick Actions
              </h3>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              <Link
                href="/admin/farmers?status=PENDING"
                className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="font-semibold text-gray-900">
                    RSBSA & Gov ID Review
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {stats.pendingFarmers} farmer application(s) pending
                  </div>
                </div>
                <span className="text-xs font-medium text-green-800">
                  Review →
                </span>
              </Link>

              <Link
                href="/admin/listings"
                className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="font-semibold text-gray-900">
                    Listing Moderation
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {stats.pendingListings} listing(s) pending approval
                  </div>
                </div>
                <span className="text-xs font-medium text-green-800">
                  Review →
                </span>
              </Link>

              <Link
                href="/admin/inbox"
                className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="font-semibold text-gray-900">
                    Support Desk
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Inquiries and user requests
                  </div>
                </div>
                <span className="text-xs font-medium text-green-800">
                  Open →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
