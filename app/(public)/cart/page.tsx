'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore, CartItem } from '@/store/cartStore';
import toast from 'react-hot-toast';

// ─── Quantity Stepper ─────────────────────────────────────────────────────────
function QuantityStepper({
  item,
  updateQuantity,
  removeItem,
}: {
  item: CartItem;
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
}) {
  const [inputVal, setInputVal] = useState(String(item.quantityKg));
  const maxQty = item.stockKg > 0 ? item.stockKg : 9999;
  const atMax = item.quantityKg >= maxQty;
  const atMin = item.quantityKg <= 1;

  useEffect(() => {
    setInputVal(String(item.quantityKg));
  }, [item.quantityKg]);

  const handleDecrement = () => {
    if (atMin) {
      // Removing — confirm inline
      removeItem(item.productId);
      toast(`Removed ${item.name} from cart`, { icon: '🗑️' });
    } else {
      updateQuantity(item.productId, item.quantityKg - 1);
    }
  };

  const handleIncrement = () => {
    if (atMax) {
      toast.error(`Only ${maxQty} kg available in stock`);
      return;
    }
    updateQuantity(item.productId, item.quantityKg + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputVal, 10);
    if (isNaN(parsed) || parsed < 1) {
      setInputVal(String(item.quantityKg));
      return;
    }
    if (parsed > maxQty) {
      toast.error(`Only ${maxQty} kg available`);
      updateQuantity(item.productId, maxQty);
      return;
    }
    updateQuantity(item.productId, parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden h-9 bg-surface-container-lowest shadow-sm">
        <button
          type="button"
          onClick={handleDecrement}
          className={`w-9 h-full flex items-center justify-center transition-colors ${
            atMin
              ? 'text-error hover:bg-error/10'
              : 'text-on-surface hover:bg-surface-variant'
          }`}
          aria-label={atMin ? 'Remove item' : 'Decrease quantity'}
        >
          <span className="material-symbols-outlined text-[16px]">
            {atMin ? 'delete' : 'remove'}
          </span>
        </button>

        <input
          type="text"
          inputMode="numeric"
          value={inputVal}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="w-10 text-center h-full border-x border-outline-variant/40 font-label-md bg-transparent text-on-surface outline-none focus:bg-primary/5 transition-colors"
          aria-label="Quantity in kg"
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={atMax}
          className="w-9 h-full flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Increase quantity"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
        </button>
      </div>
      <span className="font-body-md text-on-surface-variant text-sm">kg</span>
      {atMax && (
        <span className="text-amber-600 font-label-sm text-xs ml-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          Max {maxQty} kg
        </span>
      )}
    </div>
  );
}

// ─── Cart Item Row ────────────────────────────────────────────────────────────
function CartItemRow({
  item,
  isSelected,
  onToggle,
  updateQuantity,
  removeItem,
}: {
  item: CartItem;
  isSelected: boolean;
  onToggle: () => void;
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
}) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => {
      removeItem(item.productId);
      toast(`Removed ${item.name}`, { icon: '🗑️' });
    }, 300);
  };

  return (
    <div
      className={`flex gap-3 sm:gap-4 p-4 rounded-xl border transition-all duration-300 ${
        removing ? 'opacity-0 scale-95 h-0 p-0 overflow-hidden' : 'opacity-100'
      } ${
        isSelected
          ? 'border-primary/30 bg-primary/5'
          : 'border-surface-variant bg-surface-container-lowest hover:border-outline-variant'
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={onToggle}
        className="flex-shrink-0 mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
        style={{
          borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-outline)',
          backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
        }}
        aria-label={isSelected ? 'Deselect item' : 'Select item'}
      >
        {isSelected && (
          <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            check
          </span>
        )}
      </button>

      {/* Product Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden relative flex-shrink-0 bg-surface-variant">
        <Image
          src={item.photo}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 80px, 96px"
        />
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col justify-between min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <Link
              href={`/products/${item.productId}`}
              className="font-semibold text-on-surface hover:text-primary transition-colors line-clamp-2 text-[15px] leading-snug block"
            >
              {item.name}
            </Link>
            <div className="font-body-md text-on-surface-variant text-sm mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">storefront</span>
              {item.farmerName}
            </div>
            <div className="text-on-surface-variant text-xs mt-0.5">
              ₱{item.pricePerKg.toFixed(2)} / kg
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-on-surface-variant hover:text-error transition-colors p-1 flex-shrink-0 rounded-lg hover:bg-error/10"
            aria-label="Remove item"
          >
            <span className="material-symbols-outlined text-[18px]">delete_outline</span>
          </button>
        </div>

        {/* Bottom row: Qty stepper + subtotal */}
        <div className="flex flex-wrap justify-between items-end gap-2 mt-3">
          <QuantityStepper item={item} updateQuantity={updateQuantity} removeItem={removeItem} />
          <div className="text-right">
            <div className="font-bold text-primary text-[17px]">
              ₱{(item.pricePerKg * item.quantityKg).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Farmer Group Header ──────────────────────────────────────────────────────
function FarmerGroupHeader({
  farmerName,
  items,
  selectedIds,
  toggleSelect,
}: {
  farmerName: string;
  items: CartItem[];
  selectedIds: string[];
  toggleSelect: (id: string) => void;
}) {
  const allSelected = items.every((i) => selectedIds.includes(i.productId));
  const someSelected = items.some((i) => selectedIds.includes(i.productId));

  const handleToggleAll = () => {
    if (allSelected) {
      items.forEach((i) => {
        if (selectedIds.includes(i.productId)) toggleSelect(i.productId);
      });
    } else {
      items.forEach((i) => {
        if (!selectedIds.includes(i.productId)) toggleSelect(i.productId);
      });
    }
  };

  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <button
        type="button"
        onClick={handleToggleAll}
        className="flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
        style={{
          borderColor:
            allSelected || someSelected
              ? 'var(--color-primary)'
              : 'var(--color-outline)',
          backgroundColor: allSelected ? 'var(--color-primary)' : 'transparent',
        }}
        aria-label={allSelected ? `Deselect all from ${farmerName}` : `Select all from ${farmerName}`}
      >
        {allSelected ? (
          <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            check
          </span>
        ) : someSelected ? (
          <span className="block w-2.5 h-0.5 rounded-full bg-primary" />
        ) : null}
      </button>

      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-primary">storefront</span>
        <span className="font-semibold text-on-surface text-sm">{farmerName}</span>
      </div>
    </div>
  );
}

// ─── Order Summary ────────────────────────────────────────────────────────────
function OrderSummary({
  selectedItems,
  allItemCount,
  onCheckout,
}: {
  selectedItems: CartItem[];
  allItemCount: number;
  onCheckout: () => void;
}) {
  const subtotal = selectedItems.reduce(
    (sum, i) => sum + i.pricePerKg * i.quantityKg,
    0
  );
  const deliveryFee = selectedItems.length > 0 ? 50 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm p-5 flex flex-col gap-4">
      <h2 className="font-semibold text-on-surface text-[17px] pb-3 border-b border-surface-variant">
        Order Summary
      </h2>

      {selectedItems.length === 0 ? (
        <p className="text-on-surface-variant text-sm text-center py-2">
          No items selected
        </p>
      ) : (
        <>
          {/* Selected item breakdown */}
          <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1 no-scrollbar">
            {selectedItems.map((item) => (
              <div key={item.productId} className="flex justify-between items-center gap-2 text-sm">
                <span className="text-on-surface-variant line-clamp-1 flex-1">
                  {item.name} × {item.quantityKg} kg
                </span>
                <span className="font-medium text-on-surface flex-shrink-0">
                  ₱{(item.pricePerKg * item.quantityKg).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-surface-variant pt-3 flex flex-col gap-2">
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Subtotal ({selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''})</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Delivery Fee</span>
              <span>₱{deliveryFee.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-surface-variant pt-3 flex justify-between items-end">
            <span className="font-semibold text-on-surface">Total</span>
            <span className="font-bold text-primary text-[22px]">₱{total.toFixed(2)}</span>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onCheckout}
        disabled={selectedItems.length === 0}
        className="w-full bg-primary text-on-primary font-semibold py-3.5 rounded-xl shadow-sm hover:opacity-90 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-[15px]"
      >
        <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
        Checkout ({selectedItems.length})
      </button>

      <p className="text-center text-xs text-on-surface-variant flex items-center justify-center gap-1">
        <span className="material-symbols-outlined text-[13px]">lock</span>
        Secure Checkout
      </p>
    </div>
  );
}

// ─── Main Cart Page ───────────────────────────────────────────────────────────
export default function CartPage() {
  const router = useRouter();
  const {
    items,
    selectedIds,
    removeItem,
    updateQuantity,
    toggleSelect,
    selectAll,
    deselectAll,
    areAllSelected,
    selectedItems,
  } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Group items by farmer name
  const grouped = useCallback(() => {
    const map = new Map<string, CartItem[]>();
    items.forEach((item) => {
      const key = item.farmerName;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return Array.from(map.entries());
  }, [items]);

  const handleCheckout = () => {
    const sel = selectedItems();
    if (sel.length === 0) {
      toast.error('Please select at least one item to checkout');
      return;
    }
    router.push('/checkout');
  };

  const allSelected = mounted ? areAllSelected() : false;
  const currentSelectedItems = mounted ? selectedItems() : [];

  if (!mounted) {
    return (
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-6 py-12 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-surface-variant text-center">
          <div className="w-32 h-32 rounded-full bg-primary/5 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[72px] text-primary/30">shopping_cart</span>
          </div>
          <h2 className="font-bold text-on-surface text-2xl mb-2">Your cart is empty</h2>
          <p className="text-on-surface-variant mb-8 max-w-xs text-sm">
            Looks like you haven't added any fresh produce yet. Start shopping!
          </p>
          <Link
            href="/products"
            className="bg-primary text-on-primary px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">storefront</span>
            Browse Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const groups = grouped();

  return (
    <>
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-on-background text-[28px] sm:text-[36px] tracking-tight">
            My Cart
          </h1>
          <Link
            href="/products"
            className="text-primary font-semibold text-sm flex items-center gap-1 hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add more items
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT: Item list */}
          <div className="flex-grow w-full flex flex-col gap-4 min-w-0">

            {/* Select All Bar */}
            <div className="flex items-center justify-between bg-surface-container-lowest border border-surface-variant rounded-xl px-4 py-3 shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => allSelected ? deselectAll() : selectAll()}
                  className="flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                  style={{
                    borderColor: allSelected ? 'var(--color-primary)' : 'var(--color-outline)',
                    backgroundColor: allSelected ? 'var(--color-primary)' : 'transparent',
                  }}
                  aria-label={allSelected ? 'Deselect all' : 'Select all'}
                >
                  {allSelected && (
                    <span
                      className="material-symbols-outlined text-white text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check
                    </span>
                  )}
                </button>
                <span className="font-medium text-on-surface text-sm">
                  Select All ({items.length} item{items.length !== 1 ? 's' : ''})
                </span>
              </label>

              {currentSelectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    currentSelectedItems.forEach((i) => removeItem(i.productId));
                    toast(`Removed ${currentSelectedItems.length} item${currentSelectedItems.length > 1 ? 's' : ''}`, { icon: '🗑️' });
                  }}
                  className="text-error text-sm font-medium hover:bg-error/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">delete_outline</span>
                  Delete ({currentSelectedItems.length})
                </button>
              )}
            </div>

            {/* Grouped Items */}
            {groups.map(([farmerName, farmerItems]) => (
              <div
                key={farmerName}
                className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm"
              >
                {/* Farmer header */}
                <FarmerGroupHeader
                  farmerName={farmerName}
                  items={farmerItems}
                  selectedIds={selectedIds}
                  toggleSelect={toggleSelect}
                />

                <div className="border-t border-surface-variant/50" />

                {/* Items */}
                <div className="flex flex-col gap-0">
                  {farmerItems.map((item, idx) => (
                    <div key={item.productId}>
                      {idx > 0 && (
                        <div className="border-t border-surface-variant/40 mx-4" />
                      )}
                      <div className="p-3 sm:p-4">
                        <CartItemRow
                          item={item}
                          isSelected={selectedIds.includes(item.productId)}
                          onToggle={() => toggleSelect(item.productId)}
                          updateQuantity={updateQuantity}
                          removeItem={removeItem}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Sticky Order Summary (desktop) */}
          <div className="w-full lg:w-[360px] flex-shrink-0 lg:sticky lg:top-24">
            <OrderSummary
              selectedItems={currentSelectedItems}
              allItemCount={items.length}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden sticky bottom-0 z-50 bg-surface-container-lowest border-t border-surface-variant px-4 py-3 flex items-center justify-between gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div>
          <div className="text-xs text-on-surface-variant">
            {currentSelectedItems.length} item{currentSelectedItems.length !== 1 ? 's' : ''} selected
          </div>
          <div className="font-bold text-primary text-[18px]">
            ₱{(currentSelectedItems.reduce((s, i) => s + i.pricePerKg * i.quantityKg, 0) + (currentSelectedItems.length > 0 ? 50 : 0)).toFixed(2)}
          </div>
        </div>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={currentSelectedItems.length === 0}
          className="bg-primary text-on-primary font-semibold px-6 py-3 rounded-xl shadow-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-[14px] flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
          Checkout ({currentSelectedItems.length})
        </button>
      </div>
    </>
  );
}