import Link from 'next/link';
export default function OrderConfirmationPage() {
  return (
    <>
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-[24px] py-[80px] flex flex-col items-center justify-center text-center">
        <span
          className="material-symbols-outlined text-[80px] text-secondary mb-[24px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        <h1 className="font-['Manrope'] text-[32px] font-bold text-on-background mb-[16px]">
          Order Placed!
        </h1>
        <p className="font-body-md text-on-surface-variant max-w-[480px] mb-[32px]">
          Thank you for your order. Your fresh produce is being
          prepared and will be delivered soon.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/orders/FF-8924"
            className="bg-surface-variant text-on-surface font-label-md text-label-md px-8 py-4 rounded-xl hover:bg-surface-container-high transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/products"
            className="bg-primary text-on-primary font-label-md text-label-md px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    </>
  );
}
