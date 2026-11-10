'use client';

import { useState, useTransition, useMemo } from 'react';
import Image from 'next/image';
import { toggleBuyerSuspensionAction, deleteBuyerAction } from '@/app/actions/admin';
import PaginationBar from '@/components/ui/PaginationBar';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

type BuyerData = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  isSuspended: boolean;
  stats: {
    totalOrders: number;
    cancelledOrders: number;
    completedOrders: number;
    totalSpent: number;
  };
};

export default function BuyerDirectoryClient({ initialBuyers }: { initialBuyers: BuyerData[] }) {
  const [buyers, setBuyers] = useState<BuyerData[]>(initialBuyers);
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerData | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter & Pagination state
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'HIGH_RISK'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const isBuyerHighRisk = (b: BuyerData) => {
    const cancelRate =
      b.stats.totalOrders > 0
        ? Math.round((b.stats.cancelledOrders / b.stats.totalOrders) * 100)
        : 0;
    return cancelRate > 50 && b.stats.totalOrders > 1;
  };

  const filteredBuyers = useMemo(() => {
    return buyers.filter((b) => {
      if (statusFilter === 'ACTIVE' && b.isSuspended) return false;
      if (statusFilter === 'SUSPENDED' && !b.isSuspended) return false;
      if (statusFilter === 'HIGH_RISK' && !isBuyerHighRisk(b)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.name.toLowerCase().includes(q);
        const matchEmail = b.email.toLowerCase().includes(q);
        const matchPhone = b.phone?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }
      return true;
    });
  }, [buyers, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredBuyers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBuyers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredBuyers.slice(start, start + pageSize);
  }, [filteredBuyers, safePage, pageSize]);

  const totalActive = buyers.filter((b) => !b.isSuspended).length;
  const totalSuspended = buyers.filter((b) => b.isSuspended).length;
  const totalHighRisk = buyers.filter(isBuyerHighRisk).length;
  const totalGmv = buyers.reduce((acc, b) => acc + b.stats.totalSpent, 0);

  const handleToggleSuspension = (buyerId: string, currentlySuspended: boolean) => {
    startTransition(async () => {
      const newStatus = !currentlySuspended;
      const res = await toggleBuyerSuspensionAction(buyerId, newStatus);
      if (res.success) {
        toast.success(res.message || 'Status updated successfully');
        setBuyers(buyers.map((b) => (b.id === buyerId ? { ...b, isSuspended: newStatus } : b)));
        setSelectedBuyer(null);
      } else {
        toast.error(res.error || 'Failed to update status');
      }
    });
  };

  const handleDelete = (buyerId: string) => {
    if (
      !confirm(
        'Are you absolutely sure you want to permanently delete this buyer? This action cannot be undone and will delete all their orders.'
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await deleteBuyerAction(buyerId);
      if (res.success) {
        toast.success(res.message || 'Buyer deleted');
        setBuyers(buyers.filter((b) => b.id !== buyerId));
        setSelectedBuyer(null);
      } else {
        toast.error(res.error || 'Failed to delete buyer');
      }
    });
  };

  return (
    <div className="flex-1 bg-[#F9FAFB] p-4 md:p-8 xl:p-10 min-h-[calc(100vh-4rem)]">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-1">
              Buyer Directory & Trust Governance
            </h1>
            <p className="text-gray-500 text-sm">
              Monitor buyer accounts, cancellation risk scores, and escrow settlement volume.
            </p>
          </div>
        </div>

        {/* KPI SUMMARY STRIP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Registered Buyers
            </span>
            <div className="text-2xl font-bold text-gray-900 tabular-nums mt-1">
              {buyers.length}
            </div>
            <span className="text-xs text-green-800 font-semibold">{totalActive} active accounts</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Cumulative Buyer GMV
            </span>
            <div className="text-2xl font-bold text-green-800 tabular-nums mt-1">
              ₱{totalGmv.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <span className="text-xs text-gray-500">Completed order volume</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              High Cancellation Risk
            </span>
            <div className="text-2xl font-bold text-red-700 tabular-nums mt-1">
              {totalHighRisk}
            </div>
            <span className="text-xs text-gray-500">&gt;50% cancellation rate</span>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Suspended Accounts
            </span>
            <div className="text-2xl font-bold text-gray-700 tabular-nums mt-1">
              {totalSuspended}
            </div>
            <span className="text-xs text-gray-500">Restricted from checkout</span>
          </div>
        </div>

        {/* FILTER & SEARCH BAR */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
            {(
              [
                { id: 'ALL', label: `All Buyers (${buyers.length})` },
                { id: 'ACTIVE', label: `Active (${totalActive})` },
                { id: 'HIGH_RISK', label: `High Risk (${totalHighRisk})` },
                { id: 'SUSPENDED', label: `Suspended (${totalSuspended})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-green-800 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined text-[18px] text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search buyer name, email, phone..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:bg-white focus:border-green-800 text-gray-900"
            />
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Buyer Account</th>
                  <th className="px-6 py-3">Total Orders</th>
                  <th className="px-6 py-3">Cancelled</th>
                  <th className="px-6 py-3">Total Spent</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedBuyers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-xs">
                      No buyers match your current filter.
                    </td>
                  </tr>
                ) : (
                  paginatedBuyers.map((buyer) => {
                    const cancelRate =
                      buyer.stats.totalOrders > 0
                        ? Math.round((buyer.stats.cancelledOrders / buyer.stats.totalOrders) * 100)
                        : 0;
                    const isHighRisk = isBuyerHighRisk(buyer);

                    return (
                      <tr
                        key={buyer.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            {buyer.avatarUrl ? (
                              <Image
                                src={buyer.avatarUrl}
                                alt={buyer.name}
                                width={36}
                                height={36}
                                className="rounded-full object-cover bg-gray-100"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs">
                                {buyer.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-900 text-xs">{buyer.name}</div>
                              <div className="text-[11px] text-gray-500">{buyer.email}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5 tabular-nums">
                                Joined {formatDistanceToNow(new Date(buyer.createdAt))} ago
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="text-xs font-semibold text-gray-900 tabular-nums">
                            {buyer.stats.totalOrders}
                          </div>
                          <div className="text-[11px] text-gray-500 tabular-nums">
                            {buyer.stats.completedOrders} completed
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div
                            className={`text-xs font-semibold tabular-nums ${
                              isHighRisk ? 'text-red-700 font-bold' : 'text-gray-900'
                            }`}
                          >
                            {buyer.stats.cancelledOrders}
                            <span className="text-[11px] text-gray-500 ml-1">({cancelRate}%)</span>
                          </div>
                          {isHighRisk && (
                            <span className="text-[10px] font-semibold text-red-700 uppercase tracking-wider mt-1 bg-red-50 border border-red-200 inline-block px-1.5 py-0.2 rounded">
                              High Risk
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="text-xs font-bold text-green-800 tabular-nums">
                            ₱
                            {buyer.stats.totalSpent.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          {buyer.isSuspended ? (
                            <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-gray-300 bg-gray-100 text-gray-700">
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-green-200 bg-green-50 text-green-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedBuyer(buyer)}
                            className="px-3 py-1 rounded border border-gray-300 hover:border-green-800 hover:bg-green-50 text-xs font-semibold text-gray-700 hover:text-green-900 transition-colors cursor-pointer"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <PaginationBar
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={filteredBuyers.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              pageSizeOptions={[4, 8, 15, 30]}
              itemLabel="buyers"
              className="shadow-none"
            />
          </div>
        </div>

        {/* DETAILS & ACTIONS MODAL */}
        {selectedBuyer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs"
              onClick={() => setSelectedBuyer(null)}
            />
            <div className="relative bg-white rounded-lg w-full max-w-md border border-gray-200 shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    {selectedBuyer.avatarUrl ? (
                      <Image
                        src={selectedBuyer.avatarUrl}
                        alt={selectedBuyer.name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-base">
                        {selectedBuyer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{selectedBuyer.name}</h3>
                      <p className="text-xs text-gray-500">{selectedBuyer.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedBuyer(null)}
                    className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded"
                    aria-label="Close dialog"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Phone</div>
                    <div className="text-xs font-medium text-gray-900 tabular-nums">
                      {selectedBuyer.phone || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Status</div>
                    <div className="text-xs font-semibold">
                      {selectedBuyer.isSuspended ? (
                        <span className="text-gray-700">Suspended</span>
                      ) : (
                        <span className="text-green-800">Active</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Total Spent</div>
                    <div className="text-xs font-bold text-green-800 tabular-nums">
                      ₱{selectedBuyer.stats.totalSpent.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Cancel Rate</div>
                    <div className="text-xs font-bold text-gray-900 tabular-nums">
                      {selectedBuyer.stats.totalOrders > 0
                        ? Math.round(
                            (selectedBuyer.stats.cancelledOrders /
                              selectedBuyer.stats.totalOrders) *
                              100
                          )
                        : 0}
                      %
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() =>
                      handleToggleSuspension(selectedBuyer.id, selectedBuyer.isSuspended)
                    }
                    disabled={isPending}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                      selectedBuyer.isSuspended
                        ? 'bg-green-800 hover:bg-green-900 text-white'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {selectedBuyer.isSuspended ? 'Restore Account' : 'Suspend Account'}
                  </button>

                  <button
                    onClick={() => handleDelete(selectedBuyer.id)}
                    disabled={isPending}
                    className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs border border-red-300 text-red-700 hover:bg-red-50/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Permanently Delete
                  </button>
                </div>

                <p className="text-[11px] text-center text-gray-400 mt-4">
                  Suspending restricts checkout immediately. Deleting removes all records.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
