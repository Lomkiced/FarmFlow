'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { OrderStatus } from '@prisma/client';
import OrderCard, { type OrderCardProps } from './OrderCard';

type TabType = 'ALL' | OrderStatus;

interface BuyerOrdersClientProps {
  orders: OrderCardProps['order'][];
}

const TABS: { id: TabType; label: string }[] = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'READY', label: 'To Ship' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

export default function BuyerOrdersClient({ orders }: BuyerOrdersClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');

  const filteredOrders = activeTab === 'ALL' 
    ? orders 
    : orders.filter(order => order.orderStatus === activeTab);

  return (
    <div className="w-full max-w-screen-md mx-auto px-4 md:px-8 py-12 flex flex-col gap-8 min-h-[80vh]">
      <div className="flex flex-col gap-2">
        <h1 className="font-display font-black text-4xl text-emerald-900 tracking-tight">My Orders</h1>
        <p className="text-on-surface-variant text-lg">Track and view your recent purchases.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar border-b border-surface-variant gap-6 snap-x">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-bold whitespace-nowrap snap-start transition-colors relative ${
              activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Order List / Empty States */}
      <div className="flex flex-col gap-6">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-surface-container-lowest rounded-3xl border border-surface-variant text-center px-6 shadow-sm">
            <div className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[48px] text-outline">
                {activeTab === 'DELIVERED' ? 'local_shipping' : activeTab === 'CANCELLED' ? 'cancel' : 'shopping_bag'}
              </span>
            </div>
            <h3 className="font-display font-bold text-2xl text-on-surface mb-2">
              {activeTab === 'ALL' ? 'No orders yet' : `No ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()} orders`}
            </h3>
            <p className="text-on-surface-variant mb-8 max-w-sm">
              {activeTab === 'ALL' 
                ? "You haven't placed any orders yet. Discover fresh, local produce directly from farmers!"
                : `You don't have any orders in this status right now.`}
            </p>
            {activeTab === 'ALL' && (
              <Link href="/products" className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm active:scale-95">
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  );
}
