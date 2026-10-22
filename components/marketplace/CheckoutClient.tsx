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
import { AGOO_BARANGAYS } from '@/lib/constants/locations';

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

  // Requirement 2: Wholesale Contract / Scheduled Recurring Delivery State
  const [orderMode, setOrderMode] = useState<'STANDARD' | 'WHOLESALE_CONTRACT'>('STANDARD');
  const [deliveryScheduleDay, setDeliveryScheduleDay] = useState<string>('Every Saturday');
  const [contractWeeks, setContractWeeks] = useState<number>(4);

  const [isNewAddress, setIsNewAddress] = useState(addresses.length === 0);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isContract = orderMode === 'WHOLESALE_CONTRACT';
  const weeks = isContract ? contractWeeks : 1;

  // Helper for computing item price with wholesale / contract discount
  const getItemEffectivePrice = (item: any) => {
    if (item.wholesalePrice && item.wholesaleMinQty && item.quantityKg >= item.wholesaleMinQty) {
      return Number(item.wholesalePrice);
    }
    if (isContract) {
      if (item.wholesalePrice) return Number(item.wholesalePrice);
      // 5% produce discount for recurring wholesale contract
      return Math.round(item.pricePerKg * 0.95 * 100) / 100;
    }
    return item.pricePerKg;
  };

  const subtotalPerDelivery = checkoutItems.reduce(
    (sum, item) => sum + getItemEffectivePrice(item) * item.quantityKg,
    0
  );
  const deliveryFeePerDelivery = 50;
  const totalProduceAmount = subtotalPerDelivery * weeks;
  const totalDeliveryFee = deliveryFeePerDelivery * weeks;
  const total = totalProduceAmount + totalDeliveryFee;

  const getFirstDeliveryDate = (scheduleDay: string) => {
    const dayMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
    const targetDayName = scheduleDay.replace('Every ', '').trim();
    const targetDay = dayMap[targetDayName] ?? 6;
    const now = new Date();
    const currentDay = now.getDay();
    let diff = (targetDay - currentDay + 7) % 7;
    if (diff === 0) diff = 7;
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + diff);
    return nextDate;
  };

  const hasOutOfStockItems = checkoutItems.some(
    (i) => i.stockKg <= 0 || i.quantityKg > i.stockKg
  );

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (checkoutItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (hasOutOfStockItems) {
      toast.error('One or more items in your cart exceed available stock. Please return to cart.');
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
      orderFormData.append('paymentMethod', paymentMethod);
      orderFormData.append('items', JSON.stringify(checkoutItems.map(i => ({ productId: i.productId, quantityKg: i.quantityKg }))));
      orderFormData.append('orderType', orderMode);
      orderFormData.append('isContract', isContract.toString());
      if (isContract) {
        orderFormData.append('deliveryScheduleDay', deliveryScheduleDay);
        orderFormData.append('contractWeeks', contractWeeks.toString());
      }

      if (notes) orderFormData.append('notes', notes);

      try {
        const result = await createOrderAction({ success: false, error: '' }, orderFormData);
        if (result && !result.success) {
          toast.error((result as any).error || 'Failed to place order');
        } else {
          clearCart();
          toast.success(isContract ? 'Wholesale contract created successfully!' : 'Order placed successfully!');
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

  const firstDeliveryDate = getFirstDeliveryDate(deliveryScheduleDay);
  const formattedFirstDelivery = firstDeliveryDate.toLocaleDateString('en-PH', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* LEFT COLUMN */}
      <div className="lg:col-span-8 flex flex-col gap-[32px]">

        {/* SECTION 1: ORDER MODE / PURCHASE TYPE */}
        <div className="bg-surface-container-lowest rounded-xl p-[24px] md:p-[32px] shadow-level-1">
          <div className="mb-[16px]">
            <h2 className="flex items-center gap-2 font-['Manrope'] text-[24px] font-semibold tracking-[-0.01em] text-primary">
              <span className="material-symbols-outlined text-secondary">handshake</span>
              Order Mode & Fulfillment
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Select whether you are placing a standard one-time delivery or setting up a recurring wholesale contract.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard Mode Card */}
            <div
              onClick={() => setOrderMode('STANDARD')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                orderMode === 'STANDARD'
                  ? 'border-primary bg-primary-container/10 ring-2 ring-primary/20 shadow-sm'
                  : 'border-outline-variant bg-surface-container-lowest hover:border-outline'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[24px]">local_shipping</span>
                    <span className="font-['Manrope'] font-bold text-on-surface text-[17px]">Standard Order</span>
                  </div>
                  <span
                    className={`material-symbols-outlined ${orderMode === 'STANDARD' ? 'text-primary' : 'text-outline/40'}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {orderMode === 'STANDARD' ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-secondary mb-2">One-Time Delivery</div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Regular single delivery for everyday fresh farm produce dispatched directly from our verified local farmers.
                </p>
              </div>
            </div>

            {/* Wholesale Contract Mode Card */}
            <div
              onClick={() => setOrderMode('WHOLESALE_CONTRACT')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                orderMode === 'WHOLESALE_CONTRACT'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 shadow-sm'
                  : 'border-outline-variant bg-surface-container-lowest hover:border-emerald-500/50'
              }`}
            >
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg uppercase tracking-wider">
                Wholesale
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-700 text-[24px]">event_repeat</span>
                    <span className="font-['Manrope'] font-bold text-on-surface text-[17px]">Wholesale Contract</span>
                  </div>
                  <span
                    className={`material-symbols-outlined ${orderMode === 'WHOLESALE_CONTRACT' ? 'text-emerald-700' : 'text-outline/40'}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {orderMode === 'WHOLESALE_CONTRACT' ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-2">
                  One-Time Full Payment • Weekly Deliveries
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Pay once upfront for the entire contract. Fresh produce will be delivered to you weekly on your chosen day (e.g., Every Saturday). Includes contract savings.
                </p>
              </div>
            </div>
          </div>

          {/* Wholesale Contract Options (Accordion / Dropdown when active) */}
          {isContract && (
            <div className="mt-6 pt-6 border-t border-emerald-200/80 bg-emerald-50/40 -mx-[24px] md:-mx-[32px] -mb-[24px] md:-mb-[32px] p-[24px] md:p-[32px] rounded-b-xl flex flex-col gap-5">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                <span className="material-symbols-outlined text-emerald-700">settings_suggest</span>
                Customize Your Wholesale Delivery Schedule
              </div>

              {/* Delivery Day Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
                  Choose Weekly Delivery Day:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {[
                    { day: 'Every Saturday', label: 'Sat (Weekend)' },
                    { day: 'Every Sunday', label: 'Sun (Weekend)' },
                    { day: 'Every Monday', label: 'Mon (Start)' },
                    { day: 'Every Wednesday', label: 'Wed (Midweek)' },
                    { day: 'Every Friday', label: 'Fri (Pre-Weekend)' },
                  ].map(({ day, label }) => {
                    const isSelected = deliveryScheduleDay === day;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setDeliveryScheduleDay(day)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm font-semibold'
                            : 'bg-white text-on-surface border-outline-variant hover:border-emerald-600'
                        }`}
                      >
                        <div className="text-[13px]">{day.replace('Every ', '')}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-on-surface-variant'}`}>{label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contract Duration Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
                  Contract Duration (Total Weekly Deliveries):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { weeks: 2, label: '2 Weeks', desc: '2 Weekly Deliveries' },
                    { weeks: 4, label: '4 Weeks / 1 Month', desc: '4 Weekly Deliveries (Most Popular)' },
                    { weeks: 8, label: '8 Weeks / 2 Months', desc: '8 Weekly Deliveries' },
                  ].map((tier) => {
                    const isSelected = contractWeeks === tier.weeks;
                    return (
                      <button
                        key={tier.weeks}
                        type="button"
                        onClick={() => setContractWeeks(tier.weeks)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                            : 'bg-white text-on-surface border-outline-variant hover:border-emerald-600'
                        }`}
                      >
                        <div className="font-bold text-sm">{tier.label}</div>
                        <div className={`text-xs mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-on-surface-variant'}`}>
                          {tier.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Preview Banner */}
              <div className="bg-white/90 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-950">
                <span className="material-symbols-outlined text-emerald-700 text-[20px] shrink-0 mt-0.5">calendar_month</span>
                <div>
                  <div className="font-semibold text-emerald-900">
                    Schedule: {deliveryScheduleDay} for {contractWeeks} consecutive weeks
                  </div>
                  <div className="text-emerald-800/80 mt-0.5">
                    First batch delivery: <span className="font-bold underline">{formattedFirstDelivery}</span>. The farmer will prepare your harvest weekly and notify you on each drop.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: DELIVERY DETAILS */}
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
                <div className="relative">
                  <select
                    required
                    name="barangay"
                    defaultValue=""
                    className="w-full appearance-none bg-background border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 pr-10 font-body-md text-on-surface transition-colors outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select Barangay</option>
                    {AGOO_BARANGAYS.map((brgy) => (
                      <option key={brgy} value={brgy}>
                        {brgy}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-outline">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </div>
                </div>
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

        {/* SECTION 3: PAYMENT METHOD */}
        <div className="bg-surface-container-lowest rounded-xl p-[24px] md:p-[32px] shadow-level-1">
          <h2 className="flex items-center gap-2 font-['Manrope'] text-[24px] font-semibold tracking-[-0.01em] text-primary mb-[16px]">
            <span className="material-symbols-outlined text-secondary">payments</span>
            Payment Method
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
            {[
              { id: 'gcash', title: 'GCash / Online (PayMongo)', subtitle: isContract ? 'Pay entire contract upfront' : 'Instant digital payment' },
              { id: 'cod', title: 'Cash on Delivery (COD)', subtitle: isContract ? 'Pay in full upon 1st delivery' : 'Pay when it arrives' },
            ].map((method) => {
              const isSelected = paymentMethod === method.id;
              return (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-primary-container/10 border-2'
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

        {/* SECTION 4: NOTES */}
        <div className="bg-surface-container-lowest rounded-xl p-[24px] md:p-[32px] shadow-level-1">
          <label className="flex items-center gap-2 font-['Manrope'] text-[20px] font-semibold tracking-[-0.01em] text-primary mb-[16px]">
            <span className="material-symbols-outlined text-secondary">note_alt</span>
            Delivery Notes (Optional)
          </label>
          <textarea name="notes" rows={2} placeholder="Landmarks, preferred gate, instructions for weekly batches, etc." className="w-full bg-background border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 font-body-md text-on-surface transition-colors placeholder:text-outline outline-none resize-none"></textarea>
        </div>

      </div>

      {/* RIGHT COLUMN - READ-ONLY ORDER SUMMARY */}
      <div className="lg:col-span-4 relative">
        <div className="sticky top-[100px] bg-surface-container-lowest rounded-xl p-[24px] md:p-[32px] shadow-level-1 flex flex-col gap-[20px]">

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

          {/* Wholesale Contract Summary Callout */}
          {isContract && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs flex flex-col gap-1.5 text-emerald-950">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 uppercase tracking-wider text-[11px]">
                <span className="material-symbols-outlined text-[16px] text-emerald-700">event_repeat</span>
                Wholesale Recurring Delivery
              </div>
              <div>
                <strong>Schedule:</strong> {deliveryScheduleDay}
              </div>
              <div>
                <strong>Contract Duration:</strong> {contractWeeks} Weekly Batches
              </div>
              <div className="text-[11px] text-emerald-700">
                Produce is fresh-harvested and delivered weekly.
              </div>
            </div>
          )}

          {/* Read-only item list */}
          <div className="flex flex-col gap-[12px] max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
            {checkoutItems.map(item => {
              const effectivePrice = getItemEffectivePrice(item);
              const hasWholesaleDiscount = effectivePrice < item.pricePerKg;

              return (
                <div key={item.productId} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container relative border border-surface-variant">
                    <Image src={item.photo} alt={item.name} fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="font-medium text-on-surface text-sm line-clamp-1">{item.name}</div>
                    <div className="text-on-surface-variant text-xs flex items-center gap-1.5">
                      <span>{item.quantityKg} kg/unit × ₱{effectivePrice.toFixed(2)}</span>
                      {hasWholesaleDiscount && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1 rounded">
                          Wholesale
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="font-semibold text-primary text-sm flex-shrink-0 text-right">
                    <div>₱{(effectivePrice * item.quantityKg).toFixed(2)}</div>
                    {isContract && <div className="text-[10px] text-on-surface-variant">/ delivery</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Price Breakdown */}
          <div className="flex flex-col gap-[8px] border-t border-surface-variant pt-[16px]">
            {isContract ? (
              <>
                <div className="flex justify-between font-body-md text-on-surface-variant text-xs">
                  <span>Produce Subtotal (per batch)</span>
                  <span>₱{subtotalPerDelivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body-md text-on-surface-variant text-xs">
                  <span>Delivery Fee (per batch)</span>
                  <span>₱{deliveryFeePerDelivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body-md text-on-surface font-medium pt-1 border-t border-dashed border-outline-variant">
                  <span>Cost per Weekly Batch</span>
                  <span>₱{(subtotalPerDelivery + deliveryFeePerDelivery).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body-md text-emerald-800 font-medium">
                  <span>Number of Weekly Deliveries</span>
                  <span>× {contractWeeks} weeks</span>
                </div>
                <div className="flex justify-between font-['Manrope'] text-[20px] font-semibold text-primary mt-[8px] pt-[8px] border-t border-surface-container">
                  <span>Total Upfront Contract</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between font-body-md text-on-surface-variant">
                  <span>Subtotal ({checkoutItems.length} item{checkoutItems.length !== 1 ? 's' : ''})</span>
                  <span>₱{subtotalPerDelivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body-md text-on-surface-variant">
                  <span>Delivery Fee</span>
                  <span>₱{deliveryFeePerDelivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-['Manrope'] text-[20px] font-semibold text-primary mt-[8px] pt-[8px] border-t border-surface-container">
                  <span>Total</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {hasOutOfStockItems && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-rose-600 shrink-0 mt-0.5">warning</span>
              <span>Some items in your order exceed the farmer's current inventory. Please adjust quantities in your cart.</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isPending || (!isNewAddress && !selectedAddressId) || hasOutOfStockItems}
              className="w-full bg-[#d97706] hover:bg-[#b45309] disabled:opacity-50 disabled:cursor-not-allowed text-white font-label-md text-label-md py-4 rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              {isPending ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">
                  {isContract ? 'assignment_turned_in' : 'lock'}
                </span>
              )}
              {isPending ? 'Processing...' : isContract ? `Pay & Start Wholesale Contract (₱${total.toFixed(2)})` : 'Place Order'}
            </button>
            <div className="flex items-center justify-center gap-1 mt-[8px] font-body-md text-on-surface-variant text-xs text-center">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              Secure Checkout • 100% Farm Fresh Guarantee
            </div>
          </div>

        </div>
      </div>

    </form>
  );
}
