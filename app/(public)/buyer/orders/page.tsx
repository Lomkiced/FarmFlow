import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/dal';
import BuyerOrdersClient from '@/components/buyer/BuyerOrdersClient';

export default async function OrdersPage() {
  const user = await requireRole('BUYER');

  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      address: true,
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

  // Ensure address is casted properly to match the Client component expectations
  const serializedOrders = orders.map(order => ({
    ...order,
    address: {
      fullName: order.address.fullName,
      phone: order.address.phone,
      street: order.address.street,
      barangay: order.address.barangay,
      city: order.address.city,
      province: order.address.province,
    }
  }));

  return <BuyerOrdersClient orders={serializedOrders} />;
}
