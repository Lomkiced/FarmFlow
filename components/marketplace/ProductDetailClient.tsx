'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { formatQuantity } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    pricePerKg: number;
    stockKg: number;
    photos: string[];
    category: string;
    description: string | null;
    harvestDate: Date | null;
    minOrderQty?: number | null;
    wholesalePrice?: any;
    wholesaleMinQty?: number | null;
    farm: {
      id: string;
      farmName: string;
      barangay?: string | null;
      location?: string | null;
      rsbsaNumber?: string | null;
      user: { name: string; avatarUrl: string | null } | null;
      _count: { products: number };
      rating?: number;
    };
    crop: { cropName: string; variety?: string | null; datePlanted?: Date | string | null } | null;
  };
  relatedProducts: {
    id: string;
    name: string;
    pricePerKg: number;
    stockKg: number;
    photos: string[];
    minOrderQty?: number | null;
    wholesalePrice?: any;
    wholesaleMinQty?: number | null;
    farm: { farmName: string };
  }[];
  reviews?: {
    id: string;
    buyerName: string;
    buyerLocation: string;
    rating: number;
    review: string;
    date: string;
    verifiedEscrow: boolean;
  }[];
}

function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [activeImage, setActiveImage] = useState(0);
  const displayImages = images.length > 0 ? images : ['/images/crops/generic.jpg'];

  return (
    <div className="lg:col-span-7 flex flex-col gap-2">
      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 border border-gray-200 relative">
        <Image
          key={activeImage}
          src={displayImages[activeImage]}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
        />
      </div>
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`aspect-square rounded-lg overflow-hidden bg-gray-50 cursor-pointer relative transition-colors border-2 ${
                activeImage === idx ? 'border-green-800' : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="(max-width: 1024px) 25vw, 15vw" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailClient({ product, relatedProducts, reviews = [] }: ProductDetailClientProps) {
  const minOrder = (product.minOrderQty && product.minOrderQty > 1) ? product.minOrderQty : (product.minOrderQty ?? 0.25);
  const [quantity, setQuantity] = useState(minOrder);
  const [inputVal, setInputVal] = useState(String(minOrder));
  const addItem = useCartStore((state) => state.addItem);
  const scrollRef = useRef<HTMLDivElement>(null);

  const maxStock = product.stockKg > 0 ? product.stockKg : 9999;
  const hasWholesale = Boolean(product.wholesalePrice && product.wholesaleMinQty);
  const wholesaleActive = hasWholesale && quantity >= (product.wholesaleMinQty || 0);
  const effectiveUnitPrice = wholesaleActive ? Number(product.wholesalePrice) : product.pricePerKg;

  const badge = product.category === 'VEGETABLES' || product.category === 'Vegetables' ? 'Organic' : product.stockKg > 10 ? 'In Stock' : 'Low Stock';

  const updateQuantityValue = (val: number) => {
    const clamped = Number(Math.max(minOrder, Math.min(val, maxStock)).toFixed(2));
    setQuantity(clamped);
    setInputVal(String(clamped));
  };

  const handleAddToCart = () => {
    const finalQty = Number(Math.max(minOrder, quantity).toFixed(2));
    addItem({
      productId: product.id,
      name: product.name,
      pricePerKg: product.pricePerKg,
      quantityKg: finalQty,
      stockKg: product.stockKg,
      photo: product.photos[0] || '/images/crops/generic.jpg',
      farmerName: product.farm.farmName,
      minOrderQty: minOrder,
      wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : null,
      wholesaleMinQty: product.wholesaleMinQty ? Number(product.wholesaleMinQty) : null,
    });
    toast.success(`${product.name} (${formatQuantity(finalQty, 'kg')}) added to cart`, {
      duration: 2500,
    });
  };

  const handleRelatedAddToCart = (e: React.MouseEvent, related: any) => {
    e.preventDefault();
    const relMoq = (related.minOrderQty && related.minOrderQty > 1) ? related.minOrderQty : (related.minOrderQty ?? 0.25);
    addItem({
      productId: related.id,
      name: related.name,
      pricePerKg: related.pricePerKg,
      quantityKg: relMoq,
      stockKg: related.stockKg ?? 0,
      photo: related.photos[0] || '/images/crops/generic.jpg',
      farmerName: related.farm.farmName,
      minOrderQty: relMoq,
      wholesalePrice: related.wholesalePrice ? Number(related.wholesalePrice) : null,
      wholesaleMinQty: related.wholesaleMinQty ? Number(related.wholesaleMinQty) : null,
    });
    toast.success(`${related.name} added to cart (${formatQuantity(relMoq, 'kg')})`, { duration: 2000 });
  };

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: dir === 'left' ? -300 : 300,
      behavior: 'smooth',
    });
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : (product.farm.rating || 5.0).toFixed(1);

  return (
    <>
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
        <Link href="/products" className="hover:text-green-800 transition-colors">
          Marketplace
        </Link>
        <span>/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-green-800 transition-colors capitalize">
          {product.category.toLowerCase()}
        </Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <ImageGallery images={product.photos} name={product.name} />

        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            {/* Status Pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700">
                {badge}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded border border-green-200 bg-green-50 text-green-800">
                La Union Verified
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 tabular-nums">
                Min. Order {minOrder} kg
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-semibold text-green-800 tabular-nums">
                ₱{effectiveUnitPrice.toFixed(2)}
              </span>
              {wholesaleActive && (
                <span className="line-through text-gray-400 text-lg tabular-nums">
                  ₱{product.pricePerKg.toFixed(2)}
                </span>
              )}
              <span className="text-sm text-gray-500 font-normal">/ kg</span>
              {wholesaleActive && (
                <span className="text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border border-green-200 bg-green-50 text-green-800">
                  Wholesale Applied
                </span>
              )}
            </div>

            {/* Wholesale Tier Callout */}
            {hasWholesale && !wholesaleActive && (
              <div className="mb-4 p-3 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-700 flex items-center justify-between">
                <span>
                  Order <strong className="font-semibold tabular-nums">{product.wholesaleMinQty} kg</strong> or more for <strong className="font-semibold text-green-800 tabular-nums">₱{Number(product.wholesalePrice).toFixed(2)}/kg</strong>.
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(product.wholesaleMinQty || 1)}
                  className="ml-2 font-medium text-green-800 hover:underline shrink-0"
                >
                  Set to {product.wholesaleMinQty} kg
                </button>
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {product.description || `Locally grown ${product.name.toLowerCase()} straight from ${product.farm.farmName}.`}
            </p>

            {/* Fractional Weight Selector Pills */}
            <div className="mb-6 pt-4 border-t border-gray-200">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500 block mb-2">
                Select Weight
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { label: '1/4 kg', val: 0.25 },
                  { label: '1/2 kg', val: 0.5 },
                  { label: '3/4 kg', val: 0.75 },
                  { label: '1 kg', val: 1.0 },
                ].map((pill) => {
                  const isSelected = Math.abs(quantity - pill.val) < 0.01;
                  const isDisabled = pill.val < minOrder || pill.val > maxStock;
                  return (
                    <button
                      key={pill.val}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => updateQuantityValue(pill.val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'border-green-800 bg-green-800 text-white'
                          : isDisabled
                          ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => updateQuantityValue(Number((quantity + 0.5).toFixed(2)))}
                  disabled={quantity + 0.5 > maxStock}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-gray-300 bg-white text-gray-700 hover:border-green-800 hover:text-green-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + 1/2 kg
                </button>
              </div>

              {/* Quantity Stepper & Subtotal */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-10 w-36 bg-white">
                  <button 
                    type="button"
                    onClick={() => updateQuantityValue(Number((quantity - 0.25).toFixed(2)))}
                    disabled={quantity <= minOrder}
                    className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Decrease quantity"
                  >
                    –
                  </button>
                  <input
                    type="number"
                    step="0.25"
                    min={minOrder}
                    max={maxStock}
                    aria-label="Quantity in kg"
                    value={inputVal}
                    onChange={(e) => {
                      setInputVal(e.target.value);
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= minOrder) {
                        setQuantity(Number(Math.min(val, maxStock).toFixed(2)));
                      }
                    }}
                    onBlur={() => {
                      const val = parseFloat(inputVal);
                      if (isNaN(val) || val < minOrder) {
                        updateQuantityValue(minOrder);
                      } else {
                        updateQuantityValue(Math.min(val, maxStock));
                      }
                    }}
                    className="flex-grow text-center h-full border-none focus:outline-none font-medium text-gray-900 tabular-nums text-sm"
                  />
                  <button 
                    type="button"
                    onClick={() => updateQuantityValue(Number((quantity + 0.25).toFixed(2)))}
                    disabled={quantity >= maxStock}
                    className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-900 tabular-nums">{formatQuantity(quantity, 'kg')}</span>
                  <span className="mx-1.5">•</span>
                  Subtotal: <strong className="font-semibold text-green-800 tabular-nums">₱{(effectiveUnitPrice * quantity).toFixed(2)}</strong>
                </div>
              </div>

              {minOrder > 1 && (
                <p className="text-xs text-gray-500 mt-2">
                  Minimum order for this product is <span className="tabular-nums font-medium">{minOrder} kg</span>.
                </p>
              )}
            </div>

            <button 
              type="button"
              onClick={handleAddToCart}
              className="w-full bg-green-800 hover:bg-green-900 text-white font-medium py-3 rounded-lg transition-colors text-sm"
            >
              Add to Cart • ₱{(effectiveUnitPrice * quantity).toFixed(2)}
            </button>
          </div>

          {/* Farm Origin & Freshness Specifications (2-Column Key-Value List) */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">
              Farm & Harvest Specifications
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div>
                <dt className="text-gray-500">Farm Origin</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">{product.farm.farmName}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Location</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">
                  {product.farm.barangay ? `Brgy. ${product.farm.barangay}, ` : ''}
                  {product.farm.location || 'Agoo, La Union'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Crop Variety</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">
                  {product.crop?.cropName || product.name}
                  {product.crop?.variety ? ` (${product.crop.variety})` : ''}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Harvest Date</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">
                  {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : 'Same-day harvest'}
                </dd>
              </div>
              <div className="col-span-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                <span className="text-gray-500">Farm Rating</span>
                <span className="font-medium text-gray-900 tabular-nums">★ {avgRating}</span>
              </div>
            </dl>

            <div className="mt-3 flex justify-end">
              <Link
                href={`/farmers/${product.farm.id}`}
                className="text-xs font-medium text-green-800 hover:text-green-900 hover:underline"
              >
                View Farmer Profile & Storefront →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Ratings & Reviews */}
      <section className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                Customer Ratings & Reviews
              </h2>
              <span className="text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border border-green-200 bg-green-50 text-green-800">
                Verified Buyers
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Submitted upon confirmed delivery and escrow release.
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-semibold text-gray-900 tabular-nums">★ {avgRating}</span>
            <span className="text-xs text-gray-500 ml-1">({reviews.length} reviews)</span>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500">
            No customer reviews yet for this harvest batch.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-lg p-4 border border-gray-200 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold text-gray-900">{rev.buyerName}</span>
                      <span className="text-[11px] text-gray-400 ml-1.5">• {rev.buyerLocation}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-800 tabular-nums">★ {rev.rating}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    &ldquo;{rev.review}&rdquo;
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-400 tabular-nums">
                  {new Date(rev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* More From Farmer */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">More from {product.farm.farmName}</h2>
            <div className="flex gap-1.5">
              <button 
                type="button"
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                aria-label="Scroll left"
              >
                ←
              </button>
              <button 
                type="button"
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                aria-label="Scroll right"
              >
                →
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex overflow-x-auto gap-4 pb-2 snap-x hide-scrollbar">
            {relatedProducts.map((related) => (
              <Link
                href={`/products/${related.id}`}
                key={related.id}
                className="min-w-[240px] w-[240px] snap-start bg-white rounded-lg border border-gray-200 hover:border-green-800 overflow-hidden group transition-colors block"
              >
                <div className="h-40 w-full bg-gray-50 overflow-hidden relative">
                  <Image
                    src={related.photos[0] || '/images/crops/generic.jpg'}
                    alt={related.name}
                    fill
                    sizes="240px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-900 truncate">{related.name}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-green-800 tabular-nums">
                      ₱{related.pricePerKg.toFixed(2)} / kg
                    </span>
                    <button 
                      type="button"
                      onClick={(e) => handleRelatedAddToCart(e, related)}
                      className="px-2 py-1 rounded bg-green-800 hover:bg-green-900 text-white text-[11px] font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
