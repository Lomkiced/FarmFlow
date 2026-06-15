import { getAdminOrdersAction } from '@/app/actions/admin';
import OrdersClient from '@/components/admin/OrdersClient';

export const dynamic = 'force-dynamic';

export default async function OrdersOverviewPage() {
  const { orders } = await getAdminOrdersAction(undefined, 1, 100);

  return (
    <OrdersClient initialOrders={orders as any} />
  );
}
