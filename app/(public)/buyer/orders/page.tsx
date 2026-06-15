import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/dal';
import OrderCard from '@/components/buyer/OrderCard';
import Link from 'next/link';

export default async function OrdersPage() {
  const user = await requireRole('BUYER');

  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            include: {
              farm: {
                select: { farmName: true }
              }
            }
          }
        }
      }
    }
  });

  return (
    <div className="w-full max-w-screen-md mx-auto px-4 md:px-8 py-12 flex flex-col gap-8 min-h-[80vh]">
      <div className="flex flex-col gap-2">
        <h1 className="font-display font-black text-4xl text-emerald-900 tracking-tight">My Orders</h1>
        <p className="text-on-surface-variant text-lg">Track and view your recent purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container rounded-3xl border border-surface-variant text-center px-6">
          <div className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[48px] text-outline">shopping_bag</span>
          </div>
          <h3 className="font-display font-bold text-2xl text-on-surface mb-2">No orders yet</h3>
          <p className="text-on-surface-variant mb-8 max-w-sm">You haven't placed any orders yet. Discover fresh, local produce directly from farmers!</p>
          <Link href="/products" className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm active:scale-95">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
