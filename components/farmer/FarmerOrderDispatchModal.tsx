'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';

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

  if (!isOpen || !order) return null;

  const recipientName = order.address?.fullName || order.buyer.name;
  const recipientPhone = order.address?.phone || order.buyer.phone || '';
  const sanitizedPhone = recipientPhone.replace(/[^0-9+]/g, '');

  const googleMapsQuery = encodeURIComponent(
    `${order.address.street}, ${order.address.barangay}, Agoo, La Union, Philippines`
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

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-outline-variant/30 transition-transform duration-300 print:shadow-none print:border-none print:max-h-none print:w-full print:m-0 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Top Header - Hidden in Print */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-surface-variant bg-surface-container/40 print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">local_shipping</span>
            <h2 className="font-['Manrope'] font-bold text-[18px] sm:text-[20px] text-primary">
              Delivery Dispatch & Waybill
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container-high hover:bg-surface-container text-on-surface transition-colors"
              title="Print Delivery Slip"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Print Slip
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-6 custom-scrollbar print:overflow-visible print:p-0">
          
          {/* Printable Waybill Header (Visible in print or screen) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-variant">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold uppercase tracking-widest text-secondary font-mono">
                  Order Waybill
                </span>
                <span className="text-xs text-on-surface-variant">•</span>
                <span className="font-mono text-sm font-bold text-on-surface">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy • h:mm a')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-surface-variant text-on-surface-variant">
                Status: {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Cash Collection Reconciliation Banner */}
          {isPaid ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-start gap-3">
              <span
                className="material-symbols-outlined text-emerald-600 text-[24px] shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <div>
                <p className="font-bold text-sm sm:text-base leading-tight">
                  ✓ PAID ONLINE VIA GCASH — DO NOT COLLECT CASH
                </p>
                <p className="text-xs text-emerald-800 mt-1">
                  Payment has already been secured online. Release the produce to the customer without collecting any money.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-950 flex items-start gap-3 shadow-sm">
              <span
                className="material-symbols-outlined text-amber-700 text-[26px] shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                payments
              </span>
              <div>
                <p className="font-black text-sm sm:text-base tracking-tight text-amber-900">
                  💵 CASH ON DELIVERY (COD) — COLLECT ₱{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UPON DELIVERY
                </p>
                <p className="text-xs text-amber-800 font-medium mt-1">
                  Collect the exact grand total from the buyer before handing over the harvest package.
                </p>
              </div>
            </div>
          )}

          {/* Recipient & Contact Section */}
          <div className="p-4 sm:p-5 bg-surface-container rounded-xl border border-surface-variant flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">person</span>
                Recipient Information
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-surface-container-high text-on-surface">
                Barangay {order.address.barangay}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-base sm:text-lg font-bold text-on-surface leading-snug">
                  {recipientName}
                </p>
                {recipientPhone ? (
                  <p className="text-sm font-semibold text-primary font-mono mt-0.5">
                    {recipientPhone}
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant italic">No phone number recorded</p>
                )}
                {order.buyer.name !== recipientName && (
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Ordered by: {order.buyer.name}
                  </p>
                )}
              </div>

              {/* Direct Call and SMS Actions - Hidden in Print */}
              {sanitizedPhone && (
                <div className="flex items-center gap-2 print:hidden">
                  <a
                    href={`tel:${sanitizedPhone}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    Call Buyer
                  </a>
                  <a
                    href={`sms:${sanitizedPhone}?body=${encodeURIComponent(
                      `Hello ${recipientName}, this is your FarmFlow farmer regarding Order #${order.id.slice(0, 8).toUpperCase()}.`
                    )}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-semibold text-xs hover:opacity-90 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">sms</span>
                    Text / SMS
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address & Navigation */}
          <div className="p-4 sm:p-5 bg-surface-container-lowest rounded-xl border border-outline-variant/40 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                Delivery Destination
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="print:hidden inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline"
              >
                <span className="material-symbols-outlined text-[16px]">explore</span>
                Open in Google Maps
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm sm:text-base font-semibold text-on-surface leading-relaxed">
                {order.address.street}
              </p>
              <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
                Barangay {order.address.barangay}, {order.address.city || 'Agoo'}, {order.address.province || 'La Union'} {order.address.zipCode ? `(${order.address.zipCode})` : ''}
              </p>
            </div>

            {/* Special Instructions / Landmarks */}
            {order.notes ? (
              <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                <span
                  className="material-symbols-outlined text-amber-700 text-[20px] shrink-0 mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  pin_drop
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                    Customer Landmark & Delivery Notes:
                  </span>
                  <p className="text-xs sm:text-sm text-amber-950 font-semibold mt-0.5">
                    &ldquo;{order.notes}&rdquo;
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant italic">
                No special landmarks or instructions provided.
              </p>
            )}

            {/* Turn-by-Turn GPS Button - Mobile thumb optimized */}
            <div className="pt-2 print:hidden">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl border border-secondary text-secondary hover:bg-secondary-container/20 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-[18px]">near_me</span>
                Start GPS Navigation to {order.address.barangay}
              </a>
            </div>
          </div>

          {/* Harvest Packing Checklist */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Harvest Items to Prepare ({order.items.length})
              </h3>
              <span className="text-[11px] text-on-surface-variant">Check items as you pack</span>
            </div>

            <div className="divide-y divide-surface-variant border border-surface-variant rounded-xl overflow-hidden bg-surface-container-lowest">
              {order.items.map((item) => (
                <div key={item.id} className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container relative overflow-hidden shrink-0 border border-surface-variant">
                    {item.product.photos && item.product.photos[0] ? (
                      <Image
                        src={item.product.photos[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-outline">
                        <span className="material-symbols-outlined text-[18px]">spa</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-on-surface truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      ₱{item.pricePerKg.toFixed(2)} / kg
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-container font-black text-xs font-mono">
                      {item.quantityKg} kg
                    </span>
                    <p className="text-xs font-bold text-on-surface mt-1">
                      ₱{item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-xl bg-surface-container flex flex-col gap-2 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-on-surface">
                  ₱{(order.totalAmount - (order.deliveryFee || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Logistics Fee:</span>
                <span className="font-semibold text-on-surface">
                  ₱{(order.deliveryFee || 50).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-surface-variant text-sm font-bold text-primary">
                <span>Total Amount:</span>
                <span className="text-base font-black">
                  ₱{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Printable Waybill Sign-off (Visible primarily in print) */}
          <div className="hidden print:block pt-8 mt-4 border-t-2 border-dashed border-gray-400">
            <div className="grid grid-cols-2 gap-8 text-xs text-gray-700">
              <div>
                <p className="font-bold">Dispatched by Farmer / Courier:</p>
                <div className="mt-8 border-b border-gray-500 w-48"></div>
                <p className="mt-1">Signature over printed name</p>
              </div>
              <div>
                <p className="font-bold">Received in good order by Customer:</p>
                <div className="mt-8 border-b border-gray-500 w-48"></div>
                <p className="mt-1">Signature over printed name / Date</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-6 text-center">
              FarmFlow Agoo Agricultural Operations & Logistics • Verified Delivery Slip
            </p>
          </div>

        </div>

        {/* Modal Footer Actions - Hidden in Print */}
        <div className="px-6 py-4 border-t border-surface-variant bg-surface-container/50 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <button
            onClick={onClose}
            type="button"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-variant font-semibold text-xs transition-colors"
          >
            Close
          </button>

          {nextAction.label && onUpdateStatus && (
            <button
              disabled={isUpdatingStatus}
              onClick={() => onUpdateStatus(order.id, order.orderStatus)}
              type="button"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isUpdatingStatus ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">check</span>
              )}
              {nextAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
