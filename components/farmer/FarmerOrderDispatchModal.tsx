'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { formatQuantity } from '@/lib/utils';
import {
  COURIER_PRESETS,
  resolveOrderLogistics,
} from '@/lib/logistics-utils';
import {
  dispatchOrderWithLogisticsAction,
  pushLiveLogisticsCheckpointAction,
} from '@/app/actions/orders';
import { uploadRefundProof } from '@/app/actions/upload';

export interface DispatchOrderItem {
  id: string;
  quantityKg: number;
  pricePerKg: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    photos: string[];
    category?: string;
  };
}

export interface DispatchOrder {
  id: string;
  buyer: {
    name: string;
    email: string;
    phone: string | null;
  };
  address: {
    id?: string;
    fullName: string;
    phone: string;
    street: string;
    barangay: string;
    city: string;
    province: string;
    zipCode?: string | null;
  };
  items: DispatchOrderItem[];
  totalAmount: number;
  deliveryFee: number;
  orderStatus: string;
  paymentStatus: string;
  paymentRef?: string | null;
  notes?: string | null;
  createdAt: Date | string;
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
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: DispatchOrder | null;
  onUpdateStatus?: (orderId: string, currentStatus: string) => void;
  isUpdatingStatus?: boolean;
}

export default function FarmerOrderDispatchModal({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
  isUpdatingStatus = false,
}: Props) {
  const router = useRouter();
  const [courierName, setCourierName] = useState<string>(COURIER_PRESETS[0].courierName);
  const [driverName, setDriverName] = useState<string>(COURIER_PRESETS[0].driverName);
  const [driverPhone, setDriverPhone] = useState<string>(COURIER_PRESETS[0].driverPhone);
  const [vehicleInfo, setVehicleInfo] = useState<string>(COURIER_PRESETS[0].vehicleInfo);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>(COURIER_PRESETS[0].estimatedDelivery);
  const [isSavingLogistics, setIsSavingLogistics] = useState(false);
  const [pushingStage, setPushingStage] = useState<string | null>(null);
  const [podFile, setPodFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (order) {
      const resolved = resolveOrderLogistics(order);
      setCourierName(resolved.courierName);
      setDriverName(resolved.driverName);
      setDriverPhone(resolved.driverPhone);
      setVehicleInfo(resolved.vehicleInfo);
      setEstimatedDelivery(resolved.estimatedDelivery);
      setPodFile(null);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const logistics = resolveOrderLogistics(order);
  const recipientName = order.address?.fullName || order.buyer.name;
  const recipientPhone = order.address?.phone || order.buyer.phone || '';
  const sanitizedPhone = recipientPhone.replace(/[^0-9+]/g, '');

  const googleMapsQuery = encodeURIComponent(
    `${order.address.street}, ${order.address.barangay}, ${order.address.city || 'Agoo'}, La Union, Philippines`
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${googleMapsQuery}`;

  const isPaid = order.paymentStatus === 'PAID';

  let nextAction = { label: '', newStatus: '' };
  if (order.orderStatus === 'PENDING') {
    nextAction = { label: 'Confirm Order', newStatus: 'CONFIRMED' };
  } else if (order.orderStatus === 'CONFIRMED') {
    nextAction = { label: 'Mark as Ready for Delivery', newStatus: 'READY' };
  } else if (order.orderStatus === 'READY') {
    nextAction = { label: 'Mark as Delivered', newStatus: 'DELIVERED' };
  }

  const handlePrint = () => {
    window.print();
  };

  const handleAutoAssignExpressRider = () => {
    const preset = COURIER_PRESETS[0];
    setCourierName(preset.courierName);
    setDriverName(preset.driverName);
    setDriverPhone(preset.driverPhone);
    setVehicleInfo(preset.vehicleInfo);
    setEstimatedDelivery(preset.estimatedDelivery);
    toast.success('Auto-assigned FarmFlow Express Rider');
  };

  const handleCourierPresetChange = (selectedCourier: string) => {
    setCourierName(selectedCourier);
    const preset = COURIER_PRESETS.find((c) => c.courierName === selectedCourier);
    if (preset) {
      setDriverName(preset.driverName);
      setDriverPhone(preset.driverPhone);
      setVehicleInfo(preset.vehicleInfo);
      setEstimatedDelivery(preset.estimatedDelivery);
    }
  };

  const handleSaveAndDispatchLogistics = async () => {
    setIsSavingLogistics(true);
    const toastId = toast.loading('Assigning courier & updating tracking...');
    try {
      const res = await dispatchOrderWithLogisticsAction({
        orderId: order.id,
        courierName,
        driverName,
        driverPhone,
        vehicleInfo,
        estimatedDelivery,
        advanceToStatus:
          order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED'
            ? 'READY'
            : undefined,
      });
      if (res.success) {
        toast.success(
          `Rider assigned. Tracking #: ${(res.data?.trackingNumber as string) || logistics.trackingNumber}`,
          { id: toastId }
        );
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to save dispatch details.', { id: toastId });
      }
    } catch (e: any) {
      toast.error(e?.message || 'An error occurred.', { id: toastId });
    } finally {
      setIsSavingLogistics(false);
    }
  };

  const handlePushLiveCheckpoint = async (
    checkpointStage:
      | 'HARVESTED_QC'
      | 'DEPARTED_HUB'
      | 'ARRIVED_MUNICIPALITY'
      | 'OUT_FOR_DELIVERY_NEARBY'
      | 'DELIVERED_POD'
  ) => {
    setPushingStage(checkpointStage);
    const toastId = toast.loading('Updating logistics checkpoint...');
    try {
      let proofUrl: string | undefined = undefined;
      if (checkpointStage === 'DELIVERED_POD') {
        if (podFile) {
          const formData = new FormData();
          formData.append('file', podFile);
          const up = await uploadRefundProof(formData);
          if (up.success && 'url' in up) {
            proofUrl = up.url as string;
          }
        } else {
          proofUrl =
            order.items[0]?.product?.photos?.[0] ||
            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80';
        }
      }

      const res = await pushLiveLogisticsCheckpointAction({
        orderId: order.id,
        checkpointKey: checkpointStage,
        proofOfDeliveryUrl: proofUrl,
      });

      if (res.success) {
        toast.success(res.message || 'Checkpoint updated.', { id: toastId });
        router.refresh();
        if (checkpointStage === 'DELIVERED_POD') {
          onClose();
        }
      } else {
        toast.error(res.error || 'Failed to push checkpoint.', { id: toastId });
      }
    } catch (e: any) {
      toast.error(e?.message || 'An error occurred.', { id: toastId });
    } finally {
      setPushingStage(null);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-3xl bg-white rounded-xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden border border-gray-200 transition-transform duration-300 print:shadow-none print:border-none print:max-h-none print:w-full print:m-0 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Top Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-gray-50 print:hidden">
          <div>
            <h2 className="font-semibold text-base sm:text-lg text-gray-900 leading-tight">
              Delivery Dispatch & Waybill
            </h2>
            <p className="text-xs font-mono text-gray-500">
              Tracking #: <strong className="text-green-800">{logistics.trackingNumber}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors"
            >
              Print Slip
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-5 custom-scrollbar print:overflow-visible print:p-0">
          {/* Printable Waybill Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Waybill
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="font-mono text-xs font-semibold text-gray-900">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="font-mono text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                  {logistics.trackingNumber}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy • h:mm a')}
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider bg-gray-100 text-gray-700 self-start sm:self-auto">
              {order.orderStatus}
            </span>
          </div>

          {/* 1. COURIER & RIDER ASSIGNMENT */}
          {order.orderStatus !== 'CANCELLED' && (
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-3 print:hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Step 1: Courier & Vehicle Assignment
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAutoAssignExpressRider}
                  className="px-3 py-1 rounded bg-green-800 hover:bg-green-900 text-white text-xs font-medium transition-colors"
                >
                  Auto-Assign Rider
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Courier / Delivery Mode</label>
                  <select
                    value={courierName}
                    onChange={(e) => handleCourierPresetChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-green-800"
                  >
                    {COURIER_PRESETS.map((preset) => (
                      <option key={preset.courierName} value={preset.courierName}>
                        {preset.courierName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Estimated Window</label>
                  <input
                    type="text"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    placeholder="Today, 2:00 PM - 4:00 PM"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-green-800"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Driver Full Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Kuya Bong Navarro"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-green-800"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Driver Contact Phone</label>
                  <input
                    type="text"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="0917-842-9910"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-gray-900 outline-none focus:border-green-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-gray-700 mb-1">Vehicle & Plate Number</label>
                  <input
                    type="text"
                    value={vehicleInfo}
                    onChange={(e) => setVehicleInfo(e.target.value)}
                    placeholder="White Mitsubishi L300 Reefer Van • Plate: NGA-4821"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-gray-900 outline-none focus:border-green-800"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={isSavingLogistics}
                  onClick={handleSaveAndDispatchLogistics}
                  className="px-4 py-2 rounded-lg bg-green-800 hover:bg-green-900 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isSavingLogistics
                    ? 'Saving...'
                    : order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED'
                      ? 'Save & Mark Ready'
                      : 'Update Courier Info'}
                </button>
              </div>
            </div>
          )}

          {/* 2. LIVE TRACKING CHECKPOINTS */}
          {order.orderStatus !== 'CANCELLED' && (
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-3 print:hidden">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Step 2: Push Logistics Checkpoint
                </h3>
                <span className="text-[11px] font-mono text-gray-500">
                  {logistics.logs.length} checkpoints recorded
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  disabled={Boolean(pushingStage)}
                  onClick={() => handlePushLiveCheckpoint('HARVESTED_QC')}
                  className="p-2.5 rounded-lg bg-white hover:bg-green-50/60 border border-gray-200 hover:border-green-300 text-left transition-colors disabled:opacity-50"
                >
                  <p className="font-semibold text-gray-900">Harvested & Packed</p>
                  <p className="text-[11px] text-gray-500">Passed quality & weight inspection</p>
                </button>

                <button
                  type="button"
                  disabled={Boolean(pushingStage)}
                  onClick={() => handlePushLiveCheckpoint('DEPARTED_HUB')}
                  className="p-2.5 rounded-lg bg-white hover:bg-green-50/60 border border-gray-200 hover:border-green-300 text-left transition-colors disabled:opacity-50"
                >
                  <p className="font-semibold text-gray-900">Departed Farm Hub</p>
                  <p className="text-[11px] text-gray-500">Left consolidation hub</p>
                </button>

                <button
                  type="button"
                  disabled={Boolean(pushingStage)}
                  onClick={() => handlePushLiveCheckpoint('ARRIVED_MUNICIPALITY')}
                  className="p-2.5 rounded-lg bg-white hover:bg-green-50/60 border border-gray-200 hover:border-green-300 text-left transition-colors disabled:opacity-50"
                >
                  <p className="font-semibold text-gray-900">
                    Arrived in {order.address?.city || 'Destination'}
                  </p>
                  <p className="text-[11px] text-gray-500">Sorting for last-mile delivery</p>
                </button>

                <button
                  type="button"
                  disabled={Boolean(pushingStage)}
                  onClick={() => handlePushLiveCheckpoint('OUT_FOR_DELIVERY_NEARBY')}
                  className="p-2.5 rounded-lg bg-white hover:bg-green-50/60 border border-gray-200 hover:border-green-300 text-left transition-colors disabled:opacity-50"
                >
                  <p className="font-semibold text-gray-900">Rider Approaching Destination</p>
                  <p className="text-[11px] text-gray-500">
                    Nearby Brgy. {order.address?.barangay}
                  </p>
                </button>
              </div>

              {/* Proof of Delivery Photo Upload */}
              <div className="pt-2 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    Proof of Delivery Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPodFile(e.target.files?.[0] || null)}
                    className="text-xs text-gray-600 file:mr-2.5 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-800"
                  />
                </div>
                <button
                  type="button"
                  disabled={Boolean(pushingStage)}
                  onClick={() => handlePushLiveCheckpoint('DELIVERED_POD')}
                  className="px-4 py-2 rounded-lg bg-green-800 hover:bg-green-900 text-white font-semibold text-xs shrink-0 transition-colors disabled:opacity-50"
                >
                  Mark Delivered + Upload POD
                </button>
              </div>
            </div>
          )}

          {/* Payment Banner */}
          {isPaid ? (
            <div className="p-3.5 rounded-lg bg-green-50/70 border border-green-200 text-green-900 text-xs">
              <p className="font-semibold">
                PAID ONLINE VIA GCASH — DO NOT COLLECT CASH
              </p>
              <p className="text-gray-600 mt-0.5">
                Payment is secured in FarmFlow Escrow. Release produce without collecting cash.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 text-xs">
              <p className="font-semibold">
                CASH ON DELIVERY (COD) — COLLECT ₱
                {order.totalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                UPON DELIVERY
              </p>
              <p className="text-gray-600 mt-0.5">
                Collect exact total from buyer before handing over harvest package.
              </p>
            </div>
          )}

          {/* Recipient Section */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-gray-500">
                Recipient Details
              </span>
              <span className="text-gray-500">
                Brgy. {order.address.barangay}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {recipientName}
                </p>
                {recipientPhone ? (
                  <p className="text-xs font-mono text-gray-600 mt-0.5">
                    {recipientPhone}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic">No phone number</p>
                )}
              </div>

              {sanitizedPhone && (
                <div className="flex items-center gap-2 print:hidden">
                  <a
                    href={`tel:${sanitizedPhone}`}
                    className="px-3 py-1.5 rounded-lg bg-green-800 text-white font-medium text-xs hover:bg-green-900 transition-colors"
                  >
                    Call Buyer
                  </a>
                  <a
                    href={`sms:${sanitizedPhone}`}
                    className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium text-xs hover:bg-gray-50 transition-colors"
                  >
                    SMS
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Destination */}
          <div className="p-4 bg-white rounded-lg border border-gray-200 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-gray-500">
                Delivery Address
              </span>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="print:hidden text-xs font-medium text-green-800 hover:underline"
              >
                Open in Maps →
              </a>
            </div>

            <p className="text-xs text-gray-900 font-medium">
              {order.address.street}, Brgy. {order.address.barangay}, {order.address.city || 'Agoo'}, {order.address.province || 'La Union'}
            </p>

            {order.notes && (
              <p className="text-xs text-gray-600 italic bg-gray-50 p-2 rounded border border-gray-100">
                Landmark Note: &ldquo;{order.notes}&rdquo;
              </p>
            )}
          </div>

          {/* Harvest Checklist */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Harvest Items to Prepare ({order.items.length})
            </h3>

            <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
              {order.items.map((item) => (
                <div key={item.id} className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-gray-100 relative overflow-hidden shrink-0 border border-gray-200">
                    {item.product.photos && item.product.photos[0] ? (
                      <Image
                        src={item.product.photos[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                        Item
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      ₱{item.pricePerKg.toFixed(2)} / kg
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-medium text-gray-700">
                      {formatQuantity(item.quantityKg, 'kg')}
                    </span>
                    <p className="text-xs font-semibold text-gray-900 tabular-nums">
                      ₱{item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex flex-col gap-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-medium text-gray-900 tabular-nums">
                  ₱{(order.totalAmount - (order.deliveryFee || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span className="font-medium text-gray-900 tabular-nums">
                  ₱{(order.deliveryFee || 50).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-gray-200 font-semibold text-gray-900">
                <span>Total Amount:</span>
                <span className="text-green-800 tabular-nums">
                  ₱{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <button
            onClick={onClose}
            type="button"
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium text-xs transition-colors"
          >
            Close
          </button>

          {nextAction.label && onUpdateStatus && (
            <button
              disabled={isUpdatingStatus}
              onClick={() => onUpdateStatus(order.id, order.orderStatus)}
              type="button"
              className="w-full sm:w-auto px-5 py-2 rounded-lg bg-green-800 hover:bg-green-900 text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {isUpdatingStatus ? 'Updating...' : nextAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
