'use client';

import { useState } from 'react';
import { AdminOrder } from '@/types';

const mockOrders: AdminOrder[] = [
  {
    id: 'FF-1002',
    buyer: 'AgriCorp Holdings',
    farmer: 'Juan Dela Cruz',
    product: 'Premium Rice (50kg)',
    amount: 125000,
    payment: 'paid',
    status: 'in-transit',
    date: 'Oct 24, 2023',
    detail: {
      items: [{ name: 'Premium Rice (50kg)', qty: '100 Sacks @ ₱1,200/sack', subtotal: 120000 }],
      logistics: 5000,
      platformFee: 0,
      total: 125000,
      txnId: 'TXN-9823-XYZ-44',
      timeline: [
        { label: 'Order Placed', time: 'Oct 24, 08:30 AM', done: true },
        { label: 'Payment Confirmed', time: 'Oct 24, 09:15 AM', done: true },
        { label: 'In Transit', time: 'Expected Oct 26', active: true },
        { label: 'Delivered', time: '', done: false },
      ],
    },
  },
  {
    id: 'FF-1001',
    buyer: 'Metro Mart Inc.',
    farmer: 'Maria Santos',
    product: 'Sweet Corn (Box)',
    amount: 45500,
    payment: 'paid',
    status: 'delivered',
    date: 'Oct 23, 2023',
  },
  {
    id: 'FF-1000',
    buyer: 'Fresh Produce Co.',
    farmer: 'Pedro Penduko',
    product: 'Carabao Mangoes',
    amount: 89200,
    payment: 'pending',
    status: 'pending',
    date: 'Oct 23, 2023',
  },
  {
    id: 'FF-0999',
    buyer: 'Global Exports Ltd.',
    farmer: 'Luzviminda Reyes',
    product: 'Coconut Copra',
    amount: 210000,
    payment: 'paid',
    status: 'delivered',
    date: 'Oct 22, 2023',
  },
];

