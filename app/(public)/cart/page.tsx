'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        <Navbar />
        <main className="flex-grow w-full max-w-[1280px] mx-auto px-[24px] py-[48px] flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </main>
        <Footer />
      </>
    );
  }

  const subtotal = total();
  const shipping = items.length > 0 ? 50 : 0; // Flat fee for demo
  const finalTotal = subtotal + shipping;

  return (
    <>
      <Navbar />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-[24px] py-[48px]">
        <h1 className="font-display text-[40px] font-bold text-on-background mb-[32px]">Your Harvest Cart</h1>
        
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[80px] bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm text-center">
            <span className="material-symbols-outlined text-[80px] text-primary/40 mb-[16px]">shopping_cart</span>
            <h2 className="font-h2 text-on-surface mb-2">Your cart is empty</h2>
            <p className="font-body-md text-on-surface-variant mb-6 max-w-[300px]">Looks like you haven't added any fresh produce yet.</p>
            <Link 
              href="/products" 
              className="bg-primary text-on-primary px-8 py-3 rounded-xl font-label-md hover:bg-primary/90 transition-colors shadow-sm"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-grow flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 p-4 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm hover:border-outline-variant transition-colors group">
                  {/* Image */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden relative flex-shrink-0 bg-surface-variant">
                    <Image 
                      src={item.photo} 
                      alt={item.name} 
                      fill 
                      className="object-cover"
                      sizes="(max-width: 640px) 96px, 128px"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link href={`/products/${item.productId}`} className="font-h3 text-on-surface hover:text-primary transition-colors line-clamp-1 sm:line-clamp-2">
                          {item.name}
                        </Link>
                        <div className="font-body-md text-on-surface-variant mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">person</span>
                          {item.farmerName}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeItem(item.productId)}
                        className="text-on-surface-variant hover:text-error transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden h-9 w-24 bg-surface-container-lowest">
                          <button 
                            onClick={() => updateQuantity(item.productId, Math.max(1, item.quantityKg - 1))}
                            className="w-8 h-full flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">remove</span>
                          </button>
                          <input
                            type="text"
                            value={item.quantityKg}
                            readOnly
                            className="flex-grow text-center h-full border-none focus:ring-0 font-label-md bg-transparent text-on-surface p-0 w-8 outline-none"
                          />
                          <button 
                            onClick={() => updateQuantity(item.productId, item.quantityKg + 1)}
                            className="w-8 h-full flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                          </button>
                        </div>
                        <span className="font-body-md text-on-surface-variant">kg</span>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-h3 text-primary">₱{(item.pricePerKg * item.quantityKg).toFixed(2)}</div>
                        <div className="font-body-sm text-on-surface-variant">₱{item.pricePerKg.toFixed(2)}/kg</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[380px] flex-shrink-0">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm sticky top-24">
                <h2 className="font-h2 text-on-surface mb-6 pb-4 border-b border-surface-variant">Order Summary</h2>
                
                <div className="flex flex-col gap-4 mb-6 text-on-surface">
                  <div className="flex justify-between">
                    <span className="font-body-md">Subtotal ({items.length} items)</span>
                    <span className="font-label-md">₱{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-body-md text-on-surface-variant">Delivery Fee</span>
                    <span className="font-label-md text-on-surface-variant">₱{shipping.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-surface-variant pt-4 mb-6">
                  <span className="font-h3 text-on-surface">Total</span>
                  <span className="font-h1 text-primary text-[28px]">₱{finalTotal.toFixed(2)}</span>
                </div>

                <Link 
                  href="/checkout"
                  className="w-full bg-primary text-on-primary font-label-md py-4 rounded-xl shadow-sm hover:opacity-90 transition-opacity active:scale-[0.98] flex justify-center items-center gap-2"
                >
                  <span className="material-symbols-outlined">credit_card</span>
                  Proceed to Checkout
                </Link>
                
                <p className="text-center font-body-sm text-on-surface-variant mt-4 flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  Secure Checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}