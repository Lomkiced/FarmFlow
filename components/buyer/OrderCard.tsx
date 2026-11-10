'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import type { OrderStatus, PaymentStatus } from '@prisma/client';
import toast from 'react-hot-toast';
import {
  cancelOrderAction,
  requestOrderRefundAction,
  confirmOrderReceivedAndRateAction,
} from '@/app/actions/orders';
import { uploadRefundProof } from '@/app/actions/upload';
import { formatQuantity } from '@/lib/utils';
import { resolveOrderLogistics } from '@/lib/logistics-utils';
import OrderTrackingModal from './OrderTrackingModal';

export interface OrderItemProp {
  id: string;
  product: {
    name: string;
    photos: string[];
    farm: { farmName: string; barangay?: string | null; location?: string | null };
  };
  quantityKg: number;
  pricePerKg: number;
  subtotal: number;
}

export interface OrderCardProps {
  order: {
    id: string;
    totalAmount: number;
    deliveryFee: number;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    orderType?: string | null;
    isContract?: boolean;
    deliveryScheduleDay?: string | null;
    contractWeeks?: number | null;
    deliveriesCompleted?: number;
    nextDeliveryDate?: Date | string | null;
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
    trackingNumber?: string | null;
    courierName?: string | null;
    driverName?: string | null;
    driverPhone?: string | null;
    vehicleInfo?: string | null;
    estimatedDelivery?: string | null;
    proofOfDeliveryUrl?: string | null;
    buyerConfirmedAt?: Date | string | null;
    freshnessRating?: number | null;
    buyerReview?: string | null;
    logisticsLogs?: any;
    createdAt: Date | string;
    items: OrderItemProp[];
    address: {
      fullName: string;
      phone: string;
      street: string;
      barangay: string;
      city: string;
      province: string;
    };
  };
}

const statusBadgeStyles: Record<OrderStatus, string> = {
  PENDING: 'border-gray-200 bg-gray-50 text-gray-700',
  CONFIRMED: 'border-gray-200 bg-gray-50 text-gray-700',
  READY: 'border-green-200 bg-green-50 text-green-800',
  DELIVERED: 'border-green-200 bg-green-50 text-green-800',
  CANCELLED: 'border-red-200 bg-red-50/60 text-red-700',
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Order Placed',
  CONFIRMED: 'Confirmed',
  READY: 'Ready for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const statusProgress: Record<OrderStatus, number> = {
  PENDING: 25,
  CONFIRMED: 50,
  READY: 75,
  DELIVERED: 100,
  CANCELLED: 0,
};

const CANCEL_PRESETS = [
  'Change of mind / No longer needed',
  'Ordered by mistake',
  'Found alternative produce',
  'Delivery taking too long',
  'Need to update address or order items',
  'Other reason',
];

const REFUND_PRESETS = [
  'Return & Refund - Damaged/Spoiled Produce',
  'Return & Refund - Wrong Item Delivered',
  'Partial Refund - Missing Quantity',
  'Quality Issue',
  'Other reason',
];

