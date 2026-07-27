'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { toggleBuyerSuspensionAction, deleteBuyerAction } from '@/app/actions/admin';
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

  const handleToggleSuspension = (buyerId: string, currentlySuspended: boolean) => {
    startTransition(async () => {
      const newStatus = !currentlySuspended;
      const res = await toggleBuyerSuspensionAction(buyerId, newStatus);
      if (res.success) {
        toast.success(res.message || 'Status updated successfully');
        setBuyers(buyers.map(b => b.id === buyerId ? { ...b, isSuspended: newStatus } : b));
        setSelectedBuyer(null);
      } else {
        toast.error(res.error || 'Failed to update status');
      }
    });
  };

  const handleDelete = (buyerId: string) => {
    if (!confirm('Are you absolutely sure you want to permanently delete this buyer? This action cannot be undone and will delete all their orders.')) {
      return;
    }
    startTransition(async () => {
      const res = await deleteBuyerAction(buyerId);
      if (res.success) {
        toast.success(res.message || 'Buyer deleted');
        setBuyers(buyers.filter(b => b.id !== buyerId));
        setSelectedBuyer(null);
      } else {
        toast.error(res.error || 'Failed to delete buyer');
      }
    });
  };

  return (
    <div className="flex-1 bg-[#FAFAF7] font-['Inter']">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#111827] mb-2 font-admin-h1">Buyer Directory</h1>
            <p className="text-gray-500 font-admin-body">Monitor buyers, detect scammers, and manage accounts.</p>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-2xl border border-emerald-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Buyer</th>
                  <th className="px-6 py-4">Total Orders</th>
                  <th className="px-6 py-4">Cancelled</th>
                  <th className="px-6 py-4">Total Spent</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {buyers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <span className="material-symbols-outlined text-4xl mb-3 text-gray-300 block">group_off</span>
                      No buyers found in the system.
                    </td>
                  </tr>
                ) : (
                  buyers.map((buyer) => {
                    const cancelRate = buyer.stats.totalOrders > 0 
                      ? Math.round((buyer.stats.cancelledOrders / buyer.stats.totalOrders) * 100) 
                      : 0;
                    
                    const isHighRisk = cancelRate > 50 && buyer.stats.totalOrders > 1;

                    return (
                      <tr key={buyer.id} className="hover:bg-emerald-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {buyer.avatarUrl ? (
                              <Image src={buyer.avatarUrl} alt={buyer.name} width={40} height={40} className="rounded-full object-cover shadow-sm bg-gray-100" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shadow-sm">
                                {buyer.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-900">{buyer.name}</div>
                              <div className="text-xs text-gray-500">{buyer.email}</div>
                              <div className="text-xs text-gray-400 mt-0.5">Joined {formatDistanceToNow(new Date(buyer.createdAt))} ago</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{buyer.stats.totalOrders}</div>
                          <div className="text-xs text-gray-500">{buyer.stats.completedOrders} completed</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm font-medium ${isHighRisk ? 'text-red-600' : 'text-gray-900'}`}>
                            {buyer.stats.cancelledOrders} 
                            <span className="text-xs text-gray-500 ml-1">({cancelRate}%)</span>
                          </div>
                          {isHighRisk && (
                            <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider mt-1 bg-red-50 inline-block px-1.5 py-0.5 rounded">High Risk</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-emerald-700">
                            ₱{buyer.stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {buyer.isSuspended ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedBuyer(buyer)}
                            className="text-gray-400 hover:text-emerald-600 transition-colors p-2 rounded-full hover:bg-emerald-50"
                          >
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAILS & ACTIONS MODAL */}
        {selectedBuyer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedBuyer(null)}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    {selectedBuyer.avatarUrl ? (
                      <Image src={selectedBuyer.avatarUrl} alt={selectedBuyer.name} width={56} height={56} className="rounded-full object-cover shadow-sm bg-gray-100" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl shadow-sm">
                        {selectedBuyer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedBuyer.name}</h3>
                      <p className="text-sm text-gray-500">{selectedBuyer.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedBuyer(null)} className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Phone</div>
                    <div className="text-sm font-medium text-gray-900">{selectedBuyer.phone || 'Not provided'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <div className={`text-sm font-bold ${selectedBuyer.isSuspended ? 'text-red-600' : 'text-emerald-600'}`}>
                      {selectedBuyer.isSuspended ? 'Suspended' : 'Active'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Total Spent</div>
                    <div className="text-sm font-bold text-emerald-700">₱{selectedBuyer.stats.totalSpent.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Cancel Rate</div>
                    <div className="text-sm font-bold text-gray-900">
                      {selectedBuyer.stats.totalOrders > 0 
                        ? Math.round((selectedBuyer.stats.cancelledOrders / selectedBuyer.stats.totalOrders) * 100) 
                        : 0}%
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleToggleSuspension(selectedBuyer.id, selectedBuyer.isSuspended)}
                    disabled={isPending}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                      selectedBuyer.isSuspended 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200'
                        : 'bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isPending ? (
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">
                        {selectedBuyer.isSuspended ? 'lock_open' : 'block'}
                      </span>
                    )}
                    {selectedBuyer.isSuspended ? 'Restore Account' : 'Suspend Account'}
                  </button>

                  <button
                    onClick={() => handleDelete(selectedBuyer.id)}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                    )}
                    Permanently Delete
                  </button>
                </div>
                
                <p className="text-xs text-center text-gray-400 mt-4 px-4">
                  Suspending a buyer locks them out instantly. Deleting a buyer removes all their data, including past orders.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
