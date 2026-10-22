'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { updateOrderStatusAction, cancelOrderAction, resolveOrderRefundAction, recordContractDeliveryAction } from '@/app/actions/orders';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import FarmerOrderDispatchModal, { DispatchOrder } from './FarmerOrderDispatchModal';

export type Order = DispatchOrder;

interface WeekDataItem {
  day: string;
  total: number;
  height: string;
  highlight?: boolean;
}

interface FarmerStats {
  thisMonthEarnings?: number;
  readyForPayout?: number;
  weekData?: WeekDataItem[];
}

const FARMER_CANCEL_PRESETS = [
  'Harvest damaged or insufficient quantity available',
  'Severe weather / field flooded in Agoo',
  'Unable to transport or deliver to buyer address',
  'Customer contacted and requested cancellation',
  'Other operational issue',
];

export default function OrdersClient({
  activeOrders = [],
  completedOrders = [],
  cancelledOrders = [],
  refundOrders = [],
  stats,
}: {
  activeOrders: Order[];
  completedOrders: Order[];
  cancelledOrders?: Order[];
  refundOrders?: Order[];
  stats: FarmerStats;
}) {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'refunds' | 'cancelled' | 'earnings'>('active');
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const router = useRouter();

  // State for the dispatch & waybill modal
  const [selectedDispatchOrder, setSelectedDispatchOrder] = useState<DispatchOrder | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState(FARMER_CANCEL_PRESETS[0]);
  const [cancelReasonCustom, setCancelReasonCustom] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // Refund Resolution State
  const [resolvingRefundOrder, setResolvingRefundOrder] = useState<Order | null>(null);
  const [refundDecision, setRefundDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [refundAdminNote, setRefundAdminNote] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      startRefreshTransition(() => {
        router.refresh();
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const weekData = stats?.weekData || [];
  const readyForPayout = stats?.readyForPayout || 0;
  const pendingRefundsCount = refundOrders.filter(o => o.refundStatus === 'REQUESTED').length;

  const handleUpdateStatus = (orderId: string, currentStatus: string) => {
    let newStatus: 'CONFIRMED' | 'READY' | 'DELIVERED' | 'CANCELLED';
    if (currentStatus === 'PENDING') newStatus = 'CONFIRMED';
    else if (currentStatus === 'CONFIRMED') newStatus = 'READY';
    else if (currentStatus === 'READY') newStatus = 'DELIVERED';
    else return;

    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, newStatus);
      if (result.success) {
        toast.success(result.message || `Order marked as ${newStatus.toLowerCase()}`);
        if (selectedDispatchOrder?.id === orderId) {
          setIsDispatchModalOpen(false);
          setSelectedDispatchOrder(null);
        }
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update order status');
      }
    });
  };

  const handleRecordContractDelivery = (orderId: string) => {
    startTransition(async () => {
      const result = await recordContractDeliveryAction(orderId);
      if (result.success) {
        toast.success(result.message || 'Weekly batch delivery recorded!');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to record contract delivery');
      }
    });
  };

  const handleCancelOrderSubmit = async () => {
    if (!cancellingOrder) return;
    const finalReason =
      cancelReasonPreset === 'Other operational issue'
        ? cancelReasonCustom.trim()
        : `${cancelReasonPreset}${cancelReasonCustom.trim() ? `: ${cancelReasonCustom.trim()}` : ''}`;

    if (!finalReason) {
      toast.error('Please specify a cancellation reason.');
      return;
    }

    setIsSubmittingCancel(true);
    const toastId = toast.loading('Cancelling order and restoring stock...');

    try {
      const res = await cancelOrderAction(cancellingOrder.id, finalReason);
      if (res.success) {
        toast.success(res.message || 'Order cancelled. Inventory restored.', { id: toastId });
        setCancellingOrder(null);
        setCancelReasonCustom('');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to cancel order.', { id: toastId });
      }
    } catch (e: any) {
      toast.error(e?.message || 'An error occurred.', { id: toastId });
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleResolveRefundSubmit = async () => {
    if (!resolvingRefundOrder) return;

    setIsSubmittingRefund(true);
    const toastId = toast.loading(`${refundDecision === 'APPROVED' ? 'Approving' : 'Declining'} refund...`);

    try {
      const res = await resolveOrderRefundAction({
        orderId: resolvingRefundOrder.id,
        decision: refundDecision,
        adminNote: refundAdminNote.trim() || undefined,
      });

      if (res.success) {
        toast.success(res.message || `Refund request ${refundDecision.toLowerCase()}!`, { id: toastId });
        setResolvingRefundOrder(null);
        setRefundAdminNote('');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to resolve refund.', { id: toastId });
      }
    } catch (e: any) {
      toast.error(e?.message || 'An error occurred.', { id: toastId });
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  const openDispatchDetails = (order: Order) => {
    setSelectedDispatchOrder(order);
    setIsDispatchModalOpen(true);
  };

  const renderOrderCard = (order: Order) => {
    const recipientName = order.address?.fullName || order.buyer.name;
    const recipientPhone = order.address?.phone || order.buyer.phone || '';
    const initials = recipientName.substring(0, 2).toUpperCase();
    const productSummary = order.items
      .map(i => `${i.product.name} (${i.quantityKg}kg)`)
      .join(', ');

    const isOrderPending = order.orderStatus === 'PENDING';
    const isOrderConfirmed = order.orderStatus === 'CONFIRMED';
    const isOrderReady = order.orderStatus === 'READY';
    const isOrderDelivered = order.orderStatus === 'DELIVERED';
    const isOrderCancelled = order.orderStatus === 'CANCELLED';

    const canFarmerCancel = isOrderPending || isOrderConfirmed;
    const isPaid = order.paymentStatus === 'PAID';

    let nextActionLabel = '';
    if (order.orderStatus === 'PENDING') nextActionLabel = 'Confirm Order';
    else if (order.orderStatus === 'CONFIRMED') nextActionLabel = 'Mark as Ready';
    else if (order.orderStatus === 'READY') nextActionLabel = 'Mark Delivered';

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${order.address?.street || ''}, ${order.address?.barangay || ''}, Agoo, La Union`
    )}`;

    return (
      <div
        key={order.id}
        className="flex flex-col p-4 sm:p-5 bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(27,67,50,0.04)] border border-outline-variant/30 mb-3 gap-3 transition-all hover:shadow-md"
      >
        {/* Top Header: Buyer info + Status & Amount */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-[14px] font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm sm:text-base font-bold text-on-surface truncate">
                  {recipientName}
                </p>
                <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                {order.isContract && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">event_repeat</span>
                    Wholesale Contract
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant truncate max-w-[220px] sm:max-w-md mt-0.5">
                {productSummary}
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end shrink-0">
            <p className="text-sm sm:text-base font-black text-primary mb-1">
              ₱{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span
              className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase ${
                isOrderPending
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : isOrderReady
                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                  : isOrderDelivered
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : isOrderCancelled
                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                  : 'bg-surface-variant text-on-surface-variant'
              }`}
            >
              {order.orderStatus}
            </span>
          </div>
        </div>

        {/* WHOLESALE CONTRACT PROGRESS BANNER */}
        {order.isContract && (
          <div className="p-3 bg-emerald-50/90 border border-emerald-300 rounded-xl text-xs text-emerald-950 flex flex-col gap-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-700 text-[16px]">calendar_month</span>
                Schedule: {order.deliveryScheduleDay || 'Every Saturday'}
              </span>
              <span className="font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                Batch {order.deliveriesCompleted ?? 0} of {order.contractWeeks ?? 1} Delivered
              </span>
            </div>
            {order.nextDeliveryDate && order.orderStatus !== 'DELIVERED' && (order.orderStatus as any) !== 'COMPLETED' && (
              <div className="text-[11px] text-emerald-800 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">schedule</span>
                Next Delivery: <strong>{format(new Date(order.nextDeliveryDate), 'EEEE, MMM d, yyyy')}</strong>
              </div>
            )}
          </div>
        )}

        {/* Cancellation details banner if cancelled */}
        {isOrderCancelled && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
            <div className="font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              Order Cancelled {order.cancelledBy ? `by ${order.cancelledBy.toLowerCase()}` : ''}
            </div>
            {order.cancelReason && <div className="mt-0.5">Reason: "{order.cancelReason}"</div>}
            <div className="mt-1 text-[11px] text-rose-700/80">Inventory was safely restored to stock.</div>
          </div>
        )}

        {/* Refund badge if applicable */}
        {order.refundStatus && order.refundStatus !== 'NONE' && (
          <div className={`p-3 rounded-xl border text-xs ${
            order.refundStatus === 'REQUESTED' ? 'bg-amber-50 border-amber-300 text-amber-900' :
            order.refundStatus === 'APPROVED' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
            'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            <div className="font-bold flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">assignment_return</span>
                Return / Refund Status: {order.refundStatus}
              </span>
              {order.refundStatus === 'REQUESTED' && (
                <button
                  type="button"
                  onClick={() => {
                    setResolvingRefundOrder(order);
                    setRefundDecision('APPROVED');
                  }}
                  className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-700"
                >
                  Review Request
                </button>
              )}
            </div>
            {order.refundReason && <div className="mt-0.5">Reason: {order.refundReason}</div>}
          </div>
        )}

        {/* Delivery Address Row */}
        {order.address && (
          <div className="p-3 bg-surface-container/50 rounded-xl border border-surface-variant/40 flex flex-col gap-1.5 text-xs text-on-surface">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span>Barangay {order.address.barangay}, Agoo</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">
                {order.address.street}
              </span>
            </div>

            {/* Landmark Callout */}
            {order.notes && (
              <div className="flex items-start gap-1 text-amber-900 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 mt-0.5">
                <span className="material-symbols-outlined text-[14px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  pin_drop
                </span>
                <span className="font-semibold italic truncate">
                  Landmark: {order.notes}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Payment Collection Indicator */}
        <div className="flex items-center justify-between text-xs">
          {isPaid ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              Paid Online (GCash) — Do Not Collect Cash
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 font-bold border border-amber-300">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                payments
              </span>
              Collect Cash on Delivery: ₱{order.totalAmount.toFixed(2)}
            </span>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-surface-variant/60 pt-3 mt-1">
          <div className="flex items-center gap-1.5">
            {/* Dispatch Waybill Button */}
            <button
              onClick={() => openDispatchDetails(order)}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary-container text-on-secondary-container hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              Dispatch Slip
            </button>

            {/* Direct Call Link */}
            {recipientPhone && (
              <a
                href={`tel:${recipientPhone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary transition-colors"
                title={`Call ${recipientName}`}
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
              </a>
            )}

            {/* Open Google Maps */}
            {order.address && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary transition-colors"
                title="Navigate on Google Maps"
              >
                <span className="material-symbols-outlined text-[16px]">explore</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Cancel Button */}
            {canFarmerCancel && (
              <button
                type="button"
                onClick={() => setCancellingOrder(order)}
                className="border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
              >
                Cancel
              </button>
            )}

            {/* Wholesale Contract Batch Delivery Button */}
            {order.isContract && order.orderStatus !== 'CANCELLED' && (order.deliveriesCompleted ?? 0) < (order.contractWeeks ?? 1) && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleRecordContractDelivery(order.id)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                Record Batch Delivery ({(order.deliveriesCompleted ?? 0) + 1}/{order.contractWeeks ?? 1})
              </button>
            )}

            {/* Status Progression Button */}
            {nextActionLabel && (
              <button
                disabled={isPending}
                onClick={() => handleUpdateStatus(order.id, order.orderStatus)}
                className="bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isPending && (
                  <span className="material-symbols-outlined text-[14px] animate-spin">
                    progress_activity
                  </span>
                )}
                {nextActionLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Tab selector */}
      <div className="flex bg-surface-container rounded-xl p-1 shadow-sm overflow-x-auto gap-1">
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex-1 min-w-[120px] py-2 text-center text-xs sm:text-[14px] font-bold rounded-lg transition-all ${
            activeTab === 'active' 
              ? 'text-on-primary bg-primary shadow-sm' 
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Active ({activeOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`flex-1 min-w-[120px] py-2 text-center text-xs sm:text-[14px] font-bold rounded-lg transition-all ${
            activeTab === 'completed' 
              ? 'text-on-primary bg-primary shadow-sm' 
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Completed ({completedOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('refunds')}
          className={`flex-1 min-w-[130px] py-2 text-center text-xs sm:text-[14px] font-bold rounded-lg transition-all relative ${
            activeTab === 'refunds' 
              ? 'text-on-primary bg-primary shadow-sm' 
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Refunds ({refundOrders.length})
          {pendingRefundsCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
              {pendingRefundsCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('cancelled')}
          className={`flex-1 min-w-[110px] py-2 text-center text-xs sm:text-[14px] font-bold rounded-lg transition-all ${
            activeTab === 'cancelled' 
              ? 'text-on-primary bg-primary shadow-sm' 
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Cancelled ({cancelledOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('earnings')}
          className={`flex-1 min-w-[100px] py-2 text-center text-xs sm:text-[14px] font-bold rounded-lg transition-all ${
            activeTab === 'earnings' 
              ? 'text-on-primary bg-primary shadow-sm' 
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Earnings
        </button>
      </div>

      {/* Tab 1: Active Orders */}
      {activeTab === 'active' && (
        <div className="flex flex-col gap-2">
          {activeOrders.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-surface-variant/40 shadow-sm p-6">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">
                local_shipping
              </span>
              <p className="text-base font-bold text-on-surface">No active orders</p>
              <p className="text-xs text-on-surface-variant mt-1">
                New buyer orders requiring harvest and delivery will appear here.
              </p>
            </div>
          ) : (
            activeOrders.map(renderOrderCard)
          )}
        </div>
      )}

      {/* Tab 2: Completed Orders */}
      {activeTab === 'completed' && (
        <div className="flex flex-col gap-2">
          {completedOrders.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-surface-variant/40 shadow-sm p-6">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">
                task_alt
              </span>
              <p className="text-base font-bold text-on-surface">No completed deliveries yet</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Orders marked as delivered will be archived here.
              </p>
            </div>
          ) : (
            completedOrders.map(renderOrderCard)
          )}
        </div>
      )}

      {/* Tab 3: Refunds & Returns */}
      {activeTab === 'refunds' && (
        <div className="flex flex-col gap-3">
          {refundOrders.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-surface-variant/40 shadow-sm p-6">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">
                assignment_return
              </span>
              <p className="text-base font-bold text-on-surface">No refund requests</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Returns and refund disputes filed by buyers will appear here for your review.
              </p>
            </div>
          ) : (
            refundOrders.map((order) => {
              const isPendingReview = order.refundStatus === 'REQUESTED';

              return (
                <div
                  key={order.id}
                  className="p-5 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface text-base">{order.buyer.name}</span>
                        <span className="text-xs text-on-surface-variant font-mono">#{order.id.slice(0, 8)}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {order.items.map(i => `${i.product.name} (${i.quantityKg}kg)`).join(', ')}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      isPendingReview ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      order.refundStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                      'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}>
                      {order.refundStatus}
                    </span>
                  </div>

                  <div className="bg-surface-container/50 p-3.5 rounded-xl border border-surface-variant/40 text-xs flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Reason:</span>
                      <span className="font-bold text-amber-900">{order.refundReason || 'Unspecified'}</span>
                    </div>
                    {order.refundDetails && (
                      <div className="mt-1 text-gray-800">
                        <span className="font-semibold text-gray-700">Details: </span>
                        "{order.refundDetails}"
                      </div>
                    )}
                    <div className="flex justify-between items-center text-gray-600 mt-1">
                      <span>Order Value:</span>
                      <span className="font-bold text-primary">₱{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Proof Photo Preview Button */}
                  {order.refundProofUrl && (
                    <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                      <img 
                        src={order.refundProofUrl} 
                        alt="Proof thumbnail" 
                        className="w-12 h-12 rounded-lg object-cover border shrink-0 cursor-pointer"
                        onClick={() => setPreviewProofUrl(order.refundProofUrl || null)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900">Buyer Uploaded Proof</p>
                        <button
                          type="button"
                          onClick={() => setPreviewProofUrl(order.refundProofUrl || null)}
                          className="text-[11px] text-primary hover:underline flex items-center gap-0.5 mt-0.5"
                        >
                          <span className="material-symbols-outlined text-[13px]">visibility</span>
                          Click to inspect full photo
                        </button>
                      </div>
                    </div>
                  )}

                  {isPendingReview ? (
                    <div className="flex justify-end gap-2 pt-2 border-t border-surface-variant/40">
                      <button
                        type="button"
                        onClick={() => {
                          setResolvingRefundOrder(order);
                          setRefundDecision('REJECTED');
                        }}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold border border-rose-300 text-rose-700 hover:bg-rose-50"
                      >
                        Decline Refund
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setResolvingRefundOrder(order);
                          setRefundDecision('APPROVED');
                        }}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        Approve Refund
                      </button>
                    </div>
                  ) : (
                    order.refundAdminNote && (
                      <div className="text-[11px] text-gray-500 italic border-t pt-2">
                        Resolution Note: "{order.refundAdminNote}"
                      </div>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 4: Cancelled Orders */}
      {activeTab === 'cancelled' && (
        <div className="flex flex-col gap-2">
          {cancelledOrders.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-surface-variant/40 shadow-sm p-6">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">
                cancel
              </span>
              <p className="text-base font-bold text-on-surface">No cancelled orders</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Any orders cancelled before harvest will be tracked here.
              </p>
            </div>
          ) : (
            cancelledOrders.map(renderOrderCard)
          )}
        </div>
      )}

      {/* Tab 5: Earnings */}
      {activeTab === 'earnings' && (
        <>
          {/* FILTER + TOTAL EARNINGS */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex justify-between items-center">
              <h2 className="text-[20px] font-semibold text-on-background">Total Earnings</h2>
              <button className="flex items-center gap-1 text-[12px] font-semibold text-primary bg-primary-fixed px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                This Month
              </button>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-[16px] shadow-[0_4px_20px_rgba(27,67,50,0.04)] flex flex-col gap-[8px]">
              <div className="text-[48px] font-bold leading-[1.1] tracking-[-0.02em] text-[#D97706]">
                ₱{(stats?.thisMonthEarnings ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[14px] font-medium text-on-surface-variant">
                Ready for Payout: <span className="text-primary font-semibold">₱{readyForPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* WEEKLY OVERVIEW chart */}
          <div className="bg-surface-container-lowest rounded-xl p-[16px] shadow-[0_4px_20px_rgba(27,67,50,0.04)]">
            <div className="text-[14px] font-medium text-on-surface-variant mb-[16px]">
              Weekly Overview {isRefreshing && <span className="material-symbols-outlined animate-spin text-[14px] inline-block ml-1">progress_activity</span>}
            </div>
            {weekData.length === 0 || weekData.every((d) => d.total === 0) ? (
              <div className="h-32 flex items-center justify-center text-on-surface-variant text-[14px]">
                No earnings recorded this week.
              </div>
            ) : (
              <div className="flex items-end justify-between h-32 gap-2">
                {weekData.map((data, idx: number) => (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                    <div 
                      className={`w-full rounded-t-sm ${data.highlight ? 'bg-[#D97706] shadow-[0_0_10px_rgba(217,119,6,0.3)]' : 'bg-surface-container'}`} 
                      style={{ height: data.height }} 
                    />
                    <div className={`text-[10px] ${data.highlight ? 'text-primary font-bold' : 'text-outline'}`}>
                      {data.day}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TRANSACTION HISTORY */}
          <div className="flex flex-col gap-[8px]">
            <h3 className="text-[20px] font-semibold mb-[8px]">Recent Completed Orders</h3>
            <div className="flex flex-col gap-[8px]">
              {completedOrders.slice(0, 5).map((order) => {
                const productNames = order.items.map(i => i.product.name).join(', ');
                const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <div key={order.id} className="flex items-center justify-between p-[12px] bg-surface-container-lowest rounded-xl border border-surface-variant/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                        <span className="material-symbols-outlined text-[16px]">shopping_basket</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="text-[14px] font-bold text-on-surface truncate max-w-[150px] sm:max-w-xs">{productNames}</div>
                        <div className="text-[12px] font-semibold text-on-surface-variant">{date} • {order.address?.barangay || 'Agoo'}</div>
                      </div>
                    </div>
                    <div className="text-[14px] font-black text-[#15803d]">
                      +₱{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              })}
              {completedOrders.length === 0 && (
                <p className="text-[14px] text-on-surface-variant text-center py-4">No recent transactions.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Farmer Order Dispatch & Waybill Modal */}
      <FarmerOrderDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => {
          setIsDispatchModalOpen(false);
          setSelectedDispatchOrder(null);
        }}
        order={selectedDispatchOrder}
        onUpdateStatus={handleUpdateStatus}
        isUpdatingStatus={isPending}
      />

      {/* FARMER CANCEL ORDER MODAL */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600">
                <span className="material-symbols-outlined text-[24px]">cancel</span>
                <h3 className="font-bold text-gray-900 text-lg">Cancel Order #{cancellingOrder.id.slice(0, 8)}</h3>
              </div>
              <button onClick={() => setCancellingOrder(null)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-gray-500">
              The buyer will be notified immediately, and all harvested quantities will be restored to your inventory.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for cancellation *</label>
                <select 
                  value={cancelReasonPreset}
                  onChange={(e) => setCancelReasonPreset(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-rose-500"
                >
                  {FARMER_CANCEL_PRESETS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Note to Customer (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Explain why the order cannot be fulfilled..."
                  value={cancelReasonCustom}
                  onChange={(e) => setCancelReasonCustom(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:border-rose-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={() => setCancellingOrder(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleCancelOrderSubmit}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE REFUND MODAL */}
      {resolvingRefundOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-700">
                <span className="material-symbols-outlined text-[24px]">assignment_return</span>
                <h3 className="font-bold text-gray-900 text-lg">
                  {refundDecision === 'APPROVED' ? 'Approve' : 'Decline'} Refund Request
                </h3>
              </div>
              <button onClick={() => setResolvingRefundOrder(null)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-700 flex flex-col gap-1">
              <div><span className="font-semibold">Buyer:</span> {resolvingRefundOrder.buyer.name}</div>
              <div><span className="font-semibold">Reason:</span> {resolvingRefundOrder.refundReason}</div>
              <div><span className="font-semibold">Amount:</span> ₱{resolvingRefundOrder.totalAmount.toFixed(2)}</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Decision</label>
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
                  Message / Resolution Note to Buyer
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    refundDecision === 'APPROVED'
                      ? 'e.g. Apologies for the defective item, we have approved your refund.'
                      : 'e.g. Produce delivered was confirmed fresh per inspection.'
                  }
                  value={refundAdminNote}
                  onChange={(e) => setRefundAdminNote(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isSubmittingRefund}
                onClick={() => setResolvingRefundOrder(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingRefund}
                onClick={handleResolveRefundSubmit}
                className={`px-4 py-2 text-xs font-semibold rounded-lg text-white shadow-sm disabled:opacity-50 ${
                  refundDecision === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmittingRefund ? 'Submitting...' : `Confirm ${refundDecision === 'APPROVED' ? 'Approval' : 'Decline'}`}
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
              <h3 className="font-bold text-sm text-gray-900">Refund Proof Photo</h3>
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
    </>
  );
}
