import { notFound } from 'next/navigation';
import { getOrderAction } from '@/app/actions/orders';
import OrderTrackingDetailClient from '@/components/buyer/OrderTrackingDetailClient';

export default async function OrderTrackingPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const order = await getOrderAction(params.id);

  if (!order) {
    notFound();
  }

  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <OrderTrackingDetailClient order={JSON.parse(JSON.stringify(order))} />
    </main>
  );
}
