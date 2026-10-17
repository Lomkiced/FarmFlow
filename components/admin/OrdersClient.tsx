'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { updateOrderStatusAdminAction } from '@/app/actions/admin';
import { cancelOrderAction, resolveOrderRefundAction } from '@/app/actions/orders';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';

type OrderData = {
  id: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: Date;
  cancelReason?: string | null;
  cancelledBy?: string | null;
  cancelledAt?: Date | string | null;
  refundStatus?: string | null;
  refundReason?: string | null;
  refundDetails?: string | null;
  refundProofUrl?: string | null;
  refundAmount?: number | null;
  refundRequestedAt?: Date | string | null;
  refundResolvedAt?: Date | string | null;
  refundAdminNote?: string | null;
  buyer: {
    name: string | null;
    email: string | null;
    phone?: string | null;
  };
  address: {
    street?: string;
    barangay: string;
    city: string;
    phone?: string | null;
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

  // Admin Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [adminCancelReason, setAdminCancelReason] = useState('Administrative intervention / Compliance review');
  const [isCancelling, setIsCancelling] = useState(false);

  // Admin Refund Resolution Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundDecision, setRefundDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [refundAdminNote, setRefundAdminNote] = useState('');
  const [isResolvingRefund, setIsResolvingRefund] = useState(false);
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

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
          setSelectedOrder({ ...selectedOrder, orderStatus: nextStatus });
        }
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to update status');
      }
    });
  };

  const handleAdminCancelSubmit = async () => {
    if (!selectedOrder) return;
    if (!adminCancelReason.trim()) {
      toast.error('Please specify a cancellation reason.');
      return;
    }

    setIsCancelling(true);
    const toastId = toast.loading('Cancelling order and restoring inventory...');

    try {
      const res = await cancelOrderAction(selectedOrder.id, adminCancelReason.trim());
      if (res.success) {
        toast.success(res.message || 'Order cancelled.', { id: toastId });
        setIsCancelModalOpen(false);
        setSelectedOrder({
          ...selectedOrder,
          orderStatus: 'CANCELLED',
          cancelReason: adminCancelReason.trim(),
          cancelledBy: 'ADMIN',
          cancelledAt: new Date(),
        });
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to cancel order.', { id: toastId });
      }
    } catch (e: any) {
      toast.error(e?.message || 'An error occurred.', { id: toastId });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleAdminRefundSubmit = async () => {
    if (!selectedOrder) return;

    setIsResolvingRefund(true);
    const toastId = toast.loading(`${refundDecision === 'APPROVED' ? 'Approving' : 'Declining'} refund...`);

    try {
      const res = await resolveOrderRefundAction({
        orderId: selectedOrder.id,
        decision: refundDecision,
        adminNote: refundAdminNote.trim() || undefined,
      });

      if (res.success) {
        toast.success(res.message || `Refund request ${refundDecision.toLowerCase()}!`, { id: toastId });
        setIsRefundModalOpen(false);
        setSelectedOrder({
          ...selectedOrder,
          refundStatus: refundDecision,
          paymentStatus: refundDecision === 'APPROVED' ? 'REFUNDED' : selectedOrder.paymentStatus,
          refundAdminNote: refundAdminNote.trim() || null,
        });
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to resolve refund.', { id: toastId });
      }
    } catch (e: any) {
      toast.error(e?.message || 'An error occurred.', { id: toastId });
    } finally {
      setIsResolvingRefund(false);
    }
  };

  return (
    <div className="flex-1 p-[40px] flex flex-col gap-[24px] bg-admin-background overflow-y-auto">
      
      {/* PAGE HEADER */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="font-admin-h1 text-admin-h1 text-admin-on-background">Orders Overview</h2>
          <p className="font-admin-body-sm text-admin-on-surface-variant mt-1">Monitor all marketplace transactions, stock adjustments, and refund disputes.</p>
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
            <option value="ALL">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="READY">Ready</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDS">⚠️ Refund Requests</option>
            <option value="REFUNDED">Refunded</option>
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
                  {['Status', 'Refund', 'Date'].map(h => (
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
                    <td className="py-3 px-[16px] font-medium text-primary font-mono text-xs">{order.id.slice(0,8).toUpperCase()}</td>
                    <td className="py-3 px-[16px]">
                      <div className="font-medium">{order.buyer.name}</div>
                      <div className="text-xs text-admin-on-surface-variant">{order.buyer.email}</div>
                    </td>
                    <td className="py-3 px-[16px] text-xs">{order.address.barangay}, {order.address.city}</td>
                    <td className="py-3 px-[16px] text-xs">
                      {order.items[0]?.product.name || 'Produce'} {order.items.length > 1 ? `+${order.items.length - 1} more` : ''}
                    </td>
                    <td className="py-3 px-[16px] text-right font-medium">₱{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3 px-[16px]">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-admin-label-caps text-[10px] uppercase font-bold ${
                        order.orderStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 
                        order.orderStatus === 'CANCELLED' ? 'bg-rose-100 text-rose-800' : 
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-[16px]">
                      {order.refundStatus && order.refundStatus !== 'NONE' ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.refundStatus === 'REQUESTED' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          order.refundStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                          'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}>
                          {order.refundStatus}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-[16px] text-xs text-admin-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {initialOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-admin-on-surface-variant">No orders found.</td>
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
                <div className="font-admin-body-sm text-primary font-mono text-xs">{selectedOrder.id}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-admin-on-surface-variant hover:bg-admin-surface-container p-1 rounded-full transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-[16px] flex flex-col gap-[20px] overflow-y-auto max-h-[calc(100vh-200px)]">
              
              {/* ENTITIES */}
              <div className="bg-admin-surface p-3 rounded-lg border border-admin-outline-variant/50">
                <div className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase mb-1">Buyer Details</div>
                <div className="font-admin-body-sm font-medium text-admin-on-surface">{selectedOrder.buyer.name}</div>
                <div className="text-xs text-admin-on-surface-variant">{selectedOrder.buyer.email}</div>
                {selectedOrder.buyer.phone && <div className="text-xs text-admin-on-surface-variant mt-0.5">📞 {selectedOrder.buyer.phone}</div>}
              </div>

              {/* CANCELLATION INFO */}
              {selectedOrder.orderStatus === 'CANCELLED' && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-900">
                  <div className="font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    Cancelled by {selectedOrder.cancelledBy || 'system'}
                  </div>
                  {selectedOrder.cancelReason && <div className="mt-1">Reason: "{selectedOrder.cancelReason}"</div>}
                  {selectedOrder.cancelledAt && (
                    <div className="text-[11px] text-rose-700/80 mt-1">
                      Cancelled {format(new Date(selectedOrder.cancelledAt), 'MMM d, yyyy h:mm a')}
                    </div>
                  )}
                </div>
              )}

              {/* REFUND DISPUTE INFO */}
              {selectedOrder.refundStatus && selectedOrder.refundStatus !== 'NONE' && (
                <div className={`p-3.5 rounded-lg border text-xs flex flex-col gap-2 ${
                  selectedOrder.refundStatus === 'REQUESTED' ? 'bg-amber-50 border-amber-300 text-amber-900' :
                  selectedOrder.refundStatus === 'APPROVED' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
                  'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  <div className="font-bold flex items-center justify-between">
                    <span>Refund Dispute: {selectedOrder.refundStatus}</span>
                    {selectedOrder.refundStatus === 'REQUESTED' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsRefundModalOpen(true);
                          setRefundDecision('APPROVED');
                        }}
                        className="px-2 py-0.5 rounded bg-amber-700 text-white font-bold text-[10px]"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                  {selectedOrder.refundReason && <div><span className="font-semibold">Reason:</span> {selectedOrder.refundReason}</div>}
                  {selectedOrder.refundDetails && <div><span className="font-semibold">Details:</span> "{selectedOrder.refundDetails}"</div>}
                  {selectedOrder.refundAdminNote && <div className="italic text-gray-700">Note: "{selectedOrder.refundAdminNote}"</div>}
                  
                  {selectedOrder.refundProofUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewProofUrl(selectedOrder.refundProofUrl || null)}
                      className="text-left text-primary font-bold hover:underline flex items-center gap-1 mt-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">image</span>
                      View Buyer Proof Photo
                    </button>
                  )}
                </div>
              )}

              {/* PRICE BREAKDOWN */}
              <div>
                <h4 className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase mb-2">Summary</h4>
                <div className="bg-admin-surface-container-low rounded-lg p-3 border border-admin-outline-variant/50 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-admin-body-sm font-semibold text-admin-on-surface">Total Amount</span>
                    <span className="font-admin-h3 text-admin-h3 text-primary">₱{selectedOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* PAYMENT INFO */}
              <div>
                <h4 className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase mb-2">Payment / Status</h4>
                <div className="flex flex-col gap-2 text-xs">
                  <div className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${selectedOrder.paymentStatus === 'PAID' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-admin-surface border-admin-outline-variant text-admin-on-surface'}`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {selectedOrder.paymentStatus === 'PAID' ? 'verified_user' : 'schedule'}
                    </span>
                    <span className="font-medium">Payment: {selectedOrder.paymentStatus}</span>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border bg-admin-surface border-admin-outline-variant text-admin-on-surface">
                    <span className="material-symbols-outlined text-[18px] text-primary">local_shipping</span>
                    <span className="font-medium">Status: {selectedOrder.orderStatus}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="p-3 border-t border-admin-outline-variant bg-admin-surface rounded-b-xl flex gap-2">
              {(selectedOrder.orderStatus !== 'DELIVERED' && selectedOrder.orderStatus !== 'CANCELLED') && (
                <>
                  <button 
                    disabled={isPending}
                    onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.orderStatus)}
                    className="flex-1 bg-primary text-on-primary rounded-lg text-xs font-semibold py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    Advance Status
                  </button>
                  <button 
                    disabled={isPending}
                    onClick={() => setIsCancelModalOpen(true)}
                    className="px-3 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold py-2 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ADMIN CANCEL ORDER MODAL */}
      {isCancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600">
                <span className="material-symbols-outlined text-[24px]">cancel</span>
                <h3 className="font-bold text-gray-900 text-lg">Admin Cancel Order</h3>
              </div>
              <button onClick={() => setIsCancelModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-gray-600">
              This will update the order status to CANCELLED, restore stock inventory in the database, and dispatch notifications to both buyer and farmer.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Administrative Reason *</label>
              <textarea
                rows={3}
                required
                value={adminCancelReason}
                onChange={(e) => setAdminCancelReason(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleAdminCancelSubmit}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN RESOLVE REFUND MODAL */}
      {isRefundModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-700">
                <span className="material-symbols-outlined text-[24px]">assignment_return</span>
                <h3 className="font-bold text-gray-900 text-lg">
                  Resolve Refund Dispute
                </h3>
              </div>
              <button onClick={() => setIsRefundModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-700 flex flex-col gap-1">
              <div><span className="font-semibold">Order:</span> #{selectedOrder.id.slice(0, 8)}</div>
              <div><span className="font-semibold">Buyer:</span> {selectedOrder.buyer.name}</div>
              <div><span className="font-semibold">Reason:</span> {selectedOrder.refundReason}</div>
              <div><span className="font-semibold">Amount:</span> ₱{selectedOrder.totalAmount.toFixed(2)}</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Administrative Ruling</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRefundDecision('APPROVED')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      refundDecision === 'APPROVED'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    ✓ Approve Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundDecision('REJECTED')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      refundDecision === 'REJECTED'
                        ? 'bg-rose-50 border-rose-500 text-rose-800'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    ✕ Decline Refund
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ruling Note / Audit Explanation
                </label>
                <textarea
                  rows={3}
                  placeholder="Record justification for dispute resolution..."
                  value={refundAdminNote}
                  onChange={(e) => setRefundAdminNote(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isResolvingRefund}
                onClick={() => setIsRefundModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResolvingRefund}
                onClick={handleAdminRefundSubmit}
                className={`px-4 py-2 text-xs font-semibold rounded-lg text-white shadow-sm disabled:opacity-50 ${
                  refundDecision === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isResolvingRefund ? 'Submitting...' : `Confirm ${refundDecision === 'APPROVED' ? 'Approval' : 'Decline'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROOF PHOTO PREVIEW MODAL */}
      {previewProofUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewProofUrl(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full p-4 shadow-2xl flex flex-col gap-3 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-gray-900">Buyer Refund Proof Photo</h3>
              <button onClick={() => setPreviewProofUrl(null)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="max-h-[75vh] flex items-center justify-center bg-gray-950 rounded-xl overflow-hidden">
              <img src={previewProofUrl} alt="Refund proof" className="max-h-[70vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
