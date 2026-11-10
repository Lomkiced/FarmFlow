'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  cancelOrderAction,
  requestOrderRefundAction,
  confirmOrderReceivedAndRateAction,
} from '@/app/actions/orders';
import { uploadRefundProof } from '@/app/actions/upload';
import { formatQuantity } from '@/lib/utils';
import { resolveOrderLogistics } from '@/lib/logistics-utils';

const REFUND_PRESETS = [
  'Return & Refund - Damaged/Spoiled Produce',
  'Return & Refund - Wrong Item Delivered',
  'Partial Refund - Missing Quantity',
  'Quality Issue',
  'Other reason',
];

export default function OrderTrackingDetailClient({ order }: { order: any }) {
  const router = useRouter();
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [podLightboxUrl, setPodLightboxUrl] = useState<string | null>(null);

  // Order Received & Rate Freshness Modal State
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [freshnessRating, setFreshnessRating] = useState<number>(5);
  const [buyerReview, setBuyerReview] = useState<string>('');
  const [isConfirmingReceipt, setIsConfirmingReceipt] = useState(false);

  // Refund Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReasonPreset, setRefundReasonPreset] = useState(REFUND_PRESETS[0]);
  const [refundDetails, setRefundDetails] = useState('');
  const [refundProofFile, setRefundProofFile] = useState<File | null>(null);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  const logistics = resolveOrderLogistics(order);
  const status = order.orderStatus;
  const isCompleted = Boolean(order.buyerConfirmedAt);

  const farm = order.items?.[0]?.product?.farm;
  const farmName = farm?.farmName || 'La Union Partner Farm';
  const farmLocation =
    [farm?.barangay, farm?.location].filter(Boolean).join(', ') || 'Bacnotan, La Union';
  const buyerLocation = `${order.address?.barangay || 'Poblacion'}, ${order.address?.city || 'San Fernando City'}`;

  let routeProgress = 18;
  if (status === 'CONFIRMED') routeProgress = 45;
  if (status === 'READY') routeProgress = 76;
  if (status === 'DELIVERED') routeProgress = 100;
  if (status === 'CANCELLED') routeProgress = 0;

  const canRequestRefund =
    (status === 'DELIVERED' || status === 'COMPLETED') &&
    (!order.refundStatus || order.refundStatus === 'NONE' || order.refundStatus === 'REJECTED');
  const canConfirmReceived =
    status === 'DELIVERED' && !isCompleted && order.refundStatus !== 'APPROVED';

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(logistics.trackingNumber);
    setCopiedTracking(true);
    toast.success(`Copied Tracking #: ${logistics.trackingNumber}`);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

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

  const handleRefundSubmit = async () => {
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
        reason: refundReasonPreset,
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
    <div className="space-y-6 pb-20">
      {/* Top Breadcrumb + Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/buyer/dashboard"
            className="inline-flex items-center gap-1 text-xs font-medium text-green-800 hover:underline mb-2"
          >
            ← Back to My Orders
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            {order.isContract && (
              <span className="px-2.5 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider bg-green-50 text-green-800 border border-green-200">
                Wholesale Contract
              </span>
            )}
            {isCompleted && (
              <span className="px-2.5 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider bg-green-50 text-green-800 border border-green-200">
                Completed • Rated {order.freshnessRating || 5}/5
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy • h:mm a')} • Escrow Protected
          </p>
        </div>

        {/* Tracking Number Pill */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2 self-start md:self-auto">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Tracking Number</p>
            <p className="font-mono text-sm font-semibold text-gray-900">{logistics.trackingNumber}</p>
          </div>
          <button
            type="button"
            onClick={handleCopyTracking}
            className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
          >
            {copiedTracking ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* TOP ROUTE BANNER */}
      <div className="bg-green-900 text-white rounded-xl p-6 border border-green-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium uppercase tracking-wider bg-white/10 text-white border border-white/20">
              {status === 'PENDING' && 'Awaiting Harvest Confirmation'}
              {status === 'CONFIRMED' && 'Harvesting & Packing'}
              {status === 'READY' && 'In Transit — Out for Delivery'}
              {status === 'DELIVERED' && (isCompleted ? 'Completed' : 'Delivered to Destination')}
              {status === 'CANCELLED' && 'Order Cancelled'}
            </span>
            <span className="text-xs text-green-100 bg-white/10 px-3 py-1 rounded border border-white/10">
              ETA: <strong className="text-white">{logistics.estimatedDelivery}</strong>
            </span>
          </div>

          <div className="text-xs text-green-200">
            Courier: <strong className="text-white">{logistics.courierName}</strong>
          </div>
        </div>

        {/* 3-Node Route Visualization */}
        <div className="bg-white/10 rounded-lg p-5 border border-white/15">
          <div className="grid grid-cols-3 gap-3 text-xs mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-green-300 font-medium">Origin Farm</p>
              <p className="font-semibold text-white text-sm truncate mt-0.5">{farmName}</p>
              <p className="text-[11px] text-green-100/75 truncate">{farmLocation}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-green-300 font-medium">Sorting Hub</p>
              <p className="font-semibold text-white text-sm truncate mt-0.5">La Union Agri-Hub</p>
              <p className="text-[11px] text-green-100/75 truncate">Cold-Chain QC Passed</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-green-300 font-medium">Buyer Destination</p>
              <p className="font-semibold text-white text-sm truncate mt-0.5">{order.address?.fullName}</p>
              <p className="text-[11px] text-green-100/75 truncate">{buyerLocation}</p>
            </div>
          </div>

          <div className="relative h-2 bg-white/20 rounded-full my-4">
            <div
              className="absolute left-0 top-0 h-full bg-green-400 rounded-full transition-all duration-500"
              style={{ width: `${routeProgress}%` }}
            />
            {/* Origin Node */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-green-400 ring-2 ring-green-900" />
            {/* Hub Node */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full ring-2 ring-green-900 ${
                routeProgress >= 45 ? 'bg-green-400' : 'bg-white/40'
              }`}
            />
            {/* Destination Node */}
            <div
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full ring-2 ring-green-900 ${
                routeProgress >= 100 ? 'bg-green-400' : 'bg-white/40'
              }`}
            />
          </div>

          <div className="text-xs text-green-100/90 pt-1">
            Escrow Protected until Buyer confirms receipt
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Timeline + Order Items */}
        <div className="lg:col-span-8 space-y-6">
          {/* RIDER & COURIER CARD */}
          {status !== 'CANCELLED' && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-semibold text-gray-900">{logistics.driverName}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider bg-gray-100 text-gray-700">
                    {logistics.courierName}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-1 text-xs text-gray-600">
                  <span className="font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-200 text-gray-800">
                    {logistics.vehicleInfo}
                  </span>
                  <span>•</span>
                  <span className="text-green-800 font-medium">Cold-Chain Protected</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${logistics.driverPhone}`}
                  className="px-4 py-2 rounded-lg bg-green-800 hover:bg-green-900 text-white text-xs font-medium transition-colors"
                >
                  Call Rider
                </a>
                <a
                  href={`sms:${logistics.driverPhone}`}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium transition-colors"
                >
                  SMS
                </a>
              </div>
            </div>
          )}

          {/* VERTICAL REVERSE-CHRONOLOGICAL LOGISTICS TIMELINE */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Logistics & Parcel Checkpoints
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Farm-to-table updates from {farmName}
                </p>
              </div>
              <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded">
                {logistics.logs.length} Checkpoints
              </span>
            </div>

            <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
              {logistics.logs.map((log, index) => {
                const isLatest = index === 0;
                const ts = new Date(log.timestamp);

                return (
                  <div key={log.id} className="relative">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full ${
                        isLatest
                          ? status === 'CANCELLED'
                            ? 'bg-red-700 ring-4 ring-red-100'
                            : 'bg-green-800 ring-4 ring-green-100'
                          : 'bg-gray-300'
                      }`}
                    />

                    <div
                      className={`rounded-lg p-4 border transition-all ${
                        isLatest
                          ? status === 'CANCELLED'
                            ? 'bg-red-50/60 border-red-200'
                            : 'bg-green-50/50 border-green-200'
                          : 'bg-gray-50/50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-sm font-semibold ${isLatest ? 'text-gray-900' : 'text-gray-800'}`}>
                            {log.title}
                          </h4>
                          {log.badge && (
                            <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700">
                              {log.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-gray-500 tabular-nums">
                          {format(ts, 'MMM d, h:mm a')}
                        </span>
                      </div>

                      <p className="text-xs mt-1 leading-relaxed text-gray-600">
                        {log.description}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-2 text-[11px] text-gray-500">
                        <span>Location: {log.location}</span>
                        {log.actor && <span>Updated by {log.actor}</span>}
                      </div>

                      {/* Proof of Delivery Photo inside Delivered log */}
                      {log.status === 'DELIVERED' && logistics.proofOfDeliveryUrl && (
                        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-12 h-12 rounded overflow-hidden border border-gray-200 shrink-0 bg-white">
                              <Image
                                src={logistics.proofOfDeliveryUrl}
                                alt="Proof of Delivery"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-900">Proof of Delivery Photo</p>
                              <p className="text-[11px] text-gray-500">Uploaded by rider upon handover</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPodLightboxUrl(logistics.proofOfDeliveryUrl)}
                            className="px-3 py-1.5 rounded bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 text-xs font-medium transition-colors"
                          >
                            View Photo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Harvest Summary Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Harvest Summary ({order.items.length} {order.items.length === 1 ? 'Item' : 'Items'})
            </h2>

            <div className="divide-y divide-gray-100">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    <Image
                      src={item.product.photos?.[0] || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.product.farm.farmName}
                    </p>
                    <div className="mt-1 text-xs text-gray-600 font-mono tabular-nums">
                      {formatQuantity(item.quantityKg, 'kg')} &times; {formatCurrency(item.pricePerKg)}
                    </div>
                  </div>
                  <div className="text-right font-semibold text-gray-900 text-sm tabular-nums">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Delivery & Handling</span>
                <span className="font-semibold text-gray-900 tabular-nums">{formatCurrency(order.deliveryFee || 0)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="font-semibold text-gray-900 text-sm">Total Order Amount</span>
                <span className="font-bold text-lg text-green-800 tabular-nums">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Delivery Destination + Farmer Card + Buyer Review */}
        <div className="lg:col-span-4 space-y-6">
          {/* Delivery Address Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Delivery Destination
            </h3>
            <p className="font-semibold text-gray-900 text-sm">{order.address?.fullName}</p>
            <p className="text-xs font-mono text-gray-500 mt-0.5">{order.address?.phone}</p>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              {order.address?.street}, Brgy. {order.address?.barangay}, {order.address?.city}, {order.address?.province}
            </p>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Estimated Arrival</span>
              <span className="font-semibold text-gray-900">{logistics.estimatedDelivery}</span>
            </div>
          </div>

          {/* Buyer Freshness Review Card (if rated) */}
          {isCompleted && (
            <div className="bg-green-50/50 rounded-xl border border-green-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-green-900">
                  Your Freshness Review
                </span>
                <span className="text-xs font-bold text-green-800">
                  {order.freshnessRating || 5}/5 Stars
                </span>
              </div>
              <p className="text-xs text-gray-800 italic">
                &ldquo;{order.buyerReview || 'Produce arrived fresh and in great condition!'}&rdquo;
              </p>
              <p className="text-[11px] text-gray-500 mt-2">
                Escrow Released on {format(new Date(order.buyerConfirmedAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          )}

          {/* Fulfillment Partner Card */}
          {farm && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Origin Farm Partner
              </p>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                  <Image
                    src={farm.user?.avatarUrl || 'https://i.pravatar.cc/150?img=12'}
                    alt={farm.farmName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{farm.farmName}</h4>
                  <p className="text-xs text-gray-500">{farm.user?.name || 'Verified Farmer'}</p>
                  <span className="inline-flex items-center text-[10px] font-medium text-green-800 bg-green-50 px-2 py-0.5 rounded mt-1 border border-green-200">
                    RSBSA & KYC Verified
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${farm.user?.phone || '09175550192'}`}
                  className="py-2 px-3 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium text-center transition-colors border border-gray-300"
                >
                  Call Farm
                </a>
                <Link
                  href="/products"
                  className="py-2 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium text-center transition-colors"
                >
                  View Produce
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      {status === 'DELIVERED' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg px-4 py-3">
          <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-gray-900">
                {isCompleted
                  ? `Order Completed • Rated ${order.freshnessRating || 5}/5 Stars`
                  : 'Has your fresh harvest arrived in good condition?'}
              </p>
              <p className="text-[11px] text-gray-500">
                {isCompleted
                  ? 'FarmFlow Escrow payout has been released to the farmer.'
                  : 'Confirming receipt releases the escrow payment to the farmer.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {canRequestRefund && (
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(true)}
                  className="px-4 py-2 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Return / Refund Order
                </button>
              )}

              {canConfirmReceived && (
                <button
                  type="button"
                  onClick={() => setIsReceiveModalOpen(true)}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-green-800 hover:bg-green-900 text-white transition-colors"
                >
                  Order Received
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Proof of Delivery Lightbox */}
      {podLightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPodLightboxUrl(null)}
        >
          <div
            className="relative bg-white rounded-xl max-w-lg w-full p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Proof of Delivery Photo</h4>
                <p className="text-xs text-gray-500">Tracking #{logistics.trackingNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setPodLightboxUrl(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="relative w-full h-80 rounded-lg overflow-hidden bg-gray-100">
              <Image src={podLightboxUrl} alt="Proof of Delivery" fill className="object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Order Received & Rate Freshness Modal */}
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
              Confirming receipt releases <strong>{formatCurrency(order.totalAmount)}</strong> from escrow directly to <strong>{farmName}</strong>.
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
                Share Your Review for {farmName} (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="How was the produce freshness, packaging, and delivery?"
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
                Cancel
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

      {/* Return / Refund Modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-gray-900 text-base">Return / Refund Order</h3>
              <button onClick={() => setIsRefundModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Return / Refund Type *</label>
                <select
                  value={refundReasonPreset}
                  onChange={(e) => setRefundReasonPreset(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-green-800"
                >
                  {REFUND_PRESETS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reason & Issue Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the condition of the items received..."
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
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-green-800 hover:bg-green-900 text-white"
              >
                {isSubmittingRefund ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
