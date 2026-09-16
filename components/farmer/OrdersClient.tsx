'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { updateOrderStatusAction } from '@/app/actions/orders';
import toast from 'react-hot-toast';
import FarmerOrderDispatchModal, { DispatchOrder } from './FarmerOrderDispatchModal';

export type Order = DispatchOrder;

interface WeekDataItem {
  day: string;
  total: number;
  height: string;
  highlight?: boolean;
}

interface FarmerStats {
  thisMonthEarnings?: number;
  readyForPayout?: number;
  weekData?: WeekDataItem[];
}

export default function OrdersClient({
  activeOrders,
  completedOrders,
  stats,
}: {
  activeOrders: Order[];
  completedOrders: Order[];
  stats: FarmerStats;
}) {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'earnings'>('active');
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const router = useRouter();

  // State for the dispatch & waybill modal
  const [selectedDispatchOrder, setSelectedDispatchOrder] = useState<DispatchOrder | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      startRefreshTransition(() => {
        router.refresh();
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const weekData = stats?.weekData || [];
  const readyForPayout = stats?.readyForPayout || 0;

  const handleUpdateStatus = (orderId: string, currentStatus: string) => {
    let newStatus: 'CONFIRMED' | 'READY' | 'DELIVERED' | 'CANCELLED';
    if (currentStatus === 'PENDING') newStatus = 'CONFIRMED';
    else if (currentStatus === 'CONFIRMED') newStatus = 'READY';
    else if (currentStatus === 'READY') newStatus = 'DELIVERED';
    else return;

    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, newStatus);
      if (result.success) {
        toast.success(result.message || `Order marked as ${newStatus.toLowerCase()}`);
        // If the updated order is currently open in modal, close it
        if (selectedDispatchOrder?.id === orderId) {
          setIsDispatchModalOpen(false);
          setSelectedDispatchOrder(null);
        }
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update order status');
      }
    });
  };

  const openDispatchDetails = (order: Order) => {
    setSelectedDispatchOrder(order);
    setIsDispatchModalOpen(true);
  };

  const renderOrderCard = (order: Order) => {
    const recipientName = order.address?.fullName || order.buyer.name;
    const recipientPhone = order.address?.phone || order.buyer.phone || '';
    const initials = recipientName.substring(0, 2).toUpperCase();
    const productSummary = order.items
      .map(i => `${i.product.name} (${i.quantityKg}kg)`)
      .join(', ');

    const isOrderPending = order.orderStatus === 'PENDING';
    const isOrderReady = order.orderStatus === 'READY';
    const isOrderDelivered = order.orderStatus === 'DELIVERED';

    const isPaid = order.paymentStatus === 'PAID';

    let nextActionLabel = '';
    if (order.orderStatus === 'PENDING') nextActionLabel = 'Confirm Order';
    else if (order.orderStatus === 'CONFIRMED') nextActionLabel = 'Mark as Ready';
    else if (order.orderStatus === 'READY') nextActionLabel = 'Mark Delivered';

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${order.address?.street || ''}, ${order.address?.barangay || ''}, Agoo, La Union`
    )}`;

    return (
      <div
        key={order.id}
        className="flex flex-col p-4 sm:p-5 bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(27,67,50,0.04)] border border-outline-variant/30 mb-3 gap-3 transition-all hover:shadow-md"
      >
        {/* Top Header: Buyer info + Status & Amount */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-[14px] font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm sm:text-base font-bold text-on-surface truncate">
                  {recipientName}
                </p>
                <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant truncate max-w-[220px] sm:max-w-md mt-0.5">
                {productSummary}
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end shrink-0">
            <p className="text-sm sm:text-base font-black text-primary mb-1">
              ₱{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span
              className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase ${
                isOrderPending
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : isOrderReady
                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                  : isOrderDelivered
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-surface-variant text-on-surface-variant'
              }`}
            >
              {order.orderStatus}
            </span>
          </div>
        </div>

        {/* Delivery Address Row */}
        {order.address && (
          <div className="p-3 bg-surface-container/50 rounded-xl border border-surface-variant/40 flex flex-col gap-1.5 text-xs text-on-surface">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                <span>Barangay {order.address.barangay}, Agoo</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">
                {order.address.street}
              </span>
            </div>

            {/* Landmark Callout */}
            {order.notes && (
              <div className="flex items-start gap-1 text-amber-900 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 mt-0.5">
                <span className="material-symbols-outlined text-[14px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  pin_drop
                </span>
                <span className="font-semibold italic truncate">
                  Landmark: {order.notes}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Payment Collection Indicator */}
        <div className="flex items-center justify-between text-xs">
          {isPaid ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              Paid Online (GCash) — Do Not Collect Cash
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 font-bold border border-amber-300">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                payments
              </span>
              Collect Cash on Delivery: ₱{order.totalAmount.toFixed(2)}
            </span>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-surface-variant/60 pt-3 mt-1">
          <div className="flex items-center gap-1.5">
            {/* Dispatch Waybill Button */}
            <button
              onClick={() => openDispatchDetails(order)}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-secondary-container text-on-secondary-container hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              Dispatch Slip
            </button>

            {/* Direct Call Link */}
            {recipientPhone && (
              <a
                href={`tel:${recipientPhone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary transition-colors"
                title={`Call ${recipientName}`}
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
              </a>
            )}

            {/* Open Google Maps */}
            {order.address && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary transition-colors"
                title="Navigate on Google Maps"
              >
                <span className="material-symbols-outlined text-[16px]">explore</span>
              </a>
            )}
          </div>

          {/* Status Progression Button */}
          {nextActionLabel && (
            <button
              disabled={isPending}
              onClick={() => handleUpdateStatus(order.id, order.orderStatus)}
              className="bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5 ml-auto"
            >
              {isPending && (
                <span className="material-symbols-outlined text-[14px] animate-spin">
                  progress_activity
                </span>
              )}
              {nextActionLabel}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Tab selector */}
      <div className="flex bg-surface-container rounded-xl p-1 shadow-sm">
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 text-center text-[14px] font-bold rounded-lg transition-all ${
            activeTab === 'active' 
              ? 'text-on-primary bg-primary shadow-sm' 
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Active Deliveries ({activeOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 text-center text-[14px] font-bold rounded-lg transition-all ${
            activeTab === 'completed' 
              ? 'text-on-primary bg-primary shadow-sm' 
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Completed ({completedOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('earnings')}
          className={`flex-1 py-2 text-center text-[14px] font-bold rounded-lg transition-all ${
            activeTab === 'earnings' 
              ? 'text-on-primary bg-primary shadow-sm' 
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Earnings
        </button>
      </div>

      {/* Tab 1: Active Orders */}
      {activeTab === 'active' && (
        <div className="flex flex-col gap-2">
          {activeOrders.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-surface-variant/40 shadow-sm p-6">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">
                local_shipping
              </span>
              <p className="text-base font-bold text-on-surface">No active orders</p>
              <p className="text-xs text-on-surface-variant mt-1">
                New buyer orders requiring harvest and delivery will appear here.
              </p>
            </div>
          ) : (
            activeOrders.map(renderOrderCard)
          )}
        </div>
      )}

      {/* Tab 2: Completed Orders */}
      {activeTab === 'completed' && (
        <div className="flex flex-col gap-2">
          {completedOrders.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-surface-variant/40 shadow-sm p-6">
              <span className="material-symbols-outlined text-[48px] text-outline mb-2">
                task_alt
              </span>
              <p className="text-base font-bold text-on-surface">No completed deliveries yet</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Orders marked as delivered will be archived here.
              </p>
            </div>
          ) : (
            completedOrders.map(renderOrderCard)
          )}
        </div>
      )}

      {/* Tab 3: Earnings */}
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
                ₱{(stats?.thisMonthEarnings ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[14px] font-medium text-on-surface-variant">
                Ready for Payout: <span className="text-primary font-semibold">₱{readyForPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* WEEKLY OVERVIEW chart */}
          <div className="bg-surface-container-lowest rounded-xl p-[16px] shadow-[0_4px_20px_rgba(27,67,50,0.04)]">
            <div className="text-[14px] font-medium text-on-surface-variant mb-[16px]">
              Weekly Overview {isRefreshing && <span className="material-symbols-outlined animate-spin text-[14px] inline-block ml-1">progress_activity</span>}
            </div>
            {weekData.length === 0 || weekData.every((d) => d.total === 0) ? (
              <div className="h-32 flex items-center justify-center text-on-surface-variant text-[14px]">
                No earnings recorded this week.
              </div>
            ) : (
              <div className="flex items-end justify-between h-32 gap-2">
                {weekData.map((data, idx: number) => (
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
            )}
          </div>

          {/* TRANSACTION HISTORY */}
          <div className="flex flex-col gap-[8px]">
            <h3 className="text-[20px] font-semibold mb-[8px]">Recent Completed Orders</h3>
            <div className="flex flex-col gap-[8px]">
              {completedOrders.slice(0, 5).map((order) => {
                const productNames = order.items.map(i => i.product.name).join(', ');
                const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <div key={order.id} className="flex items-center justify-between p-[12px] bg-surface-container-lowest rounded-xl border border-surface-variant/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                        <span className="material-symbols-outlined text-[16px]">shopping_basket</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="text-[14px] font-bold text-on-surface truncate max-w-[150px] sm:max-w-xs">{productNames}</div>
                        <div className="text-[12px] font-semibold text-on-surface-variant">{date} • {order.address?.barangay || 'Agoo'}</div>
                      </div>
                    </div>
                    <div className="text-[14px] font-black text-[#15803d]">
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

      {/* Farmer Order Dispatch & Waybill Modal */}
      <FarmerOrderDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => {
          setIsDispatchModalOpen(false);
          setSelectedDispatchOrder(null);
        }}
        order={selectedDispatchOrder}
        onUpdateStatus={handleUpdateStatus}
        isUpdatingStatus={isPending}
      />
    </>
  );
}
