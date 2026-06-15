import FarmerHeader from '@/components/farmer/FarmerHeader';
import FarmerBottomNav from '@/components/farmer/FarmerBottomNav';
import OrdersClient from '@/components/farmer/OrdersClient';
import { getFarmerOrdersAction } from '@/app/actions/orders';
import { getFarmerDashboardStatsAction, getFarmProfileAction } from '@/app/actions/farm';

export default async function OrdersEarningsPage() {
  const [orders, stats, farmProfile] = await Promise.all([
    getFarmerOrdersAction(),
    getFarmerDashboardStatsAction(),
    getFarmProfileAction(),
  ]);

  const userName = farmProfile?.user?.name || 'Farmer';
  const avatarUrl = farmProfile?.user?.avatarUrl;

  const activeOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'READY'].includes(o.orderStatus));
  const completedOrders = orders.filter(o => ['DELIVERED'].includes(o.orderStatus));

  return (
    <>
      <FarmerHeader variant="default" userName={userName} avatarUrl={avatarUrl} />
      <main className="w-full px-[16px] flex-1 flex flex-col gap-[32px] pt-[16px] pb-24">
        <OrdersClient 
          activeOrders={activeOrders as any} 
          completedOrders={completedOrders as any} 
          stats={stats} 
        />
      </main>
      <FarmerBottomNav activePage="orders" />
    </>
  );
}
