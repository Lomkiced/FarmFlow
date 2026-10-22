'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import type { OrderStatus, PaymentStatus } from '@prisma/client';
import toast from 'react-hot-toast';
import { cancelOrderAction, requestOrderRefundAction } from '@/app/actions/orders';
import { uploadRefundProof } from '@/app/actions/upload';
import { formatQuantity } from '@/lib/utils';
import OrderTrackingModal from './OrderTrackingModal';

export interface OrderItemProp {
  id: string;
  product: {
    name: string;
    photos: string[];
    farm: { farmName: string };
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

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  READY: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
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
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container/30">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] uppercase font-bold text-on-surface-variant tracking-wider">Order #{order.id.slice(0, 8)}</span>
              {order.isContract && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">event_repeat</span>
                  Wholesale Contract
                </span>
              )}
              {order.refundStatus && order.refundStatus !== 'NONE' && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  order.refundStatus === 'REQUESTED' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  order.refundStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                  'bg-rose-100 text-rose-900 border border-rose-300'
                }`}>
                  Return/Refund {order.refundStatus.toLowerCase()}
                </span>
              )}
            </div>
            <span className="text-xs text-on-surface-variant mt-0.5">Placed {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider border ${statusColors[order.orderStatus]}`}>
              {statusLabels[order.orderStatus]}
            </span>
            {order.orderStatus !== 'CANCELLED' && (
              <div className="w-32 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* WHOLESALE CONTRACT PROGRESS BANNER */}
        {order.isContract && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-700 text-[20px]">calendar_month</span>
              <div>
                <span className="font-bold text-emerald-900">Weekly Fulfillment:</span> {order.deliveryScheduleDay || 'Every Saturday'}
                <span className="mx-2 text-emerald-400">•</span>
                <span className="font-bold text-emerald-900">Batches Delivered:</span> {order.deliveriesCompleted ?? 0} of {order.contractWeeks ?? 1} Completed
              </div>
            </div>
            {order.nextDeliveryDate && order.orderStatus !== 'DELIVERED' && (order.orderStatus as any) !== 'COMPLETED' && (
              <div className="bg-white/90 text-emerald-800 font-semibold px-2.5 py-1 rounded-md border border-emerald-300 text-[11px] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">schedule</span>
                Next Batch: {format(new Date(order.nextDeliveryDate), 'EEE, MMM d, yyyy')}
              </div>
            )}
          </div>
        )}

        {/* CANCELLATION NOTICE BANNER */}
        {order.orderStatus === 'CANCELLED' && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 flex items-start gap-2.5 text-xs text-rose-900">
            <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-0.5">cancel</span>
            <div>
              <p className="font-bold">Order Cancelled {order.cancelledBy ? `by ${order.cancelledBy.toLowerCase()}` : ''}</p>
              {order.cancelReason && <p className="text-rose-800 mt-0.5">Reason: "{order.cancelReason}"</p>}
              {order.cancelledAt && (
                <p className="text-rose-700/80 text-[11px] mt-0.5">
                  Cancelled {format(new Date(order.cancelledAt), 'MMM d, yyyy h:mm a')} • Stock has been restored
                </p>
              )}
            </div>
          </div>
        )}

        {/* REFUND STATUS BANNER */}
        {order.refundStatus && order.refundStatus !== 'NONE' && (
          <div className={`px-6 py-3 border-b flex items-start gap-2.5 text-xs ${
            order.refundStatus === 'REQUESTED' ? 'bg-amber-50 border-amber-200 text-amber-900' :
            order.refundStatus === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
            'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
              {order.refundStatus === 'REQUESTED' ? 'hourglass_top' : order.refundStatus === 'APPROVED' ? 'verified' : 'error'}
            </span>
            <div className="flex-1">
              <p className="font-bold">
                {order.refundStatus === 'REQUESTED' && 'Return / Refund Request Under Review'}
                {order.refundStatus === 'APPROVED' && 'Return / Refund Approved & Processed'}
                {order.refundStatus === 'REJECTED' && 'Return / Refund Request Declined'}
              </p>
              {order.refundReason && <p className="mt-0.5">Reason: {order.refundReason}</p>}
              {order.refundAdminNote && <p className="font-medium mt-0.5">Reviewer note: "{order.refundAdminNote}"</p>}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="p-6 flex flex-col gap-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 items-start">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-variant shrink-0 border border-outline-variant group">
                {item.product.photos && item.product.photos.length > 0 ? (
                  <Image src={item.product.photos[0]} alt={item.product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined">image</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <h4 className="font-display font-bold text-lg text-on-surface line-clamp-1">{item.product.name}</h4>
                  <span className="font-bold text-on-surface shrink-0">{formatCurrency(item.subtotal)}</span>
                </div>
                <span className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[16px]">storefront</span>
                  {item.product.farm.farmName}
                </span>
                <span className="text-sm text-on-surface-variant mt-2 font-medium">
                  {formatQuantity(item.quantityKg, 'kg')} &times; {formatCurrency(item.pricePerKg)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-surface-variant bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex flex-col">
              <span className="text-xs text-on-surface-variant">Order Total</span>
              <span className="font-display font-black text-2xl text-primary">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 w-full sm:w-auto justify-end">
            {canCancel && (
              <button 
                onClick={() => setIsCancelModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors"
              >
                Cancel Order
              </button>
            )}

            {canRequestRefund && (
              <button 
                onClick={() => setIsRefundModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-amber-300 text-amber-800 hover:bg-amber-50 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">assignment_return</span>
                Return / Refund Order
              </button>
            )}

            <button 
              onClick={() => setIsTrackingModalOpen(true)}
              className="px-5 py-2 rounded-xl text-xs font-bold border-2 border-outline-variant text-on-surface hover:border-primary hover:text-primary transition-colors"
            >
              Track Order
            </button>
          </div>
        </div>
      </div>

      <OrderTrackingModal 
        isOpen={isTrackingModalOpen} 
        onClose={() => setIsTrackingModalOpen(false)} 
        order={order}
      />

      {/* CANCEL ORDER MODAL */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600">
                <span className="material-symbols-outlined text-[24px]">cancel</span>
                <h3 className="font-bold text-gray-900 text-lg">Cancel Order #{order.id.slice(0, 8)}</h3>
              </div>
              <button onClick={() => setIsCancelModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Are you sure you want to cancel this order? Stock will be immediately restored to the farmer's inventory.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for cancellation *</label>
                <select 
                  value={cancelReasonPreset}
                  onChange={(e) => setCancelReasonPreset(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-rose-500"
                >
                  {CANCEL_PRESETS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Additional details (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Provide more details if needed..."
                  value={cancelReasonCustom}
                  onChange={(e) => setCancelReasonCustom(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:border-rose-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST REFUND / RETURN MODAL */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-amber-700">
                <span className="material-symbols-outlined text-[24px]">assignment_return</span>
                <h3 className="font-bold text-gray-900 text-lg">Return / Refund Order</h3>
              </div>
              <button onClick={() => setIsRefundModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Delivered produce issues must be reported promptly. Please choose your issue type, describe the problem, and attach a clear photo of the delivered produce as proof.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Return / Refund Type *</label>
                <select 
                  value={refundReasonPreset}
                  onChange={(e) => setRefundReasonPreset(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-primary"
                >
                  {REFUND_PRESETS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason & Issue Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the condition of the items received, defects, spoiled produce, or missing quantities..."
                  value={refundDetails}
                  onChange={(e) => setRefundDetails(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Photo Proof (Produce condition / Package label)</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => setRefundProofFile(e.target.files?.[0] || null)}
                  className="text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
                {refundProofFile && (
                  <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Selected: {refundProofFile.name} ({(refundProofFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-600 flex justify-between items-center">
                <span>Eligible Refund Amount:</span>
                <span className="font-bold text-gray-900 text-sm">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={isSubmittingRefund}
                onClick={() => setIsRefundModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingRefund}
                onClick={handleRefundSubmit}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-on-primary flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSubmittingRefund ? 'Submitting...' : 'Submit Return / Refund Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
