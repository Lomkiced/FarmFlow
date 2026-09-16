import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { getOrderAction } from '@/app/actions/orders';
import PrintReceiptButton from '@/components/marketplace/PrintReceiptButton';

type Props = {
  searchParams: Promise<{ orderId?: string; success?: string }>;
};

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderId = params.orderId;

  // If no orderId, redirect to orders history
  if (!orderId) {
    redirect('/buyer/orders');
  }

  let order: Awaited<ReturnType<typeof getOrderAction>> = null;
  try {
    order = await getOrderAction(orderId);
  } catch (err) {
    console.error('[OrderConfirmationPage] Auth or query error:', err);
    redirect('/auth/login');
  }

  // If order not found or not authorized (IDOR prevention)
  if (!order) {
    return (
      <main className="w-full max-w-[800px] mx-auto px-4 py-20 text-center">
        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-surface-variant shadow-sm flex flex-col items-center">
          <span className="material-symbols-outlined text-[64px] text-error mb-4">
            error
          </span>
          <h1 className="font-['Manrope'] text-2xl font-bold text-on-surface mb-2">
            Order Not Found or Access Denied
          </h1>
          <p className="text-on-surface-variant text-sm max-w-md mb-6">
            We couldn&apos;t find this order or you do not have permission to view it.
          </p>
          <div className="flex gap-4">
            <Link
              href="/buyer/orders"
              className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:opacity-90 transition-opacity"
            >
              View My Orders
            </Link>
            <Link
              href="/products"
              className="bg-surface-container text-on-surface px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-surface-container-high transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const recipientName = order.address?.fullName || order.buyer.name;
  const recipientPhone = order.address?.phone || order.buyer.phone || '';
  const isPaid = order.paymentStatus === 'PAID';

  const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryFee = order.deliveryFee ?? 50;

  // Primary fulfillment partner
  const primaryFarm = order.items[0]?.product?.farm;

  return (
    <main className="w-full max-w-[1040px] mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col gap-8 print:p-0 print:max-w-none">
      
      {/* Top Banner - Hero Celebration */}
      <div className="flex flex-col items-center text-center gap-3 print:hidden">
        <div className="w-20 h-20 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary mb-2 animate-[scaleIn_0.4s_ease-out]">
          <span
            className="material-symbols-outlined text-[54px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>

        <h1 className="font-['Manrope'] text-3xl sm:text-4xl font-extrabold text-on-background tracking-tight">
          Order Confirmed!
        </h1>

        <p className="text-on-surface-variant text-sm sm:text-base max-w-lg leading-relaxed">
          Thank you for supporting our local farmers in Agoo, La Union. Your order has been placed and is being prepared for fresh delivery.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-mono font-bold text-on-surface">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <span className="px-3 py-1 rounded-full bg-secondary-container/60 text-xs font-bold text-on-secondary-container uppercase">
            Status: {order.orderStatus}
          </span>
          <span className="text-xs text-on-surface-variant">
            • {format(new Date(order.createdAt), 'MMM d, yyyy • h:mm a')}
          </span>
        </div>

        {/* Quick action buttons on top */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          <PrintReceiptButton />
          <Link
            href={`/orders/${order.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm hover:opacity-90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            Track Status
          </Link>
          <Link
            href="/buyer/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs sm:text-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            My Orders
          </Link>
        </div>
      </div>

      {/* Printable Receipt Header (Visible on print) */}
      <div className="hidden print:flex flex-col gap-2 pb-4 border-b-2 border-primary">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-['Manrope'] text-2xl font-black text-primary">FarmFlow Agoo</h1>
            <p className="text-xs text-gray-600">Agricultural Operations & Direct Marketplace</p>
            <p className="text-xs text-gray-600">Official Municipal Order Receipt • Agoo, La Union</p>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold text-sm">#{order.id.toUpperCase()}</p>
            <p className="text-xs text-gray-500">Date: {format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')}</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Delivery Details & Items */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Card 1: Delivery Destination */}
          <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant">
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  pin_drop
                </span>
                Confirmed Delivery Destination
              </div>
              <span className="px-2.5 py-0.5 rounded-md bg-secondary-container/40 text-on-secondary-container font-semibold text-xs">
                Barangay {order.address.barangay}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="font-bold text-base text-on-surface">
                {recipientName}
              </p>
              {recipientPhone && (
                <p className="font-mono text-sm font-semibold text-primary">
                  {recipientPhone}
                </p>
              )}
              <p className="text-sm text-on-surface-variant leading-relaxed mt-1">
                {order.address.street}, Barangay {order.address.barangay}, {order.address.city}, {order.address.province} {order.address.zipCode ? `(${order.address.zipCode})` : ''}
              </p>
            </div>

            {/* Special Landmark Notes */}
            {order.notes ? (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-950">
                <span
                  className="material-symbols-outlined text-amber-700 text-[20px] shrink-0 mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  info
                </span>
                <div>
                  <span className="font-bold uppercase tracking-wider block text-amber-900">
                    Delivery Instructions / Landmark:
                  </span>
                  <p className="font-semibold text-amber-950 mt-0.5">
                    &ldquo;{order.notes}&rdquo;
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-on-surface-variant italic">
                Standard doorstep delivery within Agoo, La Union.
              </div>
            )}
          </div>

          {/* Card 2: Ordered Items Summary */}
          <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant">
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  shopping_basket
                </span>
                Harvest Items Ordered ({order.items.length})
              </div>
            </div>

            <div className="divide-y divide-surface-variant">
              {order.items.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-surface-container relative overflow-hidden shrink-0 border border-surface-variant">
                    {item.product.photos && item.product.photos[0] ? (
                      <Image
                        src={item.product.photos[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-outline">
                        <span className="material-symbols-outlined text-[20px]">spa</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-on-surface truncate">
                      {item.product.name}
                    </p>
                    {item.product.farm?.farmName && (
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Harvested by: <span className="font-semibold">{item.product.farm.farmName}</span>
                      </p>
                    )}
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      ₱{item.pricePerKg.toFixed(2)} per kg
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2.5 py-0.5 rounded bg-surface-container font-mono text-xs font-bold text-on-surface">
                      {item.quantityKg} kg
                    </span>
                    <p className="text-sm font-black text-on-surface mt-1">
                      ₱{item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Payment Breakdown & Fulfillment Partner */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Card 3: Payment & Financial Summary */}
          <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant">
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  receipt
                </span>
                Payment Summary
              </div>
            </div>

            {/* Payment Method & Instruction Banner */}
            {isPaid ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-start gap-2.5">
                <span
                  className="material-symbols-outlined text-emerald-700 text-[22px] shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider text-emerald-900">
                    Paid Online via GCash
                  </p>
                  <p className="text-xs text-emerald-800 mt-0.5 font-medium">
                    Your payment was verified. No cash will be collected on delivery.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-2.5">
                <span
                  className="material-symbols-outlined text-amber-700 text-[22px] shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  payments
                </span>
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider text-amber-900">
                    Cash on Delivery (COD)
                  </p>
                  <p className="text-xs text-amber-800 mt-0.5 font-medium">
                    Please prepare exact cash of ₱{order.totalAmount.toFixed(2)} for the courier upon arrival.
                  </p>
                </div>
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-on-surface-variant">
              <div className="flex justify-between">
                <span>Items Subtotal ({order.items.length} item{order.items.length > 1 ? 's' : ''})</span>
                <span className="font-semibold text-on-surface">₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Local Municipal Delivery Fee</span>
                <span className="font-semibold text-on-surface">₱{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-surface-variant text-base font-bold text-primary">
                <span>Total Amount</span>
                <span className="text-xl font-black text-primary">₱{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Fulfillment Partner (Farmer) */}
          {primaryFarm && (
            <div className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider pb-2 border-b border-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  agriculture
                </span>
                Fulfillment Partner
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary-container relative overflow-hidden shrink-0 flex items-center justify-center text-on-secondary-container font-bold text-base border border-surface-variant">
                  {primaryFarm.user?.avatarUrl ? (
                    <Image
                      src={primaryFarm.user.avatarUrl}
                      alt={primaryFarm.farmName}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    primaryFarm.farmName.substring(0, 2).toUpperCase()
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-sm text-on-surface truncate">
                    {primaryFarm.farmName}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Farmer: {primaryFarm.user?.name || 'Local Farmer'}
                  </p>
                  <p className="text-[11px] text-primary font-medium mt-0.5">
                    📍 Barangay {primaryFarm.barangay}, Agoo
                  </p>
                </div>
              </div>

              {primaryFarm.user?.phone && (
                <div className="pt-1 print:hidden">
                  <a
                    href={`tel:${primaryFarm.user.phone.replace(/[^0-9+]/g, '')}`}
                    className="w-full py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    Contact Farmer
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Action Footer for Buyers */}
          <div className="flex flex-col gap-2.5 print:hidden">
            <Link
              href={`/orders/${order.id}`}
              className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-sm text-center transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              View Live Tracking Timeline
            </Link>

            <Link
              href="/products"
              className="w-full py-3 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-on-surface font-semibold text-xs text-center transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              Continue Browsing Products
            </Link>
          </div>

        </div>

      </div>

      {/* Print Sign-off (Only visible on paper) */}
      <div className="hidden print:block pt-8 mt-6 border-t-2 border-dashed border-gray-400">
        <div className="grid grid-cols-2 gap-8 text-xs text-gray-700">
          <div>
            <p className="font-bold">Customer Acknowledgment:</p>
            <div className="mt-8 border-b border-gray-500 w-48"></div>
            <p className="mt-1">{recipientName}</p>
          </div>
          <div>
            <p className="font-bold">Delivered by Farmer / Courier:</p>
            <div className="mt-8 border-b border-gray-500 w-48"></div>
            <p className="mt-1">{primaryFarm?.farmName || 'FarmFlow Dispatch'}</p>
          </div>
        </div>
      </div>

    </main>
  );
}
