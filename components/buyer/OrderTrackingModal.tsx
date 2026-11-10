'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import type { OrderStatus, PaymentStatus } from '@prisma/client';
import { formatQuantity } from '@/lib/utils';
import { resolveOrderLogistics } from '@/lib/logistics-utils';
import toast from 'react-hot-toast';
import type { OrderItemProp } from './OrderCard';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    createdAt: Date | string;
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
    items: OrderItemProp[];
    cancelReason?: string | null;
    cancelledBy?: string | null;
    cancelledAt?: Date | string | null;
    refundStatus?: string | null;
    refundReason?: string | null;
    refundDetails?: string | null;
    refundAmount?: number | null;
    refundAdminNote?: string | null;
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

export default function OrderTrackingModal({ isOpen, onClose, order }: OrderTrackingModalProps) {
  const [isRendered, setIsRendered] = useState(false);
  const [previewPodUrl, setPreviewPodUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setIsRendered(false), 300);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isRendered && !isOpen) return null;

  const logistics = resolveOrderLogistics(order);
  const sanitizedDriverPhone = logistics.driverPhone.replace(/[^0-9+]/g, '');

  const routeProgress =
    order.orderStatus === 'CANCELLED'
      ? 0
      : order.orderStatus === 'PENDING'
      ? 20
      : order.orderStatus === 'CONFIRMED'
      ? 45
      : order.orderStatus === 'READY'
      ? 75
      : 100;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(logistics.trackingNumber);
    toast.success(`Tracking # ${logistics.trackingNumber} copied!`);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-2xl bg-white rounded-xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden transition-transform duration-300 border border-gray-200 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Top Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="font-semibold text-base sm:text-lg text-gray-900">
              Live Delivery & Logistics Tracker
            </h2>
            <p className="text-xs text-gray-500 font-mono">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 flex flex-col gap-5">
          {/* VISUAL ROUTE BANNER */}
          <div className="rounded-xl bg-green-900 text-white p-5 border border-green-800 relative">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider bg-white/10 text-white border border-white/20">
                  {order.buyerConfirmedAt
                    ? 'Order Completed'
                    : order.orderStatus === 'DELIVERED'
                    ? 'Delivered'
                    : order.orderStatus === 'READY'
                    ? 'In Transit'
                    : order.orderStatus === 'CONFIRMED'
                    ? 'Harvesting & Packing'
                    : order.orderStatus}
                </span>
                <span className="text-xs text-green-100 font-medium">
                  ETA: <strong className="text-white">{logistics.estimatedDelivery}</strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-green-100">{logistics.trackingNumber}</span>
                <button
                  type="button"
                  onClick={handleCopyTracking}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[11px] font-medium text-white transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Route Progress Bar */}
            <div className="relative pt-2 pb-2">
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 transition-all duration-500 rounded-full"
                  style={{ width: `${routeProgress}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-green-300 font-medium">
                    Origin Farm
                  </div>
                  <div className="font-semibold text-white truncate">{logistics.farmName}</div>
                  <div className="text-[11px] text-green-200/80 truncate">
                    Brgy. {logistics.farmBarangay}, Agoo
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-green-300 font-medium">
                    Sorting Hub
                  </div>
                  <div className="font-semibold text-white truncate">La Union Agri-Hub</div>
                  <div className="text-[11px] text-green-200/80 truncate">Cold-Chain QC</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-green-300 font-medium">
                    Destination
                  </div>
                  <div className="font-semibold text-white truncate">
                    Brgy. {logistics.buyerBarangay}
                  </div>
                  <div className="text-[11px] text-green-200/80 truncate">
                    {logistics.buyerCity}, La Union
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIDER & COURIER CARD */}
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm sm:text-base text-gray-900">
                  {logistics.driverName}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider bg-white border border-gray-300 text-gray-700">
                  {logistics.courierName}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-800">
                  {logistics.vehicleInfo}
                </span>
                <span>•</span>
                <span className="text-green-800 font-medium">Cold-Chain Protected</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`tel:${sanitizedDriverPhone}`}
                className="px-3.5 py-1.5 rounded-lg bg-green-800 hover:bg-green-900 text-white text-xs font-medium transition-colors"
              >
                Call Rider
              </a>
              <a
                href={`sms:${sanitizedDriverPhone}`}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium transition-colors"
              >
                Message
              </a>
            </div>
          </div>

          {/* VERTICAL REVERSE-CHRONOLOGICAL LOGISTICS TIMELINE */}
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="font-semibold text-xs text-gray-900 uppercase tracking-wider">
                Logistics Checkpoints
              </h3>
              <span className="text-[11px] text-green-800 font-medium">
                Escrow Protected
              </span>
            </div>

            <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
              {logistics.logs.map((log, idx) => {
                const isLatest = idx === 0;
                const logDate = new Date(log.timestamp);
                const podUrl =
                  log.proofPhotoUrl ||
                  (log.status === 'DELIVERED' ? order.proofOfDeliveryUrl : null);

                return (
                  <div key={log.id || idx} className="relative">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full ${
                        isLatest ? 'bg-green-800 ring-4 ring-green-100' : 'bg-gray-300'
                      }`}
                    />

                    <div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold ${
                            isLatest ? 'text-green-900' : 'text-gray-900'
                          }`}
                        >
                          {log.title}
                        </span>
                        <span className="text-xs font-mono text-gray-400 tabular-nums">
                          {format(logDate, 'MMM d, h:mm a')}
                        </span>
                      </div>

                      <p className="text-xs mt-1 text-gray-600 leading-relaxed">
                        {log.description}
                      </p>

                      <div className="text-[11px] text-gray-500 mt-1">
                        Location: {log.location}
                      </div>

                      {podUrl && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => setPreviewPodUrl(podUrl)}
                            className="text-xs font-medium text-green-800 hover:underline"
                          >
                            View Proof of Delivery Photo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Address & Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Delivery Address
              </div>
              <div className="text-xs text-gray-900 space-y-1">
                <div className="font-semibold">
                  {order.address.fullName} • {order.address.phone}
                </div>
                <div className="text-gray-600">
                  {order.address.street}, Brgy. {order.address.barangay}
                </div>
                <div className="text-gray-600">
                  {order.address.city}, {order.address.province}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Package Summary ({order.items.length})
              </div>
              <div className="space-y-2 max-h-28 overflow-y-auto">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-800 truncate max-w-[160px]">
                      {item.product.name} ({formatQuantity(item.quantityKg, 'kg')})
                    </span>
                    <span className="font-semibold text-gray-900 tabular-nums">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-xs text-gray-600">
            Total: <strong className="text-sm text-green-800 tabular-nums">{formatCurrency(order.totalAmount)}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg font-medium bg-green-800 hover:bg-green-900 text-white transition-colors text-xs"
          >
            Done
          </button>
        </div>
      </div>

      {/* Proof of Delivery Photo Lightbox */}
      {previewPodUrl && (
        <div
          className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewPodUrl(null)}
        >
          <div
            className="bg-white rounded-xl max-w-lg w-full p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-semibold text-sm text-gray-900">Proof of Delivery Photo</span>
              <button onClick={() => setPreviewPodUrl(null)} className="text-gray-500 hover:text-gray-800">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <img
              src={previewPodUrl}
              alt="Proof of Delivery"
              className="w-full max-h-[65vh] object-contain rounded-lg bg-gray-950"
            />
          </div>
        </div>
      )}
    </div>
  );
}
