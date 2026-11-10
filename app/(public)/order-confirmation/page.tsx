import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { getOrderAction } from '@/app/actions/orders';
import { formatQuantity } from '@/lib/utils';
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
        <div className="bg-white p-8 rounded-lg border border-gray-200 flex flex-col items-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Order Not Found or Access Denied
          </h1>
          <p className="text-gray-500 text-xs max-w-md mb-6">
            We couldn&apos;t find this order or you do not have permission to view it.
          </p>
          <div className="flex gap-3">
            <Link
              href="/buyer/orders"
              className="bg-green-800 text-white px-5 py-2 rounded-lg font-semibold text-xs hover:bg-green-900 transition-colors"
            >
              View My Orders
            </Link>
            <Link
              href="/products"
              className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg font-semibold text-xs hover:bg-gray-50 transition-colors"
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
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col gap-6 print:p-0 print:max-w-none">
      
      {/* Top Banner - Hero Order Confirmation */}
      <div className="flex flex-col items-center text-center gap-2.5 print:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Order Confirmed
        </h1>

        <p className="text-gray-600 text-xs sm:text-sm max-w-md leading-relaxed">
          Your order has been placed with local farmers in Agoo, La Union and is queued for fulfillment and dispatch.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          <span className="px-2.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-xs font-mono font-bold text-gray-800">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <span className="px-2.5 py-0.5 rounded border border-green-200 bg-green-50 text-xs font-semibold text-green-800 uppercase">
            {order.orderStatus}
          </span>
          <span className="text-xs text-gray-400 tabular-nums">
            • {format(new Date(order.createdAt), 'MMM d, yyyy • h:mm a')}
          </span>
        </div>

        {/* Action buttons on top */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3">
          <PrintReceiptButton />
          <Link
            href={`/orders/${order.id}`}
            className="px-4 py-2 rounded-lg bg-green-800 text-white font-semibold text-xs hover:bg-green-900 transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/buyer/orders"
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors"
          >
            All Orders
          </Link>
        </div>
      </div>

      {/* Printable Receipt Header (Visible on print) */}
      <div className="hidden print:flex flex-col gap-2 pb-4 border-b-2 border-green-800">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-green-800">FarmFlow Agoo</h1>
            <p className="text-xs text-gray-600">Agricultural Operations & Direct Marketplace</p>
            <p className="text-xs text-gray-600">Official Municipal Order Receipt • Agoo, La Union</p>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold text-sm">#{order.id.toUpperCase()}</p>
            <p className="text-xs text-gray-500 tabular-nums">Date: {format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')}</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Delivery Details & Items */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Card 1: Delivery Destination */}
          <div className="p-5 bg-white rounded-lg border border-gray-200 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <span className="text-gray-900 font-bold text-xs uppercase tracking-wider">
                Delivery Destination
              </span>
              <span className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-[11px]">
                Barangay {order.address.barangay}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <p className="font-bold text-sm text-gray-900">
                {recipientName}
              </p>
              {recipientPhone && (
                <p className="font-mono text-xs font-semibold text-green-800 tabular-nums">
                  {recipientPhone}
                </p>
              )}
              <p className="text-xs text-gray-600 leading-relaxed mt-0.5">
                {order.address.street}, Barangay {order.address.barangay}, {order.address.city}, {order.address.province} {order.address.zipCode ? `(${order.address.zipCode})` : ''}
              </p>
            </div>

            {/* Special Landmark Notes */}
            {order.notes ? (
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700">
                <span className="font-bold uppercase tracking-wider text-[10px] text-gray-400 block">
                  Delivery Landmark / Instructions:
                </span>
                <p className="mt-0.5 font-medium">
                  &ldquo;{order.notes}&rdquo;
                </p>
              </div>
            ) : (
              <div className="text-[11px] text-gray-400">
                Standard doorstep delivery within Agoo, La Union.
              </div>
            )}
          </div>

          {/* Card 2: Ordered Items Summary */}
          <div className="p-5 bg-white rounded-lg border border-gray-200 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <span className="text-gray-900 font-bold text-xs uppercase tracking-wider">
                Harvest Items Ordered ({order.items.length})
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-gray-100 relative overflow-hidden shrink-0 border border-gray-200">
                    {item.product.photos && item.product.photos[0] ? (
                      <Image
                        src={item.product.photos[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        Produce
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    {item.product.farm?.farmName && (
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {item.product.farm.farmName}
                      </p>
                    )}
                    <p className="text-[11px] text-gray-400 tabular-nums">
                      ₱{item.pricePerKg.toFixed(2)} / kg
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded border border-gray-200 bg-gray-50 font-mono text-[11px] font-bold text-gray-700 tabular-nums">
                      {formatQuantity(item.quantityKg, 'kg')}
                    </span>
                    <p className="text-xs font-bold text-gray-900 mt-0.5 tabular-nums">
                      ₱{item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Payment Breakdown & Fulfillment Partner */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Card 3: Payment & Financial Summary */}
          <div className="p-5 bg-white rounded-lg border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <span className="text-gray-900 font-bold text-xs uppercase tracking-wider">
                Payment Summary
              </span>
            </div>

            {/* Payment Method Notice */}
            {isPaid ? (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-900 text-xs">
                <p className="font-bold uppercase tracking-wider text-[10px] text-green-800">
                  Paid Online via GCash
                </p>
                <p className="mt-0.5 text-gray-700">
                  Payment verified. No cash will be collected on delivery.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-xs">
                <p className="font-bold uppercase tracking-wider text-[10px] text-gray-500">
                  Cash on Delivery (COD)
                </p>
                <p className="mt-0.5 text-gray-700">
                  Please prepare exact cash of ₱{order.totalAmount.toFixed(2)} for the courier upon arrival.
                </p>
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="flex flex-col gap-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal ({order.items.length} item{order.items.length > 1 ? 's' : ''})</span>
                <span className="font-semibold text-gray-900 tabular-nums">₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Local Municipal Delivery Fee</span>
                <span className="font-semibold text-gray-900 tabular-nums">₱{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-100 text-sm font-bold text-gray-900">
                <span>Total Amount</span>
                <span className="text-base font-bold text-green-800 tabular-nums">₱{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Fulfillment Partner (Farmer) */}
          {primaryFarm && (
            <div className="p-5 bg-white rounded-lg border border-gray-200 flex flex-col gap-3">
              <span className="text-gray-900 font-bold text-xs uppercase tracking-wider pb-2 border-b border-gray-100">
                Fulfillment Partner
              </span>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-gray-100 relative overflow-hidden shrink-0 flex items-center justify-center text-gray-700 font-bold text-xs border border-gray-200">
                  {primaryFarm.user?.avatarUrl ? (
                    <Image
                      src={primaryFarm.user.avatarUrl}
                      alt={primaryFarm.farmName}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    primaryFarm.farmName.substring(0, 2).toUpperCase()
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-xs text-gray-900 truncate">
                    {primaryFarm.farmName}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Farmer: {primaryFarm.user?.name || 'Local Farmer'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Barangay {primaryFarm.barangay}, Agoo
                  </p>
                </div>
              </div>

              {primaryFarm.user?.phone && (
                <div className="pt-1 print:hidden">
                  <a
                    href={`tel:${primaryFarm.user.phone.replace(/[^0-9+]/g, '')}`}
                    className="w-full py-2 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs text-center block transition-colors"
                  >
                    Contact Farmer ({primaryFarm.user.phone})
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Action Footer for Buyers */}
          <div className="flex flex-col gap-2 print:hidden">
            <Link
              href={`/orders/${order.id}`}
              className="w-full py-2.5 px-4 rounded-lg bg-green-800 hover:bg-green-900 text-white font-semibold text-xs text-center transition-colors"
            >
              View Live Tracking Timeline
            </Link>

            <Link
              href="/products"
              className="w-full py-2.5 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs text-center transition-colors"
            >
              Continue Browsing Products
            </Link>
          </div>

        </div>

      </div>

      {/* Print Sign-off (Only visible on paper) */}
      <div className="hidden print:block pt-6 mt-4 border-t border-dashed border-gray-400">
        <div className="grid grid-cols-2 gap-8 text-xs text-gray-700">
          <div>
            <p className="font-bold">Customer Acknowledgment:</p>
            <div className="mt-8 border-b border-gray-500 w-48" />
            <p className="mt-1">{recipientName}</p>
          </div>
          <div>
            <p className="font-bold">Delivered by Farmer / Courier:</p>
            <div className="mt-8 border-b border-gray-500 w-48" />
            <p className="mt-1">{primaryFarm?.farmName || 'FarmFlow Dispatch'}</p>
          </div>
        </div>
      </div>

    </main>
  );
}