export default function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReasonPreset, setCancelReasonPreset] = useState(CANCEL_PRESETS[0]);
  const [cancelReasonCustom, setCancelReasonCustom] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Refund Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReasonPreset, setRefundReasonPreset] = useState(REFUND_PRESETS[0]);
  const [refundDetails, setRefundDetails] = useState('');
  const [refundProofFile, setRefundProofFile] = useState<File | null>(null);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  // Order Received & Rate Freshness Modal State
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [freshnessRating, setFreshnessRating] = useState<number>(5);
  const [buyerReview, setBuyerReview] = useState<string>('');
  const [isConfirmingReceipt, setIsConfirmingReceipt] = useState(false);

  const logistics = resolveOrderLogistics(order);
  const latestLog = logistics.logs[0];
  const isBuyerCompleted = Boolean(order.buyerConfirmedAt);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const progress = statusProgress[order.orderStatus];
  const canCancel = order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED';
  const canRequestRefund =
    (order.orderStatus === 'DELIVERED' || (order.orderStatus as any) === 'COMPLETED') &&
    (!order.refundStatus || order.refundStatus === 'NONE' || order.refundStatus === 'REJECTED');
  const canConfirmReceived =
    order.orderStatus === 'DELIVERED' &&
    !isBuyerCompleted &&
    order.refundStatus !== 'APPROVED';

  const handleConfirmOrderReceived = async () => {
    setIsConfirmingReceipt(true);
    const toastId = toast.loading('Confirming receipt & releasing escrow payout...');
    try {
      const res = await confirmOrderReceivedAndRateAction({
        orderId: order.id,
        freshnessRating,
        buyerReview: buyerReview.trim() || undefined,
      });
      if (res.success) {
        toast.success(res.message || 'Order received & freshness rating submitted!', { id: toastId });
        setIsReceiveModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to confirm order receipt.', { id: toastId });
      }
    } catch (e: any) {
      toast.error(e?.message || 'An error occurred.', { id: toastId });
    } finally {
      setIsConfirmingReceipt(false);
    }
  };

  const handleCancelOrder = async () => {
    const finalReason =
      cancelReasonPreset === 'Other reason'
        ? cancelReasonCustom.trim()
        : `${cancelReasonPreset}${cancelReasonCustom.trim() ? `: ${cancelReasonCustom.trim()}` : ''}`;

    if (!finalReason) {
      toast.error('Please provide a reason for cancellation.');
      return;
    }

    setIsCancelling(true);
    const toastId = toast.loading('Cancelling order...');

    try {
      const res = await cancelOrderAction(order.id, finalReason);
      if (res.success) {
        toast.success(res.message || 'Order successfully cancelled.', { id: toastId });
        setIsCancelModalOpen(false);
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

  const handleRefundSubmit = async () => {
    const finalReason = refundReasonPreset;
    if (!finalReason) {
      toast.error('Please choose a reason for refund.');
      return;
    }

    setIsSubmittingRefund(true);
    const toastId = toast.loading('Uploading proof and submitting refund request...');

    try {
      let proofUrl: string | undefined = undefined;

      if (refundProofFile) {
        const formData = new FormData();
        formData.append('file', refundProofFile);
        const uploadRes = await uploadRefundProof(formData);
        if (uploadRes.success && 'url' in uploadRes) {
          proofUrl = uploadRes.url as string;
        } else {
          toast.error(`Photo upload failed: ${uploadRes.error || 'Please try again.'}`, { id: toastId });
          setIsSubmittingRefund(false);
          return;
        }
      }

      const res = await requestOrderRefundAction({
        orderId: order.id,
        reason: finalReason,
        details: refundDetails.trim() || undefined,
        proofUrl,
      });

      if (res.success) {
        toast.success(res.message || 'Refund request submitted.', { id: toastId });
        setIsRefundModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to submit refund request.', { id: toastId });
      }
    } catch (e: any) {
      toast.error(e?.message || 'An error occurred.', { id: toastId });
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col hover:border-green-800 transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase font-medium text-gray-500 tracking-wider">
                Order #{order.id.slice(0, 8)}
              </span>
              {order.isContract && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                  Wholesale Contract
                </span>
              )}
              {order.refundStatus && order.refundStatus !== 'NONE' && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${
                  order.refundStatus === 'REQUESTED' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                  order.refundStatus === 'APPROVED' ? 'bg-green-50 text-green-800 border-green-200' :
                  'bg-red-50/60 text-red-700 border-red-200'
                }`}>
                  Refund {order.refundStatus.toLowerCase()}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400 mt-0.5">
              Placed {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              {isBuyerCompleted && (
                <span className="px-2.5 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider bg-green-50 text-green-800 border border-green-200">
                  Completed • {order.freshnessRating || 5}★
                </span>
              )}
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider border ${statusBadgeStyles[order.orderStatus]}`}>
                {isBuyerCompleted ? 'Completed' : statusLabels[order.orderStatus]}
              </span>
            </div>
            {order.orderStatus !== 'CANCELLED' && (
              <div className="w-28 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-800 transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* LIVE LOGISTICS PREVIEW STRIP */}
        {latestLog && (
          <button
            type="button"
            onClick={() => setIsTrackingModalOpen(true)}
            className="w-full text-left px-6 py-2.5 border-b border-gray-200 bg-gray-50/80 hover:bg-gray-100/80 transition-colors flex items-center justify-between gap-3 text-xs"
          >
            <div className="min-w-0 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 truncate">
                {latestLog.title}
              </span>
              <span className="font-mono text-[11px] text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                {logistics.trackingNumber}
              </span>
              <span className="text-gray-500 hidden sm:inline">
                • {logistics.courierName}
              </span>
            </div>
            <span className="font-medium text-green-800 shrink-0 hover:underline">
              Track Order →
            </span>
          </button>
        )}

        {/* WHOLESALE CONTRACT PROGRESS BANNER */}
        {order.isContract && (
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-700">
            <div>
              <span className="font-medium text-gray-900">Weekly Fulfillment:</span> {order.deliveryScheduleDay || 'Every Saturday'}
              <span className="mx-2 text-gray-300">•</span>
              <span className="font-medium text-gray-900">Batches:</span> {order.deliveriesCompleted ?? 0} of {order.contractWeeks ?? 1} Delivered
            </div>
            {order.nextDeliveryDate && order.orderStatus !== 'DELIVERED' && (order.orderStatus as any) !== 'COMPLETED' && (
              <div className="text-gray-600 font-mono text-[11px]">
                Next: {format(new Date(order.nextDeliveryDate), 'EEE, MMM d, yyyy')}
              </div>
            )}
          </div>
        )}

        {/* CANCELLATION NOTICE BANNER */}
        {order.orderStatus === 'CANCELLED' && (
          <div className="bg-red-50/60 border-b border-red-200 px-6 py-2.5 text-xs text-red-800">
            <p className="font-medium">Order Cancelled {order.cancelledBy ? `by ${order.cancelledBy.toLowerCase()}` : ''}</p>
            {order.cancelReason && <p className="text-red-700 mt-0.5">Reason: "{order.cancelReason}"</p>}
            {order.cancelledAt && (
              <p className="text-red-600 text-[11px] mt-0.5">
                Cancelled {format(new Date(order.cancelledAt), 'MMM d, yyyy h:mm a')} • Stock restored
              </p>
            )}
          </div>
        )}

        {/* REFUND STATUS BANNER */}
        {order.refundStatus && order.refundStatus !== 'NONE' && (
          <div className="px-6 py-2.5 border-b border-gray-200 bg-gray-50 text-xs text-gray-700">
            <p className="font-medium text-gray-900">
              {order.refundStatus === 'REQUESTED' && 'Return / Refund Request Under Review'}
              {order.refundStatus === 'APPROVED' && 'Return / Refund Approved'}
              {order.refundStatus === 'REJECTED' && 'Return / Refund Request Declined'}
            </p>
            {order.refundReason && <p className="mt-0.5 text-gray-600">Reason: {order.refundReason}</p>}
            {order.refundAdminNote && <p className="mt-0.5 text-gray-500">Note: "{order.refundAdminNote}"</p>}
          </div>
        )}

        {/* Items */}
        <div className="p-6 divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex gap-4 items-start">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                {item.product.photos && item.product.photos.length > 0 ? (
                  <Image src={item.product.photos[0]} alt={item.product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No image
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-semibold text-sm text-gray-900 truncate">{item.product.name}</h4>
                  <span className="font-semibold text-gray-900 text-sm tabular-nums shrink-0">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
                <span className="text-xs text-gray-500 mt-0.5">
                  {item.product.farm.farmName}
                </span>
                <span className="text-xs text-gray-600 font-mono tabular-nums mt-1">
                  {formatQuantity(item.quantityKg, 'kg')} &times; {formatCurrency(item.pricePerKg)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Order Total</span>
              <span className="font-semibold text-lg text-green-800 tabular-nums">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
            {isBuyerCompleted && order.buyerReview && (
              <div className="hidden md:block pl-4 border-l border-gray-200 text-xs text-gray-600 max-w-xs truncate">
                Review: &ldquo;{order.buyerReview}&rdquo;
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end items-center">
            {canCancel && (
              <button 
                onClick={() => setIsCancelModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 text-red-700 hover:bg-red-50 transition-colors"
              >
                Cancel Order
              </button>
            )}

            {canRequestRefund && (
              <button 
                onClick={() => setIsRefundModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Return / Refund
              </button>
            )}

            {canConfirmReceived && (
              <button
                type="button"
                onClick={() => setIsReceiveModalOpen(true)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-green-800 hover:bg-green-900 text-white transition-colors"
              >
                Order Received
              </button>
            )}

            <button 
              onClick={() => setIsTrackingModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Track Order
            </button>

            <Link
              href={`/orders/${order.id}`}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
            >
              Details
            </Link>
          </div>
        </div>
      </div>

      <OrderTrackingModal 
        isOpen={isTrackingModalOpen} 
        onClose={() => setIsTrackingModalOpen(false)} 
        order={order}
      />

      {/* ORDER RECEIVED & RATE FRESHNESS MODAL */}
      {isReceiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-base leading-tight">Confirm Order Received</h3>
                <p className="text-xs text-gray-500 mt-0.5">Release FarmFlow Escrow & Rate Harvest Freshness</p>
              </div>
              <button onClick={() => setIsReceiveModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700">
              Confirming receipt releases <strong>{formatCurrency(order.totalAmount)}</strong> from escrow to <strong>{order.items[0]?.product.farm.farmName || 'the farmer'}</strong>.
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                Rate Harvest Freshness
              </label>
              <div className="flex items-center justify-center gap-2 my-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFreshnessRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <span
                      className={`text-2xl font-bold ${
                        star <= freshnessRating ? 'text-green-800' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold text-green-800 mt-1">
                {freshnessRating === 5 && '5/5 Stars — Farm-Direct Freshness'}
                {freshnessRating === 4 && '4/5 Stars — Fresh & Good Condition'}
                {freshnessRating === 3 && '3/5 Stars — Acceptable Quality'}
                {freshnessRating === 2 && '2/5 Stars — Below Expectations'}
                {freshnessRating === 1 && '1/5 Star — Poor Quality'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Leave a Review for {order.items[0]?.product.farm.farmName || 'the Farm'} (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="How was the freshness, packaging, and delivery speed?"
                value={buyerReview}
                onChange={(e) => setBuyerReview(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-lg p-3 outline-none focus:border-green-800 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isConfirmingReceipt}
                onClick={() => setIsReceiveModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Not Yet
              </button>
              <button
                type="button"
                disabled={isConfirmingReceipt}
                onClick={handleConfirmOrderReceived}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-green-800 hover:bg-green-900 text-white disabled:opacity-50"
              >
                {isConfirmingReceipt ? 'Releasing Escrow...' : 'Confirm & Release Payout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL ORDER MODAL */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-gray-900 text-base">Cancel Order #{order.id.slice(0, 8)}</h3>
              <button onClick={() => setIsCancelModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Are you sure you want to cancel this order? Stock will be immediately restored to the farmer's inventory.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reason for cancellation *</label>
                <select 
                  value={cancelReasonPreset}
                  onChange={(e) => setCancelReasonPreset(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-green-800"
                >
                  {CANCEL_PRESETS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Additional details (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Provide more details if needed..."
                  value={cancelReasonCustom}
                  onChange={(e) => setCancelReasonCustom(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:border-green-800 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-700 hover:bg-red-800 text-white disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST REFUND MODAL */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-gray-900 text-base">Return / Refund Order</h3>
              <button onClick={() => setIsRefundModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Please choose your issue type, describe the condition, and attach a photo of the produce as proof.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Return / Refund Type *</label>
                <select 
                  value={refundReasonPreset}
                  onChange={(e) => setRefundReasonPreset(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-green-800"
                >
                  {REFUND_PRESETS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reason & Issue Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the condition of items received, defects, or missing quantities..."
                  value={refundDetails}
                  onChange={(e) => setRefundDetails(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:border-green-800 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Photo Proof</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => setRefundProofFile(e.target.files?.[0] || null)}
                  className="text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-800"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-600 flex justify-between items-center">
                <span>Eligible Refund Amount:</span>
                <span className="font-semibold text-gray-900 text-sm tabular-nums">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isSubmittingRefund}
                onClick={() => setIsRefundModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingRefund}
                onClick={handleRefundSubmit}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-green-800 hover:bg-green-900 text-white disabled:opacity-50"
              >
                {isSubmittingRefund ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
