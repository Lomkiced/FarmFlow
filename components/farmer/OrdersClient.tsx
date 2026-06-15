'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatusAction } from '@/app/actions/orders';
import toast from 'react-hot-toast';

type OrderItem = {
  product: {
    name: string;
    photos: string[];
  };
};

type Order = {
  id: string;
  buyer: {
    name: string;
    phone: string | null;
  };
  address: {
    street: string;
    barangay: string;
    city: string;
  };
  items: OrderItem[];
  totalAmount: number;
  orderStatus: string;
  createdAt: Date;
};

export default function OrdersClient({
  activeOrders,
  completedOrders,
  stats,
}: {
  activeOrders: Order[];
  completedOrders: Order[];
  stats: any;
}) {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'earnings'>('earnings');
  const [isPending, startTransition] = useTransition();

  const weekData = [
    { day: 'Mon', height: '30%', highlight: false },
    { day: 'Tue', height: '50%', highlight: false },
    { day: 'Wed', height: '90%', highlight: true },
    { day: 'Thu', height: '40%', highlight: false },
    { day: 'Fri', height: '70%', highlight: false },
    { day: 'Sat', height: '20%', highlight: false },
    { day: 'Sun', height: '10%', highlight: false },
  ];

  const handleUpdateStatus = (orderId: string, currentStatus: string) => {
    let newStatus: 'CONFIRMED' | 'READY' | 'DELIVERED' | 'CANCELLED';
    if (currentStatus === 'PENDING') newStatus = 'CONFIRMED';
    else if (currentStatus === 'CONFIRMED') newStatus = 'READY';
    else if (currentStatus === 'READY') newStatus = 'DELIVERED';
    else return;

    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, newStatus);
      if (result.success) {
        toast.success(result.message || `Order marked as ${newStatus}`);
      } else {
        toast.error(result.error || 'Failed to update order status');
      }
    });
  };

  const renderOrderCard = (order: Order) => {
    const initials = order.buyer.name.substring(0, 2).toUpperCase();
    const productNames = order.items.map(i => i.product.name).join(', ');
    const isOrderPending = order.orderStatus === 'PENDING';
    const statusBg = isOrderPending ? 'bg-surface-variant' : 'bg-secondary-container';
    const statusColor = isOrderPending ? 'text-on-surface-variant' : 'text-on-secondary-container';

    let nextActionLabel = '';
    if (order.orderStatus === 'PENDING') nextActionLabel = 'Confirm Order';
    else if (order.orderStatus === 'CONFIRMED') nextActionLabel = 'Mark as Ready';
    else if (order.orderStatus === 'READY') nextActionLabel = 'Mark Delivered';

    return (
      <div key={order.id} className="flex flex-col p-[16px] bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(27,67,50,0.04)] mb-2 gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-[14px] font-medium">
              {initials}
            </div>
            <div>
              <p className="text-[14px] font-medium">{order.buyer.name}</p>
              <p className="text-[12px] text-on-surface-variant mt-0.5 truncate max-w-[200px]">{productNames}</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="text-[14px] font-medium mb-1">
              ₱{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className={`${statusBg} ${statusColor} text-[10px] font-semibold tracking-[0.03em] px-2 py-0.5 rounded-full inline-block uppercase`}>
              {order.orderStatus}
            </span>
          </div>
        </div>

        {nextActionLabel && (
          <div className="flex justify-end border-t border-surface-variant pt-3 mt-1">
            <button
              disabled={isPending}
              onClick={() => handleUpdateStatus(order.id, order.orderStatus)}
              className="bg-primary hover:bg-primary/90 text-on-primary font-label-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {nextActionLabel}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Tab selector */}
      <div className="flex bg-surface-container rounded-lg p-1">
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 text-center text-[14px] font-medium rounded-md transition-colors ${activeTab === 'active' ? 'text-on-primary bg-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
        >
          Active Orders ({activeOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 text-center text-[14px] font-medium rounded-md transition-colors ${activeTab === 'completed' ? 'text-on-primary bg-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
        >
          Completed ({completedOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('earnings')}
          className={`flex-1 py-2 text-center text-[14px] font-medium rounded-md transition-colors ${activeTab === 'earnings' ? 'text-on-primary bg-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
        >
          Earnings
        </button>
      </div>

      {/* Conditional content by tab */}
      {activeTab === 'earnings' && (
        <>
          {/* FILTER + TOTAL EARNINGS */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex justify-between items-center">
              <h2 className="text-[20px] font-semibold text-on-background">Total Earnings</h2>
              <button className="flex items-center gap-1 text-[12px] font-semibold text-primary bg-primary-fixed px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                This Month
              </button>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-[16px] shadow-[0_4px_20px_rgba(27,67,50,0.04)] flex flex-col gap-[8px]">
              <div className="text-[48px] font-bold leading-[1.1] tracking-[-0.02em] text-[#D97706]">
                ₱{stats?.thisMonthEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </div>
              <div className="text-[14px] font-medium text-on-surface-variant">
                Ready for Payout: <span className="text-primary font-semibold">₱0.00</span>
              </div>
            </div>
          </div>

          {/* WEEKLY OVERVIEW chart */}
          <div className="bg-surface-container-lowest rounded-xl p-[16px] shadow-[0_4px_20px_rgba(27,67,50,0.04)]">
            <div className="text-[14px] font-medium text-on-surface-variant mb-[16px]">Weekly Overview</div>
            <div className="flex items-end justify-between h-32 gap-2">
              {weekData.map((data, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <div 
                    className={`w-full rounded-t-sm ${data.highlight ? 'bg-[#D97706] shadow-[0_0_10px_rgba(217,119,6,0.3)]' : 'bg-surface-container'}`} 
                    style={{ height: data.height }} 
                  />
                  <div className={`text-[10px] ${data.highlight ? 'text-primary font-bold' : 'text-outline'}`}>
                    {data.day}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TRANSACTION HISTORY */}
          <div className="flex flex-col gap-[8px]">
            <h3 className="text-[20px] font-semibold mb-[8px]">Recent Completed Orders</h3>
            <div className="flex flex-col gap-[8px]">
              {completedOrders.slice(0, 5).map((order) => {
                const productNames = order.items.map(i => i.product.name).join(', ');
                const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <div key={order.id} className="flex items-center justify-between p-[8px] bg-surface-container-lowest rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                        <span className="material-symbols-outlined text-[16px]">shopping_basket</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="text-[14px] text-on-surface truncate max-w-[150px]">{productNames}</div>
                        <div className="text-[12px] font-semibold text-on-surface-variant">{date}</div>
                      </div>
                    </div>
                    <div className="text-[14px] font-semibold text-[#15803d]">
                      +₱{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              })}
              {completedOrders.length === 0 && (
                <p className="text-[14px] text-on-surface-variant text-center py-4">No recent transactions.</p>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'active' && (
        <div className="flex flex-col gap-[8px]">
          {activeOrders.length === 0 ? (
            <p className="text-[14px] text-on-surface-variant text-center py-4">No active orders.</p>
          ) : (
            activeOrders.map(renderOrderCard)
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="flex flex-col gap-[8px]">
          {completedOrders.length === 0 ? (
            <p className="text-[14px] text-on-surface-variant text-center py-4">No completed orders.</p>
          ) : (
            completedOrders.map(renderOrderCard)
          )}
        </div>
      )}
    </>
  );
}
