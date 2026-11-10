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
import { formatQuantity } from '@/lib/utils';

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

  const checkoutItems = selectedItems().length > 0 ? selectedItems() : items;

  const [paymentMethod, setPaymentMethod] = useState<string>('gcash');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find(a => a.isDefault)?.id || addresses[0]?.id || ''
  );

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

  const getItemEffectivePrice = (item: any) => {
    if (item.wholesalePrice && item.wholesaleMinQty && item.quantityKg >= item.wholesaleMinQty) {
      return Number(item.wholesalePrice);
    }
    if (isContract) {
      if (item.wholesalePrice) return Number(item.wholesalePrice);
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
      toast.error('One or more items in your cart exceed available stock');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const notes = formData.get('notes') as string;

    startTransition(async () => {
      let finalAddressId = selectedAddressId;

      if (isNewAddress) {
        const addressResult = await createAddressAction({ success: false, error: '' }, formData);
        if (!addressResult.success) {
          toast.error(addressResult.error || 'Failed to save address');
          return;
        }
        if (!addressResult.data?.id) {
          toast.error('Failed to retrieve saved address');
          return;
        }
        finalAddressId = addressResult.data.id as string;
      }

      if (!finalAddressId) {
        toast.error('Please select or add a delivery address');
        return;
      }

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
          toast.success(isContract ? 'Wholesale contract created successfully' : 'Order placed successfully');
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
        <div className="w-8 h-8 border-2 border-green-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <Link href="/products" className="inline-block mt-2 bg-green-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-900 transition-colors">
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
    <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT COLUMN */}
      <div className="lg:col-span-8 flex flex-col gap-6">

        {/* SECTION 1: ORDER MODE / PURCHASE TYPE */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Order Mode & Fulfillment
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select between a one-time standard order or a scheduled recurring wholesale contract.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard Mode Card */}
            <div
              onClick={() => setOrderMode('STANDARD')}
              className={`p-4 rounded-lg border cursor-pointer transition-colors flex flex-col justify-between ${
                orderMode === 'STANDARD'
                  ? 'border-green-800 bg-green-50/40'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900 text-sm">Standard Order</span>
                  <span className="text-xs text-gray-500 tabular-nums">
                    {orderMode === 'STANDARD' ? '[✓]' : '[ ]'}
                  </span>
                </div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-gray-500 mb-2">
                  One-Time Delivery
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Single delivery of fresh harvest produce directly dispatched from local farms.
                </p>
              </div>
            </div>

            {/* Wholesale Contract Mode Card */}
            <div
              onClick={() => setOrderMode('WHOLESALE_CONTRACT')}
              className={`p-4 rounded-lg border cursor-pointer transition-colors flex flex-col justify-between ${
                orderMode === 'WHOLESALE_CONTRACT'
                  ? 'border-green-800 bg-green-50/40'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900 text-sm">Wholesale Contract</span>
                  <span className="text-xs text-green-800 tabular-nums">
                    {orderMode === 'WHOLESALE_CONTRACT' ? '[✓]' : '[ ]'}
                  </span>
                </div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-green-800 mb-2">
                  Recurring Weekly Batches
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Upfront contract settlement with fresh produce delivered weekly on your chosen schedule.
                </p>
              </div>
            </div>
          </div>

          {/* Wholesale Contract Options */}
          {isContract && (
            <div className="mt-5 pt-5 border-t border-gray-200 flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-600 block mb-2">
                  Weekly Delivery Day
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {[
                    'Every Saturday',
                    'Every Sunday',
                    'Every Monday',
                    'Every Wednesday',
                    'Every Friday',
                  ].map((day) => {
                    const isSelected = deliveryScheduleDay === day;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setDeliveryScheduleDay(day)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-colors ${
                          isSelected
                            ? 'border-green-800 bg-green-800 text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {day.replace('Every ', '')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-gray-600 block mb-2">
                  Contract Duration (Weeks)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { weeks: 2, label: '2 Weeks' },
                    { weeks: 4, label: '4 Weeks' },
                    { weeks: 8, label: '8 Weeks' },
                  ].map((tier) => {
                    const isSelected = contractWeeks === tier.weeks;
                    return (
                      <button
                        key={tier.weeks}
                        type="button"
                        onClick={() => setContractWeeks(tier.weeks)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-colors ${
                          isSelected
                            ? 'border-green-800 bg-green-800 text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tier.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700">
                First delivery scheduled for <strong className="font-semibold text-gray-900">{formattedFirstDelivery}</strong>.
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: DELIVERY DETAILS */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Delivery Address
            </h2>
            {addresses.length > 0 && !isNewAddress && (
              <button
                type="button"
                onClick={() => setIsNewAddress(true)}
                className="text-xs font-medium text-green-800 hover:underline"
              >
                + New Address
              </button>
            )}
          </div>

          {addresses.length > 0 && !isNewAddress ? (
            <div className="flex flex-col gap-3">
              {addresses.map(address => (
                <label
                  key={address.id}
                  className={`flex gap-3 p-3.5 border rounded-lg cursor-pointer transition-colors ${
                    selectedAddressId === address.id
                      ? 'border-green-800 bg-green-50/30'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="existingAddress"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                    className="mt-0.5 accent-green-800"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-gray-900">{address.fullName} • {address.phone}</div>
                    <div className="text-gray-500 mt-0.5">
                      {address.street}, {address.barangay}, {address.city}, {address.province}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-700 block mb-1">Full Name *</label>
                <input
                  required
                  name="fullName"
                  type="text"
                  placeholder="Recipient full name"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-800"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-700 block mb-1">Contact Number *</label>
                <input
                  required
                  name="phone"
                  type="tel"
                  placeholder="e.g. 09123456789"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-800"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-700 block mb-1">Street Address *</label>
                <input
                  required
                  name="street"
                  type="text"
                  placeholder="House number, street name"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-800"
                />
              </div>
              <div className="col-span-1">
                <label className="text-xs font-medium text-gray-700 block mb-1">Barangay *</label>
                <select
                  required
                  name="barangay"
                  defaultValue=""
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-green-800 cursor-pointer"
                >
                  <option value="" disabled>Select Barangay</option>
                  {AGOO_BARANGAYS.map((brgy) => (
                    <option key={brgy} value={brgy}>{brgy}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="text-xs font-medium text-gray-700 block mb-1">City / Municipality</label>
                <input
                  required
                  name="city"
                  type="text"
                  defaultValue="Agoo"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-green-800"
                />
              </div>
              <input type="hidden" name="province" value="La Union" />
              <input type="hidden" name="isDefault" value="true" />

              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsNewAddress(false)}
                  className="text-xs font-medium text-gray-500 hover:underline md:col-span-2 text-left"
                >
                  Cancel and use saved address
                </button>
              )}
            </div>
          )}
        </div>

        {/* SECTION 3: PAYMENT METHOD */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Method
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'gcash', title: 'GCash / Online (PayMongo)', subtitle: isContract ? 'Pay entire contract upfront' : 'Instant digital payment' },
              { id: 'cod', title: 'Cash on Delivery (COD)', subtitle: isContract ? 'Pay in full upon 1st delivery' : 'Pay upon delivery' },
            ].map((method) => {
              const isSelected = paymentMethod === method.id;
              return (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                  className={`p-4 rounded-lg cursor-pointer border transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'border-green-800 bg-green-50/40'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold text-gray-900">{method.title}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{method.subtitle}</div>
                  </div>
                  <span className="text-xs text-green-800 font-semibold tabular-nums">
                    {isSelected ? '[✓]' : '[ ]'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: NOTES */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <label className="text-sm font-semibold text-gray-900 block mb-2">
            Delivery Notes (Optional)
          </label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Landmarks, gate instructions, preferred drop details..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-800 resize-none"
          />
        </div>

      </div>

      {/* RIGHT COLUMN - ORDER SUMMARY */}
      <div className="lg:col-span-4 relative">
        <div className="sticky top-20 bg-white rounded-lg border border-gray-200 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="text-base font-semibold text-gray-900">Order Summary</h3>
            <Link href="/cart" className="text-xs font-medium text-green-800 hover:underline">
              Edit Cart
            </Link>
          </div>

          {/* Wholesale Contract Summary Callout */}
          {isContract && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 space-y-1">
              <div className="font-semibold text-gray-900 uppercase tracking-wider text-[11px]">
                Wholesale Recurring Delivery
              </div>
              <div>Schedule: {deliveryScheduleDay}</div>
              <div>Duration: {contractWeeks} Weekly Batches</div>
            </div>
          )}

          {/* Read-only item list */}
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {checkoutItems.map(item => {
              const effectivePrice = getItemEffectivePrice(item);
              const hasWholesaleDiscount = effectivePrice < item.pricePerKg;

              return (
                <div key={item.productId} className="flex gap-2.5 items-center text-xs">
                  <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-gray-50 relative border border-gray-200">
                    <Image src={item.photo} alt={item.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="font-medium text-gray-900 truncate">{item.name}</div>
                    <div className="text-gray-500 text-[11px] tabular-nums">
                      {formatQuantity(item.quantityKg, 'kg')} × ₱{effectivePrice.toFixed(2)}
                      {hasWholesaleDiscount && <span className="ml-1 text-green-800 font-semibold">(Wholesale)</span>}
                    </div>
                  </div>
                  <div className="font-medium text-gray-900 tabular-nums shrink-0">
                    ₱{(effectivePrice * item.quantityKg).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Price Breakdown */}
          <div className="flex flex-col gap-2 border-t border-gray-200 pt-3 text-xs text-gray-600">
            {isContract ? (
              <>
                <div className="flex justify-between">
                  <span>Subtotal (per batch)</span>
                  <span className="tabular-nums">₱{subtotalPerDelivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery (per batch)</span>
                  <span className="tabular-nums">₱{deliveryFeePerDelivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-100">
                  <span>Cost per Batch</span>
                  <span className="tabular-nums">₱{(subtotalPerDelivery + deliveryFeePerDelivery).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-800 font-medium">
                  <span>Total Batches</span>
                  <span className="tabular-nums">× {contractWeeks} weeks</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Upfront</span>
                  <span className="text-green-800 tabular-nums">₱{total.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Subtotal ({checkoutItems.length} item{checkoutItems.length !== 1 ? 's' : ''})</span>
                  <span className="tabular-nums">₱{subtotalPerDelivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="tabular-nums">₱{deliveryFeePerDelivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-green-800 tabular-nums">₱{total.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {hasOutOfStockItems && (
            <div className="p-2.5 bg-red-50/60 border border-red-300 rounded-lg text-xs text-red-700">
              Some items in your order exceed the farmer's current inventory. Please adjust quantities in your cart.
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending || (!isNewAddress && !selectedAddressId) || hasOutOfStockItems}
              className="w-full bg-green-800 hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors text-sm"
            >
              {isPending ? 'Processing...' : isContract ? `Confirm Contract (₱${total.toFixed(2)})` : `Place Order (₱${total.toFixed(2)})`}
            </button>
            <p className="mt-2 text-center text-xs text-gray-400">
              Escrow Protected • 100% Farm Fresh Guarantee
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
