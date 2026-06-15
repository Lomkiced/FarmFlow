import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import type { OrderStatus, PaymentStatus } from '@prisma/client';

export interface OrderItemProp {
  id: string;
  product: {
    name: string;
    photos: string[];
    farm: { farmName: string };
  };
  quantityKg: number;
  pricePerKg: number;
  subtotal: number;
}

export interface OrderCardProps {
  order: {
    id: string;
    totalAmount: number;
    deliveryFee: number;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: Date;
    items: OrderItemProp[];
  };
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  READY: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Order Placed',
  CONFIRMED: 'Confirmed',
  READY: 'Ready for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function OrderCard({ order }: OrderCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container/30">
        <div className="flex flex-col">
          <span className="text-[12px] uppercase font-bold text-on-surface-variant tracking-wider">Order #{order.id.slice(0, 8)}</span>
          <span className="text-sm text-on-surface-variant">Placed {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider border ${statusColors[order.orderStatus]}`}>
            {statusLabels[order.orderStatus]}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="p-6 flex flex-col gap-6">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4 items-start">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-variant shrink-0 border border-outline-variant">
              {item.product.photos && item.product.photos.length > 0 ? (
                <Image src={item.product.photos[0]} alt={item.product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined">image</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start">
                <h4 className="font-display font-bold text-lg text-on-surface">{item.product.name}</h4>
                <span className="font-bold text-on-surface">{formatCurrency(item.subtotal)}</span>
              </div>
              <span className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[16px]">storefront</span>
                {item.product.farm.farmName}
              </span>
              <span className="text-sm text-on-surface-variant mt-2">
                {item.quantityKg} kg &times; {formatCurrency(item.pricePerKg)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-surface-variant bg-surface-container-lowest flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-on-surface-variant">Payment Status: <strong className={order.paymentStatus === 'PAID' ? 'text-primary' : 'text-amber-600'}>{order.paymentStatus}</strong></span>
          {order.deliveryFee > 0 && <span className="text-[12px] text-on-surface-variant">Includes {formatCurrency(order.deliveryFee)} delivery fee</span>}
        </div>
        <div className="flex items-end flex-col">
          <span className="text-sm text-on-surface-variant">Order Total</span>
          <span className="font-display font-black text-2xl text-primary">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
