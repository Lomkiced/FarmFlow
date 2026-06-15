import { getAdminOrdersAction } from '@/app/actions/admin';
import OrdersClient from '@/components/admin/OrdersClient';

export const dynamic = 'force-dynamic';

export default async function OrdersOverviewPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
  
  const filters = {
    buyer: typeof searchParams.buyer === 'string' ? searchParams.buyer : undefined,
    dateFrom: typeof searchParams.dateFrom === 'string' ? searchParams.dateFrom : undefined,
    dateTo: typeof searchParams.dateTo === 'string' ? searchParams.dateTo : undefined,
    minAmount: typeof searchParams.minAmount === 'string' ? parseFloat(searchParams.minAmount) : undefined,
    maxAmount: typeof searchParams.maxAmount === 'string' ? parseFloat(searchParams.maxAmount) : undefined,
  };

  const { orders } = await getAdminOrdersAction(status, 1, 100, filters);

  return (
    <OrdersClient initialOrders={orders as any} />
  );
}
