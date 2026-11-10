'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { updateOrderStatusAdminAction } from '@/app/actions/admin';
import { cancelOrderAction, resolveOrderRefundAction } from '@/app/actions/orders';
import { resolveOrderLogistics } from '@/lib/logistics-utils';
import PaginationBar from '@/components/ui/PaginationBar';
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
  orderType?: string | null;
  isContract?: boolean;
  deliveryScheduleDay?: string | null;
  contractWeeks?: number | null;
  deliveriesCompleted?: number;
  nextDeliveryDate?: Date | string | null;
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

  const [quickSearch, setQuickSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const filteredOrders = initialOrders.filter((o) => {
    if (!quickSearch.trim()) return true;
    const q = quickSearch.toLowerCase();
    const matchId = o.id.toLowerCase().includes(q);
    const matchBuyer = o.buyer.name?.toLowerCase().includes(q) || o.buyer.email?.toLowerCase().includes(q);
    const matchLoc = o.address.barangay.toLowerCase().includes(q) || o.address.city.toLowerCase().includes(q);
    const matchProd = o.items.some((it) => it.product.name.toLowerCase().includes(q));
    return matchId || matchBuyer || matchLoc || matchProd;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * pageSize, safePage * pageSize);

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
    const toastId = toast.loading('Cancelling order...');

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
    const toastId = toast.loading('Resolving refund...');

    try {
      const res = await resolveOrderRefundAction({
        orderId: selectedOrder.id,
        decision: refundDecision,
        adminNote: refundAdminNote.trim() || undefined,
      });

      if (res.success) {
        toast.success(res.message || `Refund request ${refundDecision.toLowerCase()}.`, { id: toastId });
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
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 bg-gray-50 overflow-y-auto">
      {/* PAGE HEADER */}
      <div className="flex justify-between items-end mb-1">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Orders Overview</h2>
          <p className="text-xs text-gray-500 mt-0.5">Monitor transactions, logistics checkpoints, and refund requests.</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap gap-3 items-center text-xs">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Order Status</span>
          <select 
            value={activeStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-900 outline-none focus:border-green-800"
          >
            <option value="ALL">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="READY">Ready</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDS">Refund Requests</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[220px]">
          <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Search</span>
          <input
            type="text"
            value={quickSearch}
            onChange={(e) => {
              setQuickSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Order ID, buyer, town..."
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-900 outline-none focus:border-green-800"
          />
        </div>

        <div className="flex-1" />

        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            (buyerParam || dateFromParam || dateToParam || minAmountParam || maxAmountParam)
              ? 'bg-green-800 text-white border-green-800'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Filters {(buyerParam || dateFromParam || dateToParam || minAmountParam || maxAmountParam) ? '(Active)' : ''}
        </button>
      </div>

      {/* FILTER PANEL */}
      {isFilterOpen && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-end gap-3 text-xs">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-gray-600 mb-1 font-medium">Buyer Name</label>
            <input 
              type="text" 
              value={filterBuyer}
              onChange={(e) => setFilterBuyer(e.target.value)}
              placeholder="Search by buyer..."
              className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-green-800"
            />
          </div>

          <div className="w-32">
            <label className="block text-gray-600 mb-1 font-medium">Min Amount (₱)</label>
            <input 
              type="number" 
              value={filterMinAmount}
              onChange={(e) => setFilterMinAmount(e.target.value)}
              placeholder="100"
              className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-green-800"
            />
          </div>

          <div className="w-32">
            <label className="block text-gray-600 mb-1 font-medium">Max Amount (₱)</label>
            <input 
              type="number" 
              value={filterMaxAmount}
              onChange={(e) => setFilterMaxAmount(e.target.value)}
              placeholder="5000"
              className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-green-800"
            />
          </div>
          
          <div className="w-36">
            <label className="block text-gray-600 mb-1 font-medium">Date From</label>
            <input 
              type="date" 
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-green-800"
            />
          </div>
          
          <div className="w-36">
            <label className="block text-gray-600 mb-1 font-medium">Date To</label>
            <input 
              type="date" 
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-green-800"
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={clearFilters}
              className="px-3.5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
            <button 
              onClick={applyFilters}
              className="px-4 py-2 bg-green-800 hover:bg-green-900 text-white rounded-lg font-medium"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="flex gap-6 items-start">
        {/* DATA TABLE */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Order ID</th>
                  <th className="py-2.5 px-4">Buyer</th>
                  <th className="py-2.5 px-4">Location</th>
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4 text-right">Amount (₱)</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Refund</th>
                  <th className="py-2.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-green-50/40' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-gray-900">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{order.id.slice(0,8).toUpperCase()}</span>
                        {order.isContract && (
                          <span className="text-[10px] bg-gray-100 text-gray-700 font-medium px-1.5 py-0.5 rounded border border-gray-200">
                            Wholesale
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{order.buyer.name}</div>
                      <div className="text-[11px] text-gray-500">{order.buyer.email}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{order.address.barangay}, {order.address.city}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {order.items[0]?.product.name || 'Produce'} {order.items.length > 1 ? `+${order.items.length - 1}` : ''}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900 tabular-nums">
                      ₱{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${
                        order.orderStatus === 'DELIVERED' ? 'bg-green-50 text-green-800 border-green-200' : 
                        order.orderStatus === 'CANCELLED' ? 'bg-red-50/60 text-red-700 border-red-200' : 
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {order.refundStatus && order.refundStatus !== 'NONE' ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${
                          order.refundStatus === 'REQUESTED' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                          order.refundStatus === 'APPROVED' ? 'bg-green-50 text-green-800 border-green-200' :
                          'bg-red-50/60 text-red-700 border-red-200'
                        }`}>
                          {order.refundStatus}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500 tabular-nums">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {paginatedOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 border-t border-gray-200 bg-gray-50/50">
            <PaginationBar
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              pageSizeOptions={[5, 8, 15, 30]}
              itemLabel="orders"
              className="shadow-none border-none bg-transparent"
            />
          </div>
        </div>

        {/* DETAIL PANEL */}
        {selectedOrder && (
          <div className="w-96 sticky top-8 bg-white rounded-xl border border-gray-200 flex flex-col text-xs">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Order Details</h3>
                <div className="font-mono text-gray-500 text-[11px]">#{selectedOrder.id.slice(0, 8).toUpperCase()}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-700 text-xs">
                Close
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-200px)]">
              {/* WHOLESALE CONTRACT CARD */}
              {selectedOrder.isContract && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col gap-1 text-gray-700">
                  <div className="font-semibold text-gray-900 flex justify-between">
                    <span>Wholesale Contract</span>
                    <span>{selectedOrder.deliveriesCompleted ?? 0}/{selectedOrder.contractWeeks ?? 1} Batches</span>
                  </div>
                  <div>Schedule: {selectedOrder.deliveryScheduleDay || 'Every Saturday'}</div>
                </div>
              )}

              {/* BUYER DETAILS */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500 block">Buyer Details</span>
                <div className="font-semibold text-gray-900">{selectedOrder.buyer.name}</div>
                <div className="text-gray-500">{selectedOrder.buyer.email}</div>
                {selectedOrder.buyer.phone && <div className="text-gray-600">Phone: {selectedOrder.buyer.phone}</div>}
              </div>

              {/* CANCELLATION */}
              {selectedOrder.orderStatus === 'CANCELLED' && (
                <div className="bg-red-50/60 border border-red-200 rounded-lg p-3 text-red-800">
                  <div className="font-semibold">Cancelled by {selectedOrder.cancelledBy || 'system'}</div>
                  {selectedOrder.cancelReason && <div className="mt-0.5">Reason: "{selectedOrder.cancelReason}"</div>}
                </div>
              )}

              {/* REFUND */}
              {selectedOrder.refundStatus && selectedOrder.refundStatus !== 'NONE' && (
                <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex flex-col gap-1.5 text-gray-700">
                  <div className="font-semibold text-gray-900 flex items-center justify-between">
                    <span>Refund: {selectedOrder.refundStatus}</span>
                    {selectedOrder.refundStatus === 'REQUESTED' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsRefundModalOpen(true);
                          setRefundDecision('APPROVED');
                        }}
                        className="px-2 py-0.5 rounded bg-gray-900 text-white font-medium text-[10px]"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                  {selectedOrder.refundReason && <div>Reason: {selectedOrder.refundReason}</div>}
                  {selectedOrder.refundDetails && <div>Details: &ldquo;{selectedOrder.refundDetails}&rdquo;</div>}
                  {selectedOrder.refundProofUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewProofUrl(selectedOrder.refundProofUrl || null)}
                      className="text-left text-green-800 hover:underline mt-1"
                    >
                      View Proof Photo
                    </button>
                  )}
                </div>
              )}

              {/* SUMMARY */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex justify-between items-center">
                <span className="font-medium text-gray-600">Total Amount</span>
                <span className="font-bold text-green-800 text-base tabular-nums">
                  ₱{selectedOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* LOGISTICS */}
              {(() => {
                const logistics = resolveOrderLogistics(selectedOrder);
                return (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1 text-gray-700">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block">
                      Logistics Info
                    </span>
                    <div className="font-semibold text-gray-900">{logistics.courierName}</div>
                    <div className="text-[11px] text-gray-600">
                      Rider: {logistics.driverName} ({logistics.driverPhone})
                    </div>
                    <div className="text-[11px] font-mono text-gray-500">{logistics.vehicleInfo}</div>
                    <div className="text-[11px] text-green-800 font-mono">#{logistics.trackingNumber}</div>
                  </div>
                );
              })()}
            </div>

            {/* ACTION BUTTONS */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl flex gap-2">
              {(selectedOrder.orderStatus !== 'DELIVERED' && selectedOrder.orderStatus !== 'CANCELLED') && (
                <>
                  <button 
                    disabled={isPending}
                    onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.orderStatus)}
                    className="flex-1 bg-green-800 hover:bg-green-900 text-white rounded-lg text-xs font-semibold py-2 transition-colors disabled:opacity-50"
                  >
                    Advance Status
                  </button>
                  <button 
                    disabled={isPending}
                    onClick={() => setIsCancelModalOpen(true)}
                    className="px-3 border border-gray-300 text-red-700 hover:bg-red-50 rounded-lg text-xs font-medium py-2 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ADMIN CANCEL MODAL */}
      {isCancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-gray-900 text-sm">Cancel Order</h3>
              <button onClick={() => setIsCancelModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                Close
              </button>
            </div>

            <p className="text-gray-600">
              This will update the order status to CANCELLED and restore inventory.
            </p>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Reason *</label>
              <textarea
                rows={3}
                required
                value={adminCancelReason}
                onChange={(e) => setAdminCancelReason(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:border-green-800 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setIsCancelModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleAdminCancelSubmit}
                className="px-4 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-medium disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN REFUND MODAL */}
      {isRefundModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-gray-900 text-sm">Resolve Refund Dispute</h3>
              <button onClick={() => setIsRefundModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                Close
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-700 space-y-1">
              <div><span className="font-medium">Order:</span> #{selectedOrder.id.slice(0, 8)}</div>
              <div><span className="font-medium">Buyer:</span> {selectedOrder.buyer.name}</div>
              <div><span className="font-medium">Reason:</span> {selectedOrder.refundReason}</div>
              <div><span className="font-medium">Amount:</span> ₱{selectedOrder.totalAmount.toFixed(2)}</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Ruling</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRefundDecision('APPROVED')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      refundDecision === 'APPROVED'
                        ? 'bg-green-50 border-green-800 text-green-900'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Approve Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundDecision('REJECTED')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      refundDecision === 'REJECTED'
                        ? 'bg-red-50/60 border-red-700 text-red-800'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Decline Refund
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Audit Note</label>
                <textarea
                  rows={3}
                  placeholder="Record ruling justification..."
                  value={refundAdminNote}
                  onChange={(e) => setRefundAdminNote(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:border-green-800 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isResolvingRefund}
                onClick={() => setIsRefundModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResolvingRefund}
                onClick={handleAdminRefundSubmit}
                className={`px-4 py-1.5 rounded-lg text-white font-medium transition-colors disabled:opacity-50 ${
                  refundDecision === 'APPROVED' ? 'bg-green-800 hover:bg-green-900' : 'bg-red-700 hover:bg-red-800'
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewProofUrl(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-xl w-full p-4 shadow-xl flex flex-col gap-3 overflow-hidden text-xs"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-semibold text-gray-900">Refund Proof Photo</h3>
              <button onClick={() => setPreviewProofUrl(null)} className="text-gray-400 hover:text-gray-700">
                Close
              </button>
            </div>
            <div className="max-h-[70vh] flex items-center justify-center bg-gray-950 rounded-lg overflow-hidden">
              <img src={previewProofUrl} alt="Refund proof" className="max-h-[65vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
