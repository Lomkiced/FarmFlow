'use client';

import { useState } from 'react';
import FarmerHeader from '@/components/farmer/FarmerHeader';
import FarmerBottomNav from '@/components/farmer/FarmerBottomNav';
import { MockOrder } from '@/types';

export default function OrdersEarningsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'earnings'>('earnings');

  const weekData = [
    { day: 'Mon', height: '30%', highlight: false },
    { day: 'Tue', height: '50%', highlight: false },
    { day: 'Wed', height: '90%', highlight: true },
    { day: 'Thu', height: '40%', highlight: false },
    { day: 'Fri', height: '70%', highlight: false },
    { day: 'Sat', height: '20%', highlight: false },
    { day: 'Sun', height: '10%', highlight: false },
  ];

  const transactions = [
    { icon: 'shopping_basket', iconBg: 'bg-secondary-container', iconColor: 'text-on-secondary-container', title: 'Order #FF-102', date: 'Oct 28', amount: '+₱1,250', amountColor: 'text-[#15803d]' },
    { icon: 'shopping_basket', iconBg: 'bg-secondary-container', iconColor: 'text-on-secondary-container', title: 'Order #FF-098', date: 'Oct 25', amount: '+₱850', amountColor: 'text-[#15803d]' },
    { icon: 'account_balance_wallet', iconBg: 'bg-error-container', iconColor: 'text-on-error-container', title: 'Payout to GCash', date: 'Oct 20', amount: '-₱15,000', amountColor: 'text-on-surface' },
  ];

  const activeOrders: MockOrder[] = [
    { id: 'FF-105', initials: 'AP', name: 'Ana P.', product: 'Bok Choy Bundle', amount: '₱450', status: 'Pending', statusBg: 'bg-surface-variant', statusColor: 'text-on-surface-variant' },
    { id: 'FF-104', initials: 'RM', name: 'Roberto M.', product: 'Premium Tomatoes', amount: '₱1,200', status: 'Confirmed', statusBg: 'bg-secondary-container', statusColor: 'text-on-secondary-container' },
  ];

  const completedOrders: MockOrder[] = [
    { id: 'FF-100', initials: 'LC', name: 'Luis C.', product: 'Organic Carrots', amount: '₱600', status: 'Delivered', statusBg: 'bg-secondary-container', statusColor: 'text-on-secondary-container' },
    { id: 'FF-099', initials: 'EG', name: 'Elena G.', product: 'Eggplant Box', amount: '₱850', status: 'Delivered', statusBg: 'bg-secondary-container', statusColor: 'text-on-secondary-container' },
  ];

  return (
    <>
      <FarmerHeader variant="default" />
      <main className="w-full px-[16px] flex-1 flex flex-col gap-[32px] pt-[16px] pb-24">
        
        {/* Tab selector */}
        <div className="flex bg-surface-container rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 text-center text-[14px] font-medium rounded-md transition-colors ${activeTab === 'active' ? 'text-on-primary bg-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            Active Orders
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 text-center text-[14px] font-medium rounded-md transition-colors ${activeTab === 'completed' ? 'text-on-primary bg-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            Completed
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
                  Oct 1 - Oct 31
                </button>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-[16px] shadow-[0_4px_20px_rgba(27,67,50,0.04)] flex flex-col gap-[8px]">
                <div className="text-[48px] font-bold leading-[1.1] tracking-[-0.02em] text-[#D97706]">₱42,800</div>
                <div className="text-[14px] font-medium text-on-surface-variant">
                  Ready for Payout: <span className="text-primary font-semibold">₱8,450</span>
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
              <h3 className="text-[20px] font-semibold mb-[8px]">Transaction History</h3>
              <div className="flex flex-col gap-[8px]">
                {transactions.map((txn, idx) => (
                  <div key={idx} className="flex items-center justify-between p-[8px] bg-surface-container-lowest rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${txn.iconBg} flex items-center justify-center ${txn.iconColor}`}>
                        <span className="material-symbols-outlined text-[16px]">{txn.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="text-[16px] text-on-surface">{txn.title}</div>
                        <div className="text-[12px] font-semibold text-on-surface-variant">{txn.date}</div>
                      </div>
                    </div>
                    <div className={`text-[16px] font-semibold ${txn.amountColor}`}>
                      {txn.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'active' && (
          <div className="flex flex-col gap-[8px]">
            {activeOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-[16px] bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(27,67,50,0.04)] mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-[14px] font-medium">
                    {order.initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium">{order.name}</p>
                    <p className="text-[12px] text-on-surface-variant mt-0.5">{order.product}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-medium mb-1">{order.amount}</p>
                  <span className={`${order.statusBg} ${order.statusColor} text-[12px] font-semibold tracking-[0.03em] px-2 py-0.5 rounded-full inline-block`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="flex flex-col gap-[8px]">
            {completedOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-[16px] bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(27,67,50,0.04)] mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-[14px] font-medium">
                    {order.initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium">{order.name}</p>
                    <p className="text-[12px] text-on-surface-variant mt-0.5">{order.product}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-medium mb-1">{order.amount}</p>
                  <span className={`${order.statusBg} ${order.statusColor} text-[12px] font-semibold tracking-[0.03em] px-2 py-0.5 rounded-full inline-block`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
      <FarmerBottomNav activePage="orders" />
    </>
  );
}
