'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { OrderStatus } from '@prisma/client';
import OrderCard, { type OrderCardProps } from './OrderCard';
import PaginationBar from '@/components/ui/PaginationBar';

type TabType = 'ALL' | OrderStatus | 'REFUNDS';

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
  { id: 'REFUNDS', label: 'Refunds / Returns' },
];

export default function BuyerOrdersClient({ orders }: BuyerOrdersClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredOrders = activeTab === 'ALL' 
    ? orders 
    : activeTab === 'REFUNDS'
    ? orders.filter(order => order.refundStatus && order.refundStatus !== 'NONE')
    : orders.filter(order => order.orderStatus === activeTab);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice((safePage - 1) * pageSize, safePage * pageSize);

  const pendingRefundsCount = orders.filter(o => o.refundStatus === 'REQUESTED').length;

  return (
    <div className="w-full max-w-screen-md mx-auto px-4 md:px-8 py-10 flex flex-col gap-6 min-h-[80vh]">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">My Orders</h1>
        <p className="text-gray-500 text-sm">Track, manage, and request refunds for your produce orders.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar border-b border-gray-200 gap-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
            className={`pb-3 text-xs font-semibold whitespace-nowrap transition-colors relative ${
              activeTab === tab.id 
                ? 'text-green-800 border-b-2 border-green-800' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {tab.id === 'REFUNDS' && pendingRefundsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-100 text-gray-700">
                {pendingRefundsCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order List / Empty States */}
      <div className="flex flex-col gap-5">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 text-center px-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {activeTab === 'ALL' ? 'No orders yet' : `No ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()} orders`}
            </h3>
            <p className="text-gray-500 text-xs mb-6 max-w-sm">
              {activeTab === 'ALL' 
                ? "You haven't placed any orders yet. Discover fresh produce directly from local farms."
                : activeTab === 'REFUNDS'
                ? "You don't have any refund or return requests on your orders."
                : `You don't have any orders in this status right now.`}
            </p>
            {activeTab === 'ALL' && (
              <Link 
                href="/products" 
                className="bg-green-800 text-white px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-green-900 transition-colors"
              >
                Browse Marketplace
              </Link>
            )}
          </div>
        ) : (
          <>
            {paginatedOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
            <PaginationBar
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              pageSizeOptions={[3, 5, 10, 20]}
              itemLabel="orders"
            />
          </>
        )}
      </div>
    </div>
  );
}
