'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore, CartItem, getItemUnitPrice } from '@/store/cartStore';
import { formatQuantity } from '@/lib/utils';
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
  const minQty = (item.minOrderQty && item.minOrderQty > 1) ? item.minOrderQty : (item.minOrderQty ?? 0.25);
  const maxQty = item.stockKg > 0 ? item.stockKg : 9999;
  const atMax = item.quantityKg >= maxQty;
  const atMin = item.quantityKg <= minQty;

  useEffect(() => {
    setInputVal(String(item.quantityKg));
  }, [item.quantityKg]);

  const handleDecrement = () => {
    if (atMin) {
      removeItem(item.productId);
      toast(`Removed ${item.name} from cart`);
    } else {
      const nextQty = Number(Math.max(minQty, item.quantityKg - 0.25).toFixed(2));
      updateQuantity(item.productId, nextQty);
    }
  };

  const handleIncrement = () => {
    if (atMax) {
      toast.error(`Only ${maxQty} kg available in stock`);
      return;
    }
    const nextQty = Number(Math.min(maxQty, item.quantityKg + 0.25).toFixed(2));
    updateQuantity(item.productId, nextQty);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
  };

  const handleInputBlur = () => {
    const parsed = parseFloat(inputVal);
    if (isNaN(parsed) || parsed < minQty) {
      const fallback = Math.max(minQty, item.quantityKg);
      setInputVal(String(fallback));
      updateQuantity(item.productId, fallback);
      return;
    }
    if (parsed > maxQty) {
      toast.error(`Only ${maxQty} kg available`);
      setInputVal(String(maxQty));
      updateQuantity(item.productId, maxQty);
      return;
    }
    const cleanQty = Number(parsed.toFixed(2));
    setInputVal(String(cleanQty));
    updateQuantity(item.productId, cleanQty);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const fractionPills = [
    { label: '1/4 kg', val: 0.25 },
    { label: '1/2 kg', val: 0.5 },
    { label: '3/4 kg', val: 0.75 },
    { label: '1 kg', val: 1.0 },
  ];

  return (
    <div className="flex flex-col gap-2">
      {/* Stepper & Formatted Label */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-9 bg-white">
          <button
            type="button"
            onClick={handleDecrement}
            className="w-8 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            aria-label={atMin ? 'Remove item' : 'Decrease quantity by 0.25 kg'}
          >
            –
          </button>

          <input
            type="number"
            step="0.25"
            min={minQty}
            max={maxQty}
            value={inputVal}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="w-16 text-center h-full border-x border-gray-200 bg-transparent text-gray-900 outline-none focus:bg-gray-50 font-medium tabular-nums text-xs"
            aria-label="Quantity in kg"
          />

          <button
            type="button"
            onClick={handleIncrement}
            disabled={atMax}
            className="w-8 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Increase quantity by 0.25 kg"
          >
            +
          </button>
        </div>

        {/* Formatted fraction display */}
        <span className="font-medium text-gray-900 text-xs bg-gray-100 px-2 py-1 rounded tabular-nums">
          {formatQuantity(item.quantityKg, 'kg')}
        </span>

        {minQty > 1 && (
          <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 tabular-nums">
            Min. {minQty} kg
          </span>
        )}
        {atMax && (
          <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 tabular-nums">
            Max {maxQty} kg
          </span>
        )}
      </div>

      {/* Quick Fraction Pills */}
      <div className="flex flex-wrap gap-1">
        {fractionPills.map((pill) => {
          const isSelected = Math.abs(item.quantityKg - pill.val) < 0.01;
          const isDisabled = pill.val < minQty || pill.val > maxQty;
          return (
            <button
              key={pill.val}
              type="button"
              disabled={isDisabled}
              onClick={() => updateQuantity(item.productId, pill.val)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                isSelected
                  ? 'border-green-800 bg-green-800 text-white'
                  : isDisabled
                  ? 'opacity-35 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>
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
      toast(`Removed ${item.name}`);
    }, 200);
  };

  return (
    <div
      className={`flex gap-3 sm:gap-4 p-4 rounded-lg border transition-colors ${
        removing ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100'
      } ${
        isSelected
          ? 'border-green-800 bg-green-50/30'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={onToggle}
        className={`flex-shrink-0 mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
          isSelected ? 'border-green-800 bg-green-800 text-white' : 'border-gray-300 bg-white'
        }`}
        aria-label={isSelected ? 'Deselect item' : 'Select item'}
      >
        {isSelected && <span className="text-xs">✓</span>}
      </button>

      {/* Product Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden relative flex-shrink-0 bg-gray-50 border border-gray-200">
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
              className="font-semibold text-gray-900 hover:text-green-800 transition-colors line-clamp-2 text-sm leading-snug block"
            >
              {item.name}
            </Link>
            <div className="text-xs text-gray-500 mt-0.5">
              {item.farmerName}
            </div>
            
            {/* Price & Wholesale/MOQ indicator */}
            {(() => {
              const unitPrice = getItemUnitPrice(item);
              const isWholesaleApplied = Boolean(
                item.wholesalePrice &&
                item.wholesaleMinQty &&
                item.quantityKg >= item.wholesaleMinQty
              );
              const minQty = (item.minOrderQty && item.minOrderQty > 1) ? item.minOrderQty : (item.minOrderQty ?? 0.25);

              return (
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`text-xs tabular-nums ${isWholesaleApplied ? 'line-through text-gray-400' : 'text-gray-600 font-medium'}`}>
                    ₱{item.pricePerKg.toFixed(2)} / kg
                  </span>
                  {isWholesaleApplied && (
                    <span className="text-[11px] font-medium text-green-800 bg-green-50 px-2 py-0.5 rounded border border-green-200 tabular-nums">
                      Wholesale: ₱{unitPrice.toFixed(2)}/kg
                    </span>
                  )}
                  {minQty > 1 && (
                    <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 tabular-nums">
                      MOQ: {minQty} kg
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-700 transition-colors p-1 flex-shrink-0 text-xs font-medium"
            aria-label="Remove item"
          >
            Remove
          </button>
        </div>

        {/* Bottom row: Qty stepper + subtotal */}
        <div className="flex flex-wrap justify-between items-end gap-2 mt-3 pt-2 border-t border-gray-100">
          <QuantityStepper item={item} updateQuantity={updateQuantity} removeItem={removeItem} />
          <div className="text-right">
            <div className="font-semibold text-green-800 text-base tabular-nums">
              ₱{(getItemUnitPrice(item) * item.quantityKg).toFixed(2)}
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
    <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200">
      <button
        type="button"
        onClick={handleToggleAll}
        className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
          allSelected ? 'border-green-800 bg-green-800 text-white' : 'border-gray-300 bg-white'
        }`}
        aria-label={allSelected ? `Deselect all from ${farmerName}` : `Select all from ${farmerName}`}
      >
        {allSelected && <span className="text-[10px]">✓</span>}
      </button>

      <span className="font-medium text-gray-900 text-xs">{farmerName}</span>
    </div>
  );
}

// ─── Order Summary ────────────────────────────────────────────────────────────
function OrderSummary({
  selectedItems,
  onCheckout,
}: {
  selectedItems: CartItem[];
  allItemCount: number;
  onCheckout: () => void;
}) {
  const subtotal = selectedItems.reduce(
    (sum, i) => sum + getItemUnitPrice(i) * i.quantityKg,
    0
  );
  const deliveryFee = selectedItems.length > 0 ? 50 : 0;
  const total = subtotal + deliveryFee;

  const hasOutOfStockItem = selectedItems.some(
    (i) => i.stockKg <= 0 || i.quantityKg > i.stockKg
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col gap-4">
      <h2 className="font-semibold text-gray-900 text-base pb-3 border-b border-gray-200">
        Order Summary
      </h2>

      {selectedItems.length === 0 ? (
        <p className="text-gray-500 text-xs text-center py-4">
          No items selected for checkout
        </p>
      ) : (
        <>
          {/* Selected item breakdown */}
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {selectedItems.map((item) => {
              const isOverStock = item.stockKg <= 0 || item.quantityKg > item.stockKg;
              const unitPrice = getItemUnitPrice(item);
              return (
                <div key={item.productId} className="flex justify-between items-center gap-2 text-xs">
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-gray-600 truncate">
                      {item.name} × {formatQuantity(item.quantityKg, 'kg')}
                    </span>
                    {isOverStock && (
                      <span className="text-red-700 text-[11px] font-medium">
                        {item.stockKg <= 0 ? 'Out of stock' : `Only ${item.stockKg} kg available`}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-gray-900 tabular-nums flex-shrink-0">
                    ₱{(unitPrice * item.quantityKg).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 pt-3 flex flex-col gap-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal ({selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''})</span>
              <span className="tabular-nums">₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="tabular-nums">₱{deliveryFee.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3 flex justify-between items-end">
            <span className="font-semibold text-gray-900 text-sm">Total</span>
            <span className="font-semibold text-green-800 text-xl tabular-nums">₱{total.toFixed(2)}</span>
          </div>

          {hasOutOfStockItem && (
            <div className="p-3 bg-red-50/60 border border-red-300 rounded-lg text-xs text-red-700">
              Some items exceed available farmer inventory. Please adjust quantities before checking out.
            </div>
          )}
        </>
      )}

      <button
        type="button"
        onClick={onCheckout}
        disabled={selectedItems.length === 0 || hasOutOfStockItem}
        className="w-full bg-green-800 hover:bg-green-900 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
      >
        Proceed to Checkout ({selectedItems.length})
      </button>

      <p className="text-center text-xs text-gray-400">
        Escrow Protected & Secure Checkout
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
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-12 flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-green-800 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200 text-center p-6">
          <h2 className="font-semibold text-gray-900 text-xl mb-1">Your cart is empty</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Browse fresh harvests directly from verified La Union farmers.
          </p>
          <Link
            href="/products"
            className="bg-green-800 hover:bg-green-900 text-white px-6 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            Browse Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const groups = grouped();

  return (
    <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Shopping Cart
        </h1>
        <Link
          href="/products"
          className="text-green-800 font-medium text-xs hover:underline"
        >
          + Add more harvests
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT: Item list */}
        <div className="flex-grow w-full flex flex-col gap-4 min-w-0">
          {/* Select All Bar */}
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => allSelected ? deselectAll() : selectAll()}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  allSelected ? 'border-green-800 bg-green-800 text-white' : 'border-gray-300 bg-white'
                }`}
                aria-label={allSelected ? 'Deselect all' : 'Select all'}
              >
                {allSelected && <span className="text-[10px]">✓</span>}
              </button>
              <span className="font-medium text-gray-700 text-xs">
                Select All ({items.length} item{items.length !== 1 ? 's' : ''})
              </span>
            </label>

            {currentSelectedItems.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  currentSelectedItems.forEach((i) => removeItem(i.productId));
                  toast(`Removed ${currentSelectedItems.length} item${currentSelectedItems.length > 1 ? 's' : ''}`);
                }}
                className="text-xs font-medium text-gray-500 hover:text-red-700 transition-colors"
              >
                Delete Selected ({currentSelectedItems.length})
              </button>
            )}
          </div>

          {/* Grouped Items */}
          {groups.map(([farmerName, farmerItems]) => (
            <div
              key={farmerName}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <FarmerGroupHeader
                farmerName={farmerName}
                items={farmerItems}
                selectedIds={selectedIds}
                toggleSelect={toggleSelect}
              />

              <div className="p-3 sm:p-4 space-y-3 divide-y divide-gray-100">
                {farmerItems.map((item) => (
                  <div key={item.productId} className="pt-3 first:pt-0">
                    <CartItemRow
                      item={item}
                      isSelected={selectedIds.includes(item.productId)}
                      onToggle={() => toggleSelect(item.productId)}
                      updateQuantity={updateQuantity}
                      removeItem={removeItem}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: Sticky Order Summary */}
        <div className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-24">
          <OrderSummary
            selectedItems={currentSelectedItems}
            allItemCount={items.length}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </main>
  );
}
