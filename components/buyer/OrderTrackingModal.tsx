'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import type { OrderStatus, PaymentStatus } from '@prisma/client';
import type { OrderItemProp } from './OrderCard';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    totalAmount: number;
    deliveryFee: number;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: Date;
    items: OrderItemProp[];
    address: {
      fullName: string;
      phone: string;
      street: string;
      barangay: string;
      city: string;
      province: string;
    };
  };
}

const statusSteps = [
  { status: 'PENDING', label: 'Order Placed', description: 'We have received your order' },
  { status: 'CONFIRMED', label: 'Confirmed', description: 'Farmer is preparing your items' },
  { status: 'READY', label: 'Ready to Ship', description: 'Your order is out for delivery' },
  { status: 'DELIVERED', label: 'Delivered', description: 'Order has been completed' },
];

export default function OrderTrackingModal({ isOpen, onClose, order }: OrderTrackingModalProps) {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setIsRendered(false), 300);
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isRendered && !isOpen) return null;

  const currentStepIndex = order.orderStatus === 'CANCELLED' 
    ? -1 
    : statusSteps.findIndex(s => s.status === order.orderStatus);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className={`relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-transform duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-surface-variant bg-surface">
          <h2 className="font-display font-bold text-xl text-on-surface">Order Tracking</h2>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-8">
          
          {/* Order Details Header */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-on-surface">Order #{order.id.slice(0,8).toUpperCase()}</span>
              <span className="text-sm text-on-surface-variant">Placed on {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-bold text-primary">{formatCurrency(order.totalAmount)}</span>
              <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full mt-1 ${order.paymentStatus === 'PAID' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-800'}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-surface-container rounded-xl p-6 border border-surface-variant">
            <h3 className="font-bold text-sm text-on-surface-variant mb-6 uppercase tracking-wider">Tracking Status</h3>
            {order.orderStatus === 'CANCELLED' ? (
              <div className="flex items-center gap-4 text-red-600">
                <span className="material-symbols-outlined text-3xl">cancel</span>
                <div>
                  <div className="font-bold">Order Cancelled</div>
                  <div className="text-sm">This order was cancelled and will not be delivered.</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 relative">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-outline-variant"></div>
                {statusSteps.map((step, index) => {
                  const isCompleted = currentStepIndex >= index;
                  const isCurrent = currentStepIndex === index;
                  return (
                    <div key={step.status} className="flex gap-4 relative z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isCompleted ? 'bg-primary text-on-primary' : 'bg-surface-container-highest border border-outline-variant text-transparent'}`}>
                        {isCompleted && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                      </div>
                      <div className={`flex flex-col ${isCurrent ? 'text-on-surface' : isCompleted ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        <span className={`font-bold ${isCurrent ? 'text-primary' : ''}`}>{step.label}</span>
                        <span className="text-sm">{step.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="font-bold text-sm text-on-surface-variant mb-3 uppercase tracking-wider">Delivery Details</h3>
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-4 flex gap-4">
              <span className="material-symbols-outlined text-primary shrink-0">location_on</span>
              <div className="flex flex-col text-sm text-on-surface">
                <span className="font-bold">{order.address.fullName} • {order.address.phone}</span>
                <span className="text-on-surface-variant mt-1">{order.address.street}, {order.address.barangay}</span>
                <span className="text-on-surface-variant">{order.address.city}, {order.address.province}</span>
              </div>
            </div>
          </div>

          {/* Order Items Summary */}
          <div>
            <h3 className="font-bold text-sm text-on-surface-variant mb-3 uppercase tracking-wider">Order Items ({order.items.length})</h3>
            <div className="flex flex-col gap-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-surface-variant shrink-0">
                    {item.product.photos && item.product.photos.length > 0 ? (
                      <Image src={item.product.photos[0]} alt={item.product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-xs">image</span></div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="font-bold text-sm">{item.product.name}</span>
                    <span className="text-xs text-on-surface-variant">{item.quantityKg} kg &times; {formatCurrency(item.pricePerKg)}</span>
                  </div>
                  <span className="font-bold text-sm">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-surface-variant bg-surface flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-on-surface hover:bg-surface-variant transition-colors">
            Close
          </button>
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm">
            Buy Again
          </button>
        </div>

      </div>
    </div>
  );
}
