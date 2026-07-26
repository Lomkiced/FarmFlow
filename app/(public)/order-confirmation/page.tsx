import Link from 'next/link';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderId = params.orderId;

  // If no orderId, redirect to orders history so the user can find their order
  if (!orderId) {
    redirect('/buyer/orders');
  }

  return (
    <>
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-[24px] py-[80px] flex flex-col items-center justify-center text-center">
        {/* Animated success icon */}
        <div className="relative mb-[32px]">
          <div className="w-24 h-24 rounded-full bg-secondary-container/20 flex items-center justify-center animate-[ping_1s_ease-out_1]">
            <span
              className="material-symbols-outlined text-[80px] text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
        </div>

        <h1 className="font-['Manrope'] text-[40px] font-bold text-on-background mb-[16px] tracking-tight">
          Order Placed!
        </h1>

        <p className="font-body-md text-on-surface-variant max-w-[480px] mb-[8px]">
          Thank you for supporting local farmers. Your fresh produce is being prepared and will be delivered soon.
        </p>

        <p className="font-body-sm text-on-surface-variant/70 mb-[40px]">
          Order ID:{' '}
          <span className="font-mono font-semibold text-on-surface">
            #{orderId.slice(0, 8).toUpperCase()}
          </span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/orders/${orderId}`}
            className="bg-primary text-on-primary font-label-md text-label-md px-8 py-4 rounded-xl hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            Track My Order
          </Link>
          <Link
            href="/buyer/orders"
            className="bg-surface-variant text-on-surface font-label-md text-label-md px-8 py-4 rounded-xl hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            My Orders
          </Link>
          <Link
            href="/products"
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md px-8 py-4 rounded-xl hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">storefront</span>
            Continue Shopping
          </Link>
        </div>
      </main>
    </>
  );
}