export default function OrdersOverviewPage() {
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(mockOrders[0]);

  return (
    <div className="flex-1 p-[40px] flex flex-col gap-[24px]">
      
      {/* PAGE HEADER */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="font-admin-h1 text-admin-h1 text-admin-on-background">Orders Overview</h2>
          <p className="font-admin-body-sm text-admin-on-surface-variant mt-1">Monitor all marketplace transactions and fulfillments.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-admin-surface-container-lowest border border-admin-outline-variant text-admin-on-surface px-4 py-2 rounded-lg font-admin-body-sm flex items-center gap-2 hover:bg-admin-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
          <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-admin-body-sm flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Manual Order
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-admin-surface-container-lowest p-[16px] rounded-xl border border-admin-outline-variant flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1">
          <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant">Date Range</span>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-admin-outline-variant">calendar_today</span>
            <input type="text" readOnly value="Oct 1, 2023 - Oct 31, 2023" className="border border-admin-outline-variant rounded-lg pl-9 pr-3 py-1.5 font-admin-body-sm bg-admin-surface-container-lowest text-admin-on-surface outline-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant">Payment Status</span>
          <select className="border border-admin-outline-variant rounded-lg px-3 py-1.5 font-admin-body-sm bg-admin-surface-container-lowest text-admin-on-surface outline-none">
            <option>All</option>
            <option>Paid</option>
            <option>Pending</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant">Order Status</span>
          <select className="border border-admin-outline-variant rounded-lg px-3 py-1.5 font-admin-body-sm bg-admin-surface-container-lowest text-admin-on-surface outline-none">
            <option>All</option>
            <option>Delivered</option>
            <option>In Transit</option>
            <option>Pending</option>
          </select>
        </div>

        <div className="flex-1"></div>

        <button className="text-primary font-admin-body-sm font-medium flex items-center gap-1 hover:underline">
          <span className="material-symbols-outlined text-[18px]">tune</span>
          More Filters
        </button>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex gap-[20px] items-start">
        
        {/* LEFT — DATA TABLE */}
        <div className="flex-1 bg-admin-surface-container-lowest rounded-xl border border-admin-outline-variant overflow-hidden flex flex-col">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-admin-surface border-b border-admin-outline-variant">
                <tr>
                  {['Order ID', 'Buyer', 'Farmer', 'Product'].map(h => (
                    <th key={h} className="py-[8px] px-[16px] font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                  <th className="py-[8px] px-[16px] font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase tracking-wider text-right">Amount (₱)</th>
                  {['Payment', 'Status', 'Date'].map(h => (
                    <th key={h} className="py-[8px] px-[16px] font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-admin-table-data text-admin-table-data text-admin-on-surface">
                {mockOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className={`border-b border-admin-outline-variant/50 hover:bg-[#F1F5F9] cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-admin-surface-container' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-3 px-[16px] font-medium text-primary">{order.id}</td>
                    <td className="py-3 px-[16px]">{order.buyer}</td>
                    <td className="py-3 px-[16px]">{order.farmer}</td>
                    <td className="py-3 px-[16px]">{order.product}</td>
                    <td className="py-3 px-[16px] text-right font-medium">₱{order.amount.toLocaleString()}</td>
                    <td className="py-3 px-[16px]">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full font-admin-label-caps text-[10px] uppercase ${order.payment === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {order.payment}
                      </span>
                    </td>
                    <td className="py-3 px-[16px]">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full font-admin-label-caps text-[10px] uppercase ${
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 
                        order.status === 'in-transit' ? 'bg-blue-100 text-blue-800' : 
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-[16px] text-admin-on-surface-variant">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="bg-admin-surface-container-lowest border-t border-admin-outline-variant py-[8px] px-[16px] flex items-center justify-between">
            <span className="font-admin-body-sm text-admin-on-surface-variant">Showing 1 to 4 of 1,240 entries</span>
            <div className="flex gap-1">
              <button className="p-1 rounded hover:bg-admin-surface-variant text-admin-on-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="p-1 rounded hover:bg-admin-surface-variant text-admin-on-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — DETAIL PANEL */}
        {selectedOrder && (
          <div className="w-96 sticky top-24 bg-admin-surface-container-lowest rounded-xl border border-admin-outline-variant shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] flex flex-col">
            
            <div className="p-[16px] border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface rounded-t-xl">
              <div>
                <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Order Details</h3>
                <div className="font-admin-body-sm text-primary font-medium">{selectedOrder.id}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-admin-on-surface-variant hover:bg-admin-surface-container p-1 rounded-full transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-[16px] flex flex-col gap-[24px] overflow-y-auto max-h-[calc(100vh-200px)]">
              
              {/* FULFILLMENT TIMELINE */}
              <div>
                <h4 className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase mb-4">Fulfillment Status</h4>
                <div className="flex flex-col relative pl-4">
                  <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-admin-outline-variant/30"></div>
                  {(selectedOrder.detail?.timeline || [
                    { label: 'Order Placed', time: selectedOrder.date, done: true },
                    { label: 'Payment Confirmed', time: '', done: false },
                    { label: 'In Transit', time: '', done: false },
                    { label: 'Delivered', time: '', done: false },
                  ]).map((step, idx) => (
                    <div key={idx} className="relative flex gap-4 pb-4 last:pb-0">
                      <div className={`w-3 h-3 rounded-full mt-1 z-10 border-2 border-admin-surface-container-lowest flex-shrink-0 ${step.done ? 'bg-primary' : step.active ? 'bg-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]' : 'bg-admin-outline-variant'}`}></div>
                      <div>
                        <div className={`font-admin-body-sm font-medium ${step.done || step.active ? 'text-admin-on-surface' : 'text-admin-outline-variant'}`}>{step.label}</div>
                        <div className="font-admin-table-data text-admin-on-surface-variant">{step.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ENTITIES */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-admin-surface p-[8px] rounded-lg border border-admin-outline-variant/50">
                  <div className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase mb-1">Buyer</div>
                  <div className="font-admin-body-sm font-medium text-admin-on-surface truncate">{selectedOrder.buyer}</div>
                  <a href="#" className="font-admin-table-data text-primary hover:underline">View Profile</a>
                </div>
                <div className="bg-admin-surface p-[8px] rounded-lg border border-admin-outline-variant/50">
                  <div className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase mb-1">Farmer</div>
                  <div className="font-admin-body-sm font-medium text-admin-on-surface truncate">{selectedOrder.farmer}</div>
                  <a href="#" className="font-admin-table-data text-primary hover:underline">View Farm</a>
                </div>
              </div>

              {/* PRICE BREAKDOWN */}
              <div>
                <h4 className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase mb-2">Price Breakdown</h4>
                <div className="bg-admin-surface-container-low rounded-lg p-[16px] border border-admin-outline-variant/50 flex flex-col gap-3">
                  
                  {(selectedOrder.detail?.items || [{ name: selectedOrder.product, qty: '1 unit', subtotal: selectedOrder.amount }]).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div>
                        <div className="font-admin-body-sm font-medium text-admin-on-surface">{item.name}</div>
                        <div className="font-admin-table-data text-admin-on-surface-variant">{item.qty}</div>
                      </div>
                      <div className="font-admin-body-sm text-admin-on-surface">₱{item.subtotal.toLocaleString()}</div>
                    </div>
                  ))}
                  
                  <div className="w-full h-px bg-admin-outline-variant/50"></div>
                  
                  <div className="flex justify-between">
                    <span className="font-admin-table-data text-admin-on-surface-variant">Subtotal</span>
                    <span className="font-admin-table-data text-admin-on-surface-variant">₱{(selectedOrder.detail?.items.reduce((acc, i) => acc + i.subtotal, 0) || selectedOrder.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-admin-table-data text-admin-on-surface-variant">Logistics</span>
                    <span className="font-admin-table-data text-admin-on-surface-variant">₱{(selectedOrder.detail?.logistics || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-admin-table-data text-admin-on-surface-variant">Platform Fee</span>
                    <span className="font-admin-table-data text-admin-on-surface-variant">₱{(selectedOrder.detail?.platformFee || 0).toLocaleString()}</span>
                  </div>

                  <div className="w-full h-px bg-admin-outline-variant/50"></div>

                  <div className="flex justify-between items-center">
                    <span className="font-admin-body-sm font-semibold text-admin-on-surface">Total</span>
                    <span className="font-admin-h3 text-admin-h3 text-primary">₱{(selectedOrder.detail?.total || selectedOrder.amount).toLocaleString()}</span>
                  </div>

                </div>
              </div>

              {/* PAYMENT INFO */}
              <div>
                <h4 className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase mb-2">Payment Information</h4>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="material-symbols-outlined text-emerald-600">verified_user</span>
                  <div>
                    <div className="font-admin-body-sm font-medium text-emerald-900">
                      {selectedOrder.payment === 'paid' ? 'Payment Confirmed' : 'Payment Pending'}
                    </div>
                    <div className="font-admin-table-data text-emerald-700 font-mono text-xs">
                      {selectedOrder.detail?.txnId || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-[16px] border-t border-admin-outline-variant bg-admin-surface rounded-b-xl flex gap-3">
              <button className="flex-1 border border-admin-outline-variant bg-admin-surface-container-lowest text-admin-on-surface rounded-lg font-admin-body-sm py-2 hover:bg-admin-surface-variant transition-colors">
                Contact Parties
              </button>
              <button className="flex-1 bg-primary text-on-primary rounded-lg font-admin-body-sm py-2 hover:bg-primary/90 transition-colors">
                Update Status
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
