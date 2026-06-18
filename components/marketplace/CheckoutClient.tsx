'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { createOrderAction } from '@/app/actions/orders';
import { createAddressAction } from '@/app/actions/addresses';
import toast from 'react-hot-toast';
import { PaymentMethod } from '@/types';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  zipCode: string | null;
  isDefault: boolean;
}

export default function CheckoutClient({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const { selectedItems, clearCart, items } = useCartStore();

  // Use selected items if any, otherwise fall back to all items
  const checkoutItems = selectedItems().length > 0 ? selectedItems() : items;

  const [paymentMethod, setPaymentMethod] = useState<string>('gcash');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find(a => a.isDefault)?.id || addresses[0]?.id || ''
  );

  const [isNewAddress, setIsNewAddress] = useState(addresses.length === 0);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.pricePerKg * item.quantityKg, 0);
  const deliveryFee = 50;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (checkoutItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const notes = formData.get('notes') as string;

    startTransition(async () => {
      let finalAddressId = selectedAddressId;

      // Create new address if requested
      if (isNewAddress) {
        const addressResult = await createAddressAction({ success: false, error: '' }, formData);
        if (!addressResult.success) {
          toast.error(addressResult.error || 'Failed to save address');
          return;
        }
        if (!addressResult.data?.id) {
          toast.error('Failed to save address');
          return;
        }
        finalAddressId = addressResult.data.id as string;
      }

      if (!finalAddressId) {
        toast.error('Please select or add a delivery address');
        return;
      }

      // Create Order
      const orderFormData = new FormData();
      orderFormData.append('addressId', finalAddressId);
      orderFormData.append('items', JSON.stringify(checkoutItems.map(i => ({ productId: i.productId, quantityKg: i.quantityKg }))));

      if (notes) orderFormData.append('notes', notes);

      try {
        const result = await createOrderAction({ success: false, error: '' }, orderFormData);
        if (result && !result.success) {
          toast.error((result as any).error || 'Failed to place order');
        } else {
          clearCart();
          toast.success('Order placed successfully!');
        }
      } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') {
          clearCart();
        } else {
          toast.error('Something went wrong');
        }
      }
    });
  };

  if (!mounted) {
    return (
      <div className="flex justify-center items-center py-20 w-full min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="text-center py-20 bg-surface-container-lowest rounded-xl shadow-sm">
        <span className="material-symbols-outlined text-[64px] text-primary/40 mb-4">shopping_cart</span>
        <h2 className="font-h2 text-on-surface mb-2">Your cart is empty</h2>
        <Link href="/products" className="inline-block mt-4 bg-primary text-on-primary px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* LEFT COLUMN */}
      <div className="lg:col-span-8 flex flex-col gap-[32px]">

        {/* SECTION 1: DELIVERY DETAILS */}
        <div className="bg-surface-container-lowest rounded-xl p-[24px] md:p-[32px] shadow-level-1">
          <div className="flex justify-between items-center mb-[16px]">
            <h2 className="flex items-center gap-2 font-['Manrope'] text-[24px] font-semibold tracking-[-0.01em] text-primary">
              <span className="material-symbols-outlined text-secondary">local_shipping</span>
              Delivery Details
            </h2>
            {addresses.length > 0 && !isNewAddress && (
              <button type="button" onClick={() => setIsNewAddress(true)} className="text-primary hover:underline font-label-md">
                + New Address
              </button>
            )}
          </div>

          {addresses.length > 0 && !isNewAddress ? (
            <div className="flex flex-col gap-4">
              {addresses.map(address => (
                <label key={address.id} className={`flex gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${selectedAddressId === address.id ? 'border-primary bg-primary-container/10' : 'border-outline-variant hover:border-primary'}`}>
                  <input type="radio" name="existingAddress" checked={selectedAddressId === address.id} onChange={() => setSelectedAddressId(address.id)} className="mt-1 accent-primary" />
                  <div>
                    <div className="font-label-md text-on-surface">{address.fullName} • {address.phone}</div>
                    <div className="font-body-md text-on-surface-variant mt-1">
                      {address.street}, {address.barangay}, {address.city}, {address.province} {address.zipCode}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <div className="flex flex-col gap-[8px] md:col-span-2">
                <label className="text-[14px] font-medium tracking-[0.01em] text-on-surface-variant">Full Name *</label>
                <input required name="fullName" type="text" placeholder="Enter your full name" className="bg-background border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 font-body-md text-on-surface transition-colors placeholder:text-outline outline-none" />
              </div>
              <div className="flex flex-col gap-[8px] md:col-span-2">
                <label className="text-[14px] font-medium tracking-[0.01em] text-on-surface-variant">Contact Number *</label>
                <input required name="phone" type="tel" placeholder="e.g. 09123456789" className="bg-background border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 font-body-md text-on-surface transition-colors placeholder:text-outline outline-none" />
              </div>
              <div className="flex flex-col gap-[8px] md:col-span-2">
                <label className="text-[14px] font-medium tracking-[0.01em] text-on-surface-variant">Street Address *</label>
                <input required name="street" type="text" placeholder="House number, street name" className="bg-background border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 font-body-md text-on-surface transition-colors placeholder:text-outline outline-none" />
              </div>
              <div className="flex flex-col gap-[8px] col-span-1">
                <label className="text-[14px] font-medium tracking-[0.01em] text-on-surface-variant">Barangay *</label>
                <input required name="barangay" type="text" className="bg-background border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 font-body-md text-on-surface transition-colors placeholder:text-outline outline-none" />
              </div>
              <div className="flex flex-col gap-[8px] col-span-1">
                <label className="text-[14px] font-medium tracking-[0.01em] text-on-surface-variant">City / Municipality *</label>
                <input required name="city" type="text" defaultValue="Agoo" className="bg-background border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 font-body-md text-on-surface transition-colors placeholder:text-outline outline-none" />
              </div>
              <input type="hidden" name="province" value="La Union" />
              <input type="hidden" name="isDefault" value="true" />

              {addresses.length > 0 && (
                <button type="button" onClick={() => setIsNewAddress(false)} className="mt-2 text-on-surface-variant underline md:col-span-2 text-left">Cancel</button>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: PAYMENT METHOD */}
        <div className="bg-surface-container-lowest rounded-xl p-[24px] md:p-[32px] shadow-level-1">
          <h2 className="flex items-center gap-2 font-['Manrope'] text-[24px] font-semibold tracking-[-0.01em] text-primary mb-[16px]">
            <span className="material-symbols-outlined text-secondary">payments</span>
            Payment Method
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[8px]">
            {[
              { id: 'cod', title: 'Cash on Delivery', subtitle: 'Pay when it arrives' },
              { id: 'gcash', title: 'GCash', subtitle: 'Instant payment (Phase 6)' },
            ].map((method) => {
              const isSelected = paymentMethod === method.id;
              return (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                  className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary ring-1 ring-primary bg-primary-container/5'
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
          {paymentMethod !== 'cod' && (
            <p className="mt-4 text-sm text-error">Only Cash on Delivery is supported right now. Digital payments will be added in Phase 6.</p>
          )}
        </div>

        {/* SECTION 3: NOTES */}
        <div className="bg-surface-container-lowest rounded-xl p-[24px] md:p-[32px] shadow-level-1">
          <label className="flex items-center gap-2 font-['Manrope'] text-[20px] font-semibold tracking-[-0.01em] text-primary mb-[16px]">
            <span className="material-symbols-outlined text-secondary">note_alt</span>
            Delivery Notes (Optional)
          </label>
          <textarea name="notes" rows={2} placeholder="Landmarks, preferred delivery time, etc." className="w-full bg-background border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 font-body-md text-on-surface transition-colors placeholder:text-outline outline-none resize-none"></textarea>
        </div>

      </div>

      {/* RIGHT COLUMN - READ-ONLY ORDER SUMMARY */}
      <div className="lg:col-span-4 relative">
        <div className="sticky top-[100px] bg-surface-container-lowest rounded-xl p-[24px] md:p-[32px] shadow-level-1 flex flex-col gap-[24px]">

          <div className="flex items-center justify-between border-b border-surface-variant pb-[16px]">
            <div className="font-['Manrope'] text-[20px] font-semibold text-primary">
              Order Review
            </div>
            <Link
              href="/cart"
              className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">edit</span>
              Edit Cart
            </Link>
          </div>

          {/* Read-only item list */}
          <div className="flex flex-col gap-[12px] max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
            {checkoutItems.map(item => (
              <div key={item.productId} className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container relative border border-surface-variant">
                  <Image src={item.photo} alt={item.name} fill className="object-cover" sizes="48px" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="font-medium text-on-surface text-sm line-clamp-1">{item.name}</div>
                  <div className="text-on-surface-variant text-xs">
                    {item.quantityKg} kg × ₱{item.pricePerKg.toFixed(2)}
                  </div>
                </div>
                <div className="font-semibold text-primary text-sm flex-shrink-0">
                  ₱{(item.pricePerKg * item.quantityKg).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-[8px] border-t border-surface-variant pt-[16px]">
            <div className="flex justify-between font-body-md text-on-surface-variant">
              <span>Subtotal ({checkoutItems.length} item{checkoutItems.length !== 1 ? 's' : ''})</span>
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

          <div>
            <button
              type="submit"
              disabled={isPending || paymentMethod !== 'cod' || (!isNewAddress && !selectedAddressId)}
              className="w-full bg-[#d97706] hover:bg-[#b45309] disabled:opacity-50 disabled:cursor-not-allowed text-white font-label-md text-label-md py-4 rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              {isPending ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">lock</span>
              )}
              {isPending ? 'Processing...' : 'Place Order'}
            </button>
            <div className="flex items-center justify-center gap-1 mt-[8px] font-body-md text-on-surface-variant text-xs text-center">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              Secure Checkout
            </div>
          </div>

        </div>
      </div>

    </form>
  );
}
