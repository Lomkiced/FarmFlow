'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { updateOrderStatusAdminAction } from '@/app/actions/admin';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

type OrderData = {
  id: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: Date;
  buyer: {
    name: string | null;
    email: string | null;
  };
  address: {
    barangay: string;
    city: string;
  };
  items: {
    product: {
      name: string;
    };
  }[];
};

export default function OrdersClient({ initialOrders }: { initialOrders: OrderData[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeStatus = searchParams.get('status') || 'ALL';
  const buyerParam = searchParams.get('buyer') || '';
  const dateFromParam = searchParams.get('dateFrom') || '';
  const dateToParam = searchParams.get('dateTo') || '';
  const minAmountParam = searchParams.get('minAmount') || '';
  const maxAmountParam = searchParams.get('maxAmount') || '';

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterBuyer, setFilterBuyer] = useState(buyerParam);
  const [filterDateFrom, setFilterDateFrom] = useState(dateFromParam);
  const [filterDateTo, setFilterDateTo] = useState(dateToParam);
  const [filterMinAmount, setFilterMinAmount] = useState(minAmountParam);
  const [filterMaxAmount, setFilterMaxAmount] = useState(maxAmountParam);

  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === 'ALL') params.delete('status');
    else params.set('status', newStatus);
    router.push(`?${params.toString()}`);
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (filterBuyer) params.set('buyer', filterBuyer);
    else params.delete('buyer');

    if (filterDateFrom) params.set('dateFrom', filterDateFrom);
    else params.delete('dateFrom');

    if (filterDateTo) params.set('dateTo', filterDateTo);
    else params.delete('dateTo');

    if (filterMinAmount) params.set('minAmount', filterMinAmount);
    else params.delete('minAmount');

    if (filterMaxAmount) params.set('maxAmount', filterMaxAmount);
    else params.delete('maxAmount');

    router.push(`?${params.toString()}`);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setFilterBuyer('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterMinAmount('');
    setFilterMaxAmount('');

    const params = new URLSearchParams(searchParams.toString());
    params.delete('buyer');
    params.delete('dateFrom');
    params.delete('dateTo');
    params.delete('minAmount');
    params.delete('maxAmount');

    router.push(`?${params.toString()}`);
    setIsFilterOpen(false);
  };

  const handleUpdateStatus = (id: string, currentStatus: string) => {
    let nextStatus: 'PENDING' | 'CONFIRMED' | 'READY' | 'DELIVERED' | 'CANCELLED';
    if (currentStatus === 'PENDING') nextStatus = 'CONFIRMED';
    else if (currentStatus === 'CONFIRMED') nextStatus = 'READY';
    else if (currentStatus === 'READY') nextStatus = 'DELIVERED';
    else return;

    startTransition(async () => {
      const res = await updateOrderStatusAdminAction(id, nextStatus);
      if (res.success) {
        toast.success(res.message || `Order updated to ${nextStatus}`);
        if (selectedOrder?.id === id) {
           setSelectedOrder(null); // Or optimistic update
        }
      } else {
        toast.error(res.error || 'Failed to update status');
      }
    });
  };

  return (
    <div className="flex-1 p-[40px] flex flex-col gap-[24px] bg-admin-background overflow-y-auto">
      
      {/* PAGE HEADER */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="font-admin-h1 text-admin-h1 text-admin-on-background">Orders Overview</h2>
          <p className="font-admin-body-sm text-admin-on-surface-variant mt-1">Monitor all marketplace transactions and fulfillments.</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-admin-surface-container-lowest p-[16px] rounded-xl border border-admin-outline-variant flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1">
          <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant">Order Status</span>
          <select 
            value={activeStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="border border-admin-outline-variant rounded-lg px-3 py-1.5 font-admin-body-sm bg-admin-surface-container-lowest text-admin-on-surface outline-none focus:border-primary"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="READY">Ready</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="flex-1"></div>
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`font-admin-body-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors relative ${
            (buyerParam || dateFromParam || dateToParam || minAmountParam || maxAmountParam)
              ? 'bg-primary text-on-primary border border-primary hover:bg-primary-container hover:text-on-primary-container'
              : 'text-primary hover:bg-admin-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          More Filters
          {(buyerParam || dateFromParam || dateToParam || minAmountParam || maxAmountParam) && (
            <span className="w-2 h-2 rounded-full bg-error absolute -top-1 -right-1"></span>
          )}
        </button>
      </div>

      {/* INLINE MORE FILTERS PANEL */}
      {isFilterOpen && (
        <div className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl p-4 flex flex-wrap items-end gap-4 shadow-sm transition-all duration-300">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-admin-label-caps text-admin-on-surface-variant mb-1">Buyer Name</label>
            <input 
              type="text" 
              value={filterBuyer}
              onChange={(e) => setFilterBuyer(e.target.value)}
              placeholder="Search by buyer..."
              className="w-full bg-admin-surface border border-admin-outline-variant rounded p-2 text-sm text-admin-on-surface focus:border-primary outline-none"
            />
          </div>

          <div className="w-[140px]">
            <label className="block text-xs font-admin-label-caps text-admin-on-surface-variant mb-1">Min Amount (₱)</label>
            <input 
              type="number" 
              value={filterMinAmount}
              onChange={(e) => setFilterMinAmount(e.target.value)}
              placeholder="e.g. 100"
              className="w-full bg-admin-surface border border-admin-outline-variant rounded p-2 text-sm text-admin-on-surface focus:border-primary outline-none"
            />
          </div>

          <div className="w-[140px]">
            <label className="block text-xs font-admin-label-caps text-admin-on-surface-variant mb-1">Max Amount (₱)</label>
            <input 
              type="number" 
              value={filterMaxAmount}
              onChange={(e) => setFilterMaxAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full bg-admin-surface border border-admin-outline-variant rounded p-2 text-sm text-admin-on-surface focus:border-primary outline-none"
            />
          </div>
          
          <div className="w-[140px]">
            <label className="block text-xs font-admin-label-caps text-admin-on-surface-variant mb-1">Date From</label>
            <input 
              type="date" 
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full bg-admin-surface border border-admin-outline-variant rounded p-2 text-sm text-admin-on-surface focus:border-primary outline-none"
            />
          </div>
          
          <div className="w-[140px]">
            <label className="block text-xs font-admin-label-caps text-admin-on-surface-variant mb-1">Date To</label>
            <input 
              type="date" 
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full bg-admin-surface border border-admin-outline-variant rounded p-2 text-sm text-admin-on-surface focus:border-primary outline-none"
            />
          </div>

          <div className="flex gap-2 ml-auto">
            <button 
              onClick={clearFilters}
              className="px-6 py-2 border border-admin-outline-variant text-admin-on-surface-variant rounded text-sm font-medium hover:bg-admin-surface-container-low transition-colors"
            >
              Clear
            </button>
            <button 
              onClick={applyFilters}
              className="px-6 py-2 bg-primary text-on-primary rounded text-sm font-medium hover:bg-primary-container transition-colors shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="flex gap-[20px] items-start">
        
        {/* LEFT — DATA TABLE */}
        <div className="flex-1 bg-admin-surface-container-lowest rounded-xl border border-admin-outline-variant overflow-hidden flex flex-col">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-admin-surface border-b border-admin-outline-variant">
                <tr>
                  {['Order ID', 'Buyer', 'Location', 'Product'].map(h => (
                    <th key={h} className="py-[8px] px-[16px] font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                  <th className="py-[8px] px-[16px] font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase tracking-wider text-right">Amount (₱)</th>
                  {['Status', 'Date'].map(h => (
                    <th key={h} className="py-[8px] px-[16px] font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-admin-table-data text-admin-table-data text-admin-on-surface">
                {initialOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className={`border-b border-admin-outline-variant/50 hover:bg-[#F1F5F9] cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-admin-surface-container' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-3 px-[16px] font-medium text-primary">{order.id.slice(0,8).toUpperCase()}</td>
                    <td className="py-3 px-[16px]">{order.buyer.name}</td>
                    <td className="py-3 px-[16px]">{order.address.barangay}, {order.address.city}</td>
                    <td className="py-3 px-[16px]">{order.items[0]?.product.name || 'Unknown'} {order.items.length > 1 ? `+${order.items.length - 1} more` : ''}</td>
                    <td className="py-3 px-[16px] text-right font-medium">₱{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3 px-[16px]">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full font-admin-label-caps text-[10px] uppercase ${
                        order.orderStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 
                        order.orderStatus === 'CANCELLED' ? 'bg-error-container text-error' : 
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-[16px] text-admin-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {initialOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-admin-on-surface-variant">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT — DETAIL PANEL */}
        {selectedOrder && (
          <div className="w-96 sticky top-24 bg-admin-surface-container-lowest rounded-xl border border-admin-outline-variant shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] flex flex-col">
            
            <div className="p-[16px] border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface rounded-t-xl">
              <div>
                <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Order Details</h3>
                <div className="font-admin-body-sm text-primary font-medium">{selectedOrder.id}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-admin-on-surface-variant hover:bg-admin-surface-container p-1 rounded-full transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-[16px] flex flex-col gap-[24px] overflow-y-auto max-h-[calc(100vh-200px)]">
              
              {/* ENTITIES */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-admin-surface p-[8px] rounded-lg border border-admin-outline-variant/50">
                  <div className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase mb-1">Buyer</div>
                  <div className="font-admin-body-sm font-medium text-admin-on-surface truncate">{selectedOrder.buyer.name}</div>
                  <div className="font-admin-table-data text-admin-on-surface-variant">{selectedOrder.buyer.email}</div>
                </div>
              </div>

              {/* PRICE BREAKDOWN */}
              <div>
                <h4 className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase mb-2">Summary</h4>
                <div className="bg-admin-surface-container-low rounded-lg p-[16px] border border-admin-outline-variant/50 flex flex-col gap-3">
                  
                  <div className="flex justify-between items-center">
                    <span className="font-admin-body-sm font-semibold text-admin-on-surface">Total Amount</span>
                    <span className="font-admin-h3 text-admin-h3 text-primary">₱{selectedOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                </div>
              </div>

              {/* PAYMENT INFO */}
              <div>
                <h4 className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase mb-2">Payment / Status</h4>
                <div className="flex flex-col gap-2">
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${selectedOrder.paymentStatus === 'PAID' ? 'bg-emerald-50 border-emerald-100' : 'bg-admin-surface border-admin-outline-variant'}`}>
                    <span className={`material-symbols-outlined ${selectedOrder.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-admin-on-surface-variant'}`}>
                      {selectedOrder.paymentStatus === 'PAID' ? 'verified_user' : 'schedule'}
                    </span>
                    <div>
                      <div className={`font-admin-body-sm font-medium ${selectedOrder.paymentStatus === 'PAID' ? 'text-emerald-900' : 'text-admin-on-surface'}`}>
                        Payment: {selectedOrder.paymentStatus}
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-lg border bg-admin-surface border-admin-outline-variant`}>
                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                    <div>
                      <div className="font-admin-body-sm font-medium text-admin-on-surface">
                        Status: {selectedOrder.orderStatus}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-[16px] border-t border-admin-outline-variant bg-admin-surface rounded-b-xl flex gap-3">
              {(selectedOrder.orderStatus !== 'DELIVERED' && selectedOrder.orderStatus !== 'CANCELLED') && (
                <button 
                  disabled={isPending}
                  onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.orderStatus)}
                  className="flex-1 bg-primary text-on-primary rounded-lg font-admin-body-sm py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Advance Status
                </button>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
