'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import {
  updateOrderStatusAction,
  cancelOrderAction,
  resolveOrderRefundAction,
  recordContractDeliveryAction,
  pushLiveLogisticsCheckpointAction,
} from '@/app/actions/orders';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { formatQuantity } from '@/lib/utils';
import { resolveOrderLogistics } from '@/lib/logistics-utils';
import FarmerOrderDispatchModal, { DispatchOrder } from './FarmerOrderDispatchModal';
import PaginationBar from '@/components/ui/PaginationBar';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const router = useRouter();

  // State for dispatch modal
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

  const handleQuickPushCheckpoint = (
    orderId: string,
    checkpointStage:
      | 'HARVESTED_QC'
      | 'DEPARTED_HUB'
      | 'ARRIVED_MUNICIPALITY'
      | 'OUT_FOR_DELIVERY_NEARBY'
      | 'DELIVERED_POD'
  ) => {
    startTransition(async () => {
      const toastId = toast.loading('Updating checkpoint...');
      const res = await pushLiveLogisticsCheckpointAction({
        orderId,
        checkpointKey: checkpointStage,
        proofOfDeliveryUrl:
          checkpointStage === 'DELIVERED_POD'
            ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80'
            : undefined,
      });
      if (res.success) {
        toast.success(res.message || 'Checkpoint updated.', { id: toastId });
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to push checkpoint.', { id: toastId });
      }
    });
  };

  const renderOrderCard = (order: Order) => {
    const logistics = resolveOrderLogistics(order);
    const latestLog = logistics.logs[0];
    const recipientName = order.address?.fullName || order.buyer.name;
    const recipientPhone = order.address?.phone || order.buyer.phone || '';
    const initials = recipientName.substring(0, 2).toUpperCase();
    const productSummary = order.items
      .map(i => `${i.product.name} (${formatQuantity(i.quantityKg, 'kg')})`)
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

    return (
      <div
        key={order.id}
        className="flex flex-col p-4 sm:p-5 bg-white rounded-xl border border-gray-200 mb-3 gap-3 transition-colors hover:border-green-800"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {recipientName}
                </p>
                <span className="text-[11px] font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                {order.isContract && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                    Wholesale Contract
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate max-w-[220px] sm:max-w-md mt-0.5">
                {productSummary}
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end shrink-0">
            <p className="text-sm sm:text-base font-semibold text-green-800 tabular-nums mb-1">
              ₱{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span
              className={`text-[10px] font-medium tracking-wider px-2 py-0.5 rounded uppercase border ${
                isOrderPending
                  ? 'bg-gray-50 text-gray-700 border-gray-200'
                  : isOrderReady
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : isOrderDelivered
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : isOrderCancelled
                  ? 'bg-red-50/60 text-red-700 border-red-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              {order.orderStatus}
            </span>
          </div>
        </div>

        {/* WHOLESALE CONTRACT PROGRESS BANNER */}
        {order.isContract && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 flex flex-col gap-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-medium text-gray-900">
                Schedule: {order.deliveryScheduleDay || 'Every Saturday'}
              </span>
              <span className="font-medium text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">
                Batch {order.deliveriesCompleted ?? 0} of {order.contractWeeks ?? 1} Delivered
              </span>
            </div>
            {order.nextDeliveryDate && order.orderStatus !== 'DELIVERED' && (order.orderStatus as any) !== 'COMPLETED' && (
              <div className="text-[11px] text-gray-600">
                Next Delivery: <strong>{format(new Date(order.nextDeliveryDate), 'EEEE, MMM d, yyyy')}</strong>
              </div>
            )}
          </div>
        )}

        {/* Cancellation details banner */}
        {isOrderCancelled && (
          <div className="p-3 bg-red-50/60 border border-red-200 rounded-lg text-xs text-red-800">
            <div className="font-medium">
              Order Cancelled {order.cancelledBy ? `by ${order.cancelledBy.toLowerCase()}` : ''}
            </div>
            {order.cancelReason && <div className="mt-0.5">Reason: "{order.cancelReason}"</div>}
            <div className="mt-1 text-[11px] text-red-600">Stock restored to inventory.</div>
          </div>
        )}

        {/* Refund badge if applicable */}
        {order.refundStatus && order.refundStatus !== 'NONE' && (
          <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-700">
            <div className="font-medium flex items-center justify-between">
              <span>Return / Refund: {order.refundStatus}</span>
              {order.refundStatus === 'REQUESTED' && (
                <button
                  type="button"
                  onClick={() => {
                    setResolvingRefundOrder(order);
                    setRefundDecision('APPROVED');
                  }}
                  className="px-2 py-0.5 rounded bg-gray-900 text-white font-medium text-[11px] hover:bg-black"
                >
                  Review Request
                </button>
              )}
            </div>
            {order.refundReason && <div className="mt-0.5 text-gray-600">Reason: {order.refundReason}</div>}
          </div>
        )}

        {/* Delivery Address Row */}
        {order.address && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col gap-1 text-xs text-gray-700">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">
                Barangay {order.address.barangay}, Agoo
              </span>
              <span className="text-gray-500">
                {order.address.street}
              </span>
            </div>
            {order.notes && (
              <p className="text-[11px] text-gray-600 italic">
                Landmark: &ldquo;{order.notes}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Payment & Tracking Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {isPaid ? (
            <span className="px-2.5 py-0.5 rounded bg-green-50 text-green-800 font-medium border border-green-200">
              Paid Online (GCash) — Do Not Collect Cash
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded bg-gray-100 text-gray-800 font-medium border border-gray-300">
              Collect Cash on Delivery: ₱{order.totalAmount.toFixed(2)}
            </span>
          )}

          <span className="font-mono font-medium text-[11px] text-gray-600">
            {logistics.trackingNumber} • {logistics.courierName}
          </span>
        </div>

        {/* Quick Checkpoint Console for Active Orders */}
        {(isOrderConfirmed || isOrderReady) && (
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-700">
                Logistics Quick Updates
              </span>
              {latestLog && (
                <span className="text-[10px] text-gray-500 truncate max-w-xs">
                  Latest: {latestLog.title}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleQuickPushCheckpoint(order.id, 'HARVESTED_QC')}
                className="px-2.5 py-1 rounded bg-white hover:bg-green-50/70 hover:border-green-300 text-gray-800 border border-gray-200 text-[11px] font-medium transition-colors"
              >
                Harvested & Packed
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleQuickPushCheckpoint(order.id, 'DEPARTED_HUB')}
                className="px-2.5 py-1 rounded bg-white hover:bg-green-50/70 hover:border-green-300 text-gray-800 border border-gray-200 text-[11px] font-medium transition-colors"
              >
                Departed Hub
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleQuickPushCheckpoint(order.id, 'ARRIVED_MUNICIPALITY')}
                className="px-2.5 py-1 rounded bg-white hover:bg-green-50/70 hover:border-green-300 text-gray-800 border border-gray-200 text-[11px] font-medium transition-colors"
              >
                Arrived in Municipality
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleQuickPushCheckpoint(order.id, 'OUT_FOR_DELIVERY_NEARBY')}
                className="px-2.5 py-1 rounded bg-white hover:bg-green-50/70 hover:border-green-300 text-gray-800 border border-gray-200 text-[11px] font-medium transition-colors"
              >
                Rider Nearby
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => openDispatchDetails(order)}
                className="px-2.5 py-1 rounded bg-green-800 hover:bg-green-900 text-white text-[11px] font-medium transition-colors"
              >
                Mark Delivered + POD
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 mt-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openDispatchDetails(order)}
              type="button"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Dispatch & Waybill
            </button>

            {recipientPhone && (
              <a
                href={`tel:${recipientPhone.replace(/[^0-9+]/g, '')}`}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
              >
                Call
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {canFarmerCancel && (
              <button
                type="button"
                onClick={() => setCancellingOrder(order)}
                className="border border-gray-300 text-red-700 hover:bg-red-50 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}

            {order.isContract && order.orderStatus !== 'CANCELLED' && (order.deliveriesCompleted ?? 0) < (order.contractWeeks ?? 1) && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleRecordContractDelivery(order.id)}
                className="bg-green-800 hover:bg-green-900 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Record Batch ({(order.deliveriesCompleted ?? 0) + 1}/{order.contractWeeks ?? 1})
              </button>
            )}

            {nextActionLabel && (
              <button
                disabled={isPending}
                onClick={() => handleUpdateStatus(order.id, order.orderStatus)}
                className="bg-green-800 hover:bg-green-900 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isPending ? 'Updating...' : nextActionLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Tab Selector */}
      <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200 overflow-x-auto gap-1">
        <button 
          onClick={() => { setActiveTab('active'); setCurrentPage(1); }}
          className={`flex-1 min-w-[110px] py-2 text-center text-xs font-semibold rounded-md transition-all ${
            activeTab === 'active' 
              ? 'text-white bg-green-800 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active ({activeOrders.length})
        </button>
        <button 
          onClick={() => { setActiveTab('completed'); setCurrentPage(1); }}
          className={`flex-1 min-w-[110px] py-2 text-center text-xs font-semibold rounded-md transition-all ${
            activeTab === 'completed' 
              ? 'text-white bg-green-800 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed ({completedOrders.length})
        </button>
        <button 
          onClick={() => { setActiveTab('refunds'); setCurrentPage(1); }}
          className={`flex-1 min-w-[120px] py-2 text-center text-xs font-semibold rounded-md transition-all ${
            activeTab === 'refunds' 
              ? 'text-white bg-green-800 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Refunds ({refundOrders.length})
          {pendingRefundsCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-gray-200 text-gray-800 rounded-full text-[10px]">
              {pendingRefundsCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => { setActiveTab('cancelled'); setCurrentPage(1); }}
          className={`flex-1 min-w-[110px] py-2 text-center text-xs font-semibold rounded-md transition-all ${
            activeTab === 'cancelled' 
              ? 'text-white bg-green-800 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Cancelled ({cancelledOrders.length})
        </button>
        <button 
          onClick={() => { setActiveTab('earnings'); setCurrentPage(1); }}
          className={`flex-1 min-w-[100px] py-2 text-center text-xs font-semibold rounded-md transition-all ${
            activeTab === 'earnings' 
              ? 'text-white bg-green-800 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Earnings
        </button>
      </div>

      {/* Tab 1: Active Orders */}
      {activeTab === 'active' && (
        <div className="flex flex-col gap-2 mt-4">
          {activeOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm font-semibold text-gray-900">No active orders</p>
              <p className="text-xs text-gray-500 mt-1">
                New buyer orders requiring harvest and delivery will appear here.
              </p>
            </div>
          ) : (
            <>
              {activeOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(renderOrderCard)}
              <PaginationBar
                currentPage={currentPage}
                totalPages={Math.max(1, Math.ceil(activeOrders.length / pageSize))}
                totalItems={activeOrders.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                pageSizeOptions={[3, 5, 10, 20]}
                itemLabel="active orders"
              />
            </>
          )}
        </div>
      )}

      {/* Tab 2: Completed Orders */}
      {activeTab === 'completed' && (
        <div className="flex flex-col gap-2 mt-4">
          {completedOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm font-semibold text-gray-900">No completed deliveries yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Orders marked as delivered will be archived here.
              </p>
            </div>
          ) : (
            <>
              {completedOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(renderOrderCard)}
              <PaginationBar
                currentPage={currentPage}
                totalPages={Math.max(1, Math.ceil(completedOrders.length / pageSize))}
                totalItems={completedOrders.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                pageSizeOptions={[3, 5, 10, 20]}
                itemLabel="completed orders"
              />
            </>
          )}
        </div>
      )}

      {/* Tab 3: Refunds & Returns */}
      {activeTab === 'refunds' && (
        <div className="flex flex-col gap-3 mt-4">
          {refundOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm font-semibold text-gray-900">No refund requests</p>
              <p className="text-xs text-gray-500 mt-1">
                Returns and refund disputes filed by buyers will appear here.
              </p>
            </div>
          ) : (
            <>
            {refundOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((order) => {
              const isPendingReview = order.refundStatus === 'REQUESTED';

              return (
                <div
                  key={order.id}
                  className="p-5 bg-white rounded-xl border border-gray-200 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{order.buyer.name}</span>
                        <span className="text-xs text-gray-500 font-mono">#{order.id.slice(0, 8)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {order.items.map(i => `${i.product.name} (${formatQuantity(i.quantityKg, 'kg')})`).join(', ')}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wide border ${
                      isPendingReview ? 'bg-gray-100 text-gray-700 border-gray-300' :
                      order.refundStatus === 'APPROVED' ? 'bg-green-50 text-green-800 border-green-200' :
                      'bg-red-50/60 text-red-700 border-red-200'
                    }`}>
                      {order.refundStatus}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium text-gray-900">{order.refundReason || 'Unspecified'}</span>
                    </div>
                    {order.refundDetails && (
                      <div className="text-gray-700 mt-0.5">
                        <span className="text-gray-500">Details: </span>
                        &ldquo;{order.refundDetails}&rdquo;
                      </div>
                    )}
                    <div className="flex justify-between items-center text-gray-600 mt-1">
                      <span>Order Value:</span>
                      <span className="font-semibold text-green-800 tabular-nums">₱{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {order.refundProofUrl && (
                    <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                      <img 
                        src={order.refundProofUrl} 
                        alt="Proof thumbnail" 
                        className="w-12 h-12 rounded object-cover border shrink-0 cursor-pointer"
                        onClick={() => setPreviewProofUrl(order.refundProofUrl || null)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900">Buyer Uploaded Proof</p>
                        <button
                          type="button"
                          onClick={() => setPreviewProofUrl(order.refundProofUrl || null)}
                          className="text-[11px] text-green-800 hover:underline mt-0.5"
                        >
                          Click to inspect photo
                        </button>
                      </div>
                    </div>
                  )}

                  {isPendingReview ? (
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          setResolvingRefundOrder(order);
                          setRefundDecision('REJECTED');
                        }}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-gray-300 text-red-700 hover:bg-red-50"
                      >
                        Decline Refund
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setResolvingRefundOrder(order);
                          setRefundDecision('APPROVED');
                        }}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-green-800 hover:bg-green-900 text-white"
                      >
                        Approve Refund
                      </button>
                    </div>
                  ) : (
                    order.refundAdminNote && (
                      <div className="text-[11px] text-gray-500 italic border-t border-gray-100 pt-2">
                        Resolution Note: &ldquo;{order.refundAdminNote}&rdquo;
                      </div>
                    )
                  )}
                </div>
              );
            })}
            <PaginationBar
              currentPage={currentPage}
              totalPages={Math.max(1, Math.ceil(refundOrders.length / pageSize))}
              totalItems={refundOrders.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
              pageSizeOptions={[3, 5, 10, 20]}
              itemLabel="refund requests"
            />
            </>
          )}
        </div>
      )}

      {/* Tab 4: Cancelled Orders */}
      {activeTab === 'cancelled' && (
        <div className="flex flex-col gap-2 mt-4">
          {cancelledOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm font-semibold text-gray-900">No cancelled orders</p>
              <p className="text-xs text-gray-500 mt-1">
                Any orders cancelled before harvest will be tracked here.
              </p>
            </div>
          ) : (
            <>
              {cancelledOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(renderOrderCard)}
              <PaginationBar
                currentPage={currentPage}
                totalPages={Math.max(1, Math.ceil(cancelledOrders.length / pageSize))}
                totalItems={cancelledOrders.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                pageSizeOptions={[3, 5, 10, 20]}
                itemLabel="cancelled orders"
              />
            </>
          )}
        </div>
      )}

      {/* Tab 5: Earnings */}
      {activeTab === 'earnings' && (
        <div className="flex flex-col gap-4 mt-4">
          {/* TOTAL EARNINGS */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900">Total Earnings</h2>
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                This Month
              </span>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col gap-1">
              <div className="text-3xl sm:text-4xl font-bold text-green-800 tabular-nums">
                ₱{(stats?.thisMonthEarnings ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs font-medium text-gray-500">
                Ready for Payout: <span className="text-green-800 font-semibold tabular-nums">₱{readyForPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* WEEKLY OVERVIEW chart */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Weekly Overview {isRefreshing && <span className="text-gray-400 font-normal ml-1">Refreshing...</span>}
            </div>
            {weekData.length === 0 || weekData.every((d) => d.total === 0) ? (
              <div className="h-32 flex items-center justify-center text-gray-400 text-xs">
                No earnings recorded this week.
              </div>
            ) : (
              <div className="flex items-end justify-between h-32 gap-2">
                {weekData.map((data, idx: number) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                    <div 
                      className={`w-full rounded-t ${data.highlight ? 'bg-green-800' : 'bg-gray-200'}`} 
                      style={{ height: data.height }} 
                    />
                    <div className={`text-[10px] ${data.highlight ? 'text-green-800 font-bold' : 'text-gray-500'}`}>
                      {data.day}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TRANSACTION HISTORY */}
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-semibold text-gray-900">Recent Completed Orders</h3>
            <div className="flex flex-col gap-2">
              {completedOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((order) => {
                const productNames = order.items.map(i => i.product.name).join(', ');
                const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <div key={order.id} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-gray-200">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 truncate max-w-[180px] sm:max-w-xs">{productNames}</div>
                      <div className="text-xs text-gray-500">{date} • {order.address?.barangay || 'Agoo'}</div>
                    </div>
                    <div className="text-sm font-semibold text-green-800 tabular-nums">
                      +₱{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              })}
              {completedOrders.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No recent transactions.</p>
              ) : (
                <PaginationBar
                  currentPage={currentPage}
                  totalPages={Math.max(1, Math.ceil(completedOrders.length / pageSize))}
                  totalItems={completedOrders.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                  pageSizeOptions={[3, 5, 10, 20]}
                  itemLabel="transactions"
                  compact
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Farmer Order Dispatch Modal */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-gray-900 text-base">Cancel Order #{cancellingOrder.id.slice(0, 8)}</h3>
              <button onClick={() => setCancellingOrder(null)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-gray-600">
              The buyer will be notified, and all harvested quantities will be restored to your inventory.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reason for cancellation *</label>
                <select 
                  value={cancelReasonPreset}
                  onChange={(e) => setCancelReasonPreset(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-green-800"
                >
                  {FARMER_CANCEL_PRESETS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Note to Customer (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Explain why the order cannot be fulfilled..."
                  value={cancelReasonCustom}
                  onChange={(e) => setCancelReasonCustom(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:border-green-800 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={() => setCancellingOrder(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleCancelOrderSubmit}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-700 hover:bg-red-800 text-white disabled:opacity-50"
              >
                {isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE REFUND MODAL */}
      {resolvingRefundOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-gray-900 text-base">
                {refundDecision === 'APPROVED' ? 'Approve' : 'Decline'} Refund Request
              </h3>
              <button onClick={() => setResolvingRefundOrder(null)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-700 flex flex-col gap-1">
              <div><span className="font-medium text-gray-900">Buyer:</span> {resolvingRefundOrder.buyer.name}</div>
              <div><span className="font-medium text-gray-900">Reason:</span> {resolvingRefundOrder.refundReason}</div>
              <div><span className="font-medium text-gray-900">Amount:</span> ₱{resolvingRefundOrder.totalAmount.toFixed(2)}</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Decision</label>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Message to Buyer
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    refundDecision === 'APPROVED'
                      ? 'e.g. Apologies for the defective item, your refund is approved.'
                      : 'e.g. Produce delivered was confirmed fresh upon handover.'
                  }
                  value={refundAdminNote}
                  onChange={(e) => setRefundAdminNote(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:border-green-800 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isSubmittingRefund}
                onClick={() => setResolvingRefundOrder(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingRefund}
                onClick={handleResolveRefundSubmit}
                className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-colors disabled:opacity-50 ${
                  refundDecision === 'APPROVED' ? 'bg-green-800 hover:bg-green-900' : 'bg-red-700 hover:bg-red-800'
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewProofUrl(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full p-4 shadow-xl flex flex-col gap-3 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-semibold text-sm text-gray-900">Refund Proof Photo</h3>
              <button onClick={() => setPreviewProofUrl(null)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="max-h-[75vh] flex items-center justify-center bg-gray-950 rounded-lg overflow-hidden">
              <img src={previewProofUrl} alt="Refund proof" className="max-h-[70vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
