'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/store/cartStore';
import { CheckoutForm, PaymentMethod } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    address: '',
    city: 'Agoo',
    contact: '',
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.pricePerKg * item.quantityKg, 0);
  const deliveryFee = 50;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!form.fullName || !form.address || !form.contact) {
      alert('Please fill in all delivery details.');
      return;
    }
    setIsPlacingOrder(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    clearCart();
    router.push('/order-confirmation');
  };

  const handleQuantityDecrement = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    } else {
      removeItem(productId);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-[24px] py-[32px]">
        <h1 className="font-['Manrope'] text-[32px] font-bold tracking-[-0.01em] text-on-background mb-[32px]">
          Checkout
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 flex flex-col gap-[32px]">
            
            {/* SECTION 1: DELIVERY DETAILS */}
            <div className="bg-surface-container-lowest rounded-xl p-[24px] md:p-[32px] shadow-level-1">
              <h2 className="flex items-center gap-2 font-['Manrope'] text-[24px] font-semibold tracking-[-0.01em] text-primary mb-[16px]">
                <span className="material-symbols-outlined text-secondary">local_shipping</span>
                Delivery Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                <div className="flex flex-col gap-[8px] md:col-span-2">
                  <label className="text-[14px] font-medium tracking-[0.01em] text-on-surface-variant">Full Name</label>
                  <input 
                    type="text" 
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="bg-background border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 font-body-md text-on-surface transition-colors placeholder:text-outline outline-none"
                  />
                </div>
                
                <div className="flex flex-col gap-[8px] md:col-span-2">
                  <label className="text-[14px] font-medium tracking-[0.01em] text-on-surface-variant">Delivery Address</label>
                  <input 
                    type="text" 
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Street name, house number, barangay"
                    className="bg-background border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 font-body-md text-on-surface transition-colors placeholder:text-outline outline-none"
                  />
                </div>

                <div className="flex flex-col gap-[8px] col-span-1">
                  <label className="text-[14px] font-medium tracking-[0.01em] text-on-surface-variant">City / Municipality</label>
                  <input 
                    type="text" 
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="bg-background border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 font-body-md text-on-surface transition-colors placeholder:text-outline outline-none"
                  />
                </div>

                <div className="flex flex-col gap-[8px] col-span-1">
                  <label className="text-[14px] font-medium tracking-[0.01em] text-on-surface-variant">Contact Number</label>
                  <input 
                    type="tel" 
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    placeholder="e.g. 0912 345 6789"
                    className="bg-background border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 font-body-md text-on-surface transition-colors placeholder:text-outline outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: PAYMENT METHOD */}
            <div className="bg-surface-container-lowest rounded-xl p-[24px] md:p-[32px] shadow-level-1">
              <h2 className="flex items-center gap-2 font-['Manrope'] text-[24px] font-semibold tracking-[-0.01em] text-primary mb-[16px]">
                <span className="material-symbols-outlined text-secondary">payments</span>
                Payment Method
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[8px]">
                {[
                  { id: 'gcash', title: 'GCash', subtitle: 'Instant payment' },
                  { id: 'maya', title: 'Maya', subtitle: 'Digital wallet' },
                  { id: 'card', title: 'Credit / Debit', subtitle: 'Visa, Mastercard' }
                ].map((method) => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <div 
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                      className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-primary ring-1 ring-primary bg-background' 
                          : 'border border-outline-variant bg-background hover:border-secondary'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-body-md font-semibold text-on-surface">{method.title}</span>
                        <span className="text-[12px] text-on-surface-variant">{method.subtitle}</span>
                      </div>
                      <span 
                        className={`material-symbols-outlined ${isSelected ? 'text-primary' : 'text-transparent'}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-[100px] bg-surface-container-lowest rounded-xl p-[24px] md:p-[32px] shadow-level-1 flex flex-col gap-[24px]">
              
              {/* ORDER SUMMARY HEADER */}
              <div className="font-['Manrope'] text-[24px] font-semibold text-primary border-b border-surface-variant pb-[16px]">
                Order Summary
              </div>

              {/* CART ITEMS LIST */}
              <div className="flex flex-col gap-[16px]">
                {items.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-on-surface-variant mb-4">Your cart is empty.</p>
                    <Link href="/products" className="text-primary hover:underline font-label-md">
                      Browse Marketplace
                    </Link>
                  </div>
                ) : (
                  items.map(item => (
                    <div key={item.productId} className="flex gap-4 items-start">
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container relative">
                        <Image src={item.photo} alt={item.name} fill className="object-cover" sizes="80px" />
                      </div>
                      
                      <div className="flex-grow flex flex-col justify-between h-20 py-1">
                        <div>
                          <div className="font-label-md text-on-surface line-clamp-1">{item.name}</div>
                          <div className="font-body-md text-on-surface-variant text-sm">
                            ₱{item.pricePerKg.toFixed(2)} / kg
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 bg-surface-variant rounded-full px-2 py-1">
                            <button 
                              onClick={() => handleQuantityDecrement(item.productId, item.quantityKg)}
                              className="w-6 h-6 flex items-center justify-center text-on-surface hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">remove</span>
                            </button>
                            <span className="font-label-md w-4 text-center">{item.quantityKg}</span>
                            <button 
                              onClick={() => updateQuantity(item.productId, item.quantityKg + 1)}
                              className="w-6 h-6 flex items-center justify-center text-on-surface hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">add</span>
                            </button>
                          </div>
                          
                          <div className="font-label-md text-primary">
                            ₱{(item.pricePerKg * item.quantityKg).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* TOTALS BLOCK */}
              <div className="flex flex-col gap-[8px] border-t border-surface-variant pt-[16px]">
                <div className="flex justify-between font-body-md text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body-md text-on-surface-variant">
                  <span>Delivery Fee</span>
                  <span>₱{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-['Manrope'] text-[20px] font-semibold text-primary mt-[8px] pt-[8px] border-t border-surface-container">
                  <span>Total</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
              </div>

              {/* PLACE ORDER BUTTON */}
              <div>
                <button
                  disabled={isPlacingOrder || items.length === 0}
                  onClick={handlePlaceOrder}
                  className="w-full bg-[#d97706] hover:bg-[#b45309] disabled:opacity-50 disabled:cursor-not-allowed text-white font-label-md text-label-md py-4 rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                  {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                </button>
                <div className="flex items-center justify-center gap-1 mt-[8px] font-body-md text-on-surface-variant text-xs text-center">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span>
                  Secure Checkout
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}