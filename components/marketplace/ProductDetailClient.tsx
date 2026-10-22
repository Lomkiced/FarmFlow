'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
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
      user: { name: string; avatarUrl: string | null } | null;
      _count: { products: number };
      rating?: number;
    };
    crop: { cropName: string } | null;
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
}

function ImageGallery({ images, name }: { images: string[], name: string }) {
  const [activeImage, setActiveImage] = useState(0);
  const displayImages = images.length > 0 ? images : ['/images/crops/generic.jpg'];

  return (
    <div className="lg:col-span-7 flex flex-col gap-[8px]">
      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-surface-container shadow-level-1 relative">
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
        <div className="grid grid-cols-4 gap-[8px]">
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`aspect-square rounded-lg overflow-hidden bg-surface-container cursor-pointer relative transition-colors border-2 ${
                activeImage === idx ? 'border-primary' : 'border-transparent hover:border-outline-variant'
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

import { formatQuantity, formatFraction } from '@/lib/utils';

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  // Effective MOQ: if farmer set explicit MOQ > 1, use it. Otherwise allow 0.25 kg.
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
    toast.success(`${product.name} (${formatQuantity(finalQty, 'kg')}) added to cart!`, {
      icon: '🛒',
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
    toast.success(`${related.name} added to cart! (${formatQuantity(relMoq, 'kg')})`, { icon: '🛒', duration: 2000 });
  };

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: dir === 'left' ? -300 : 300,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <nav className="mb-[16px] flex items-center gap-2 text-[14px] font-medium text-on-surface-variant" style={{ letterSpacing: '0.01em' }}>
        <Link href="/products" className="hover:text-primary transition-colors">
          Marketplace
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-primary transition-colors capitalize">
          {product.category.toLowerCase()}
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <ImageGallery images={product.photos} name={product.name} />

        <div className="lg:col-span-5 flex flex-col h-full">
          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 mb-[16px]">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm uppercase tracking-[0.03em]">
              {badge}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-label-sm uppercase tracking-[0.03em]">
              <span className="material-symbols-outlined text-[14px]">scale</span>
              Min. Order: {minOrder} kg
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm uppercase tracking-[0.03em]">
              <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Freshness Guaranteed
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-[48px] font-bold leading-[1.1] tracking-[-0.02em] text-on-background mb-[8px]">
            {product.name}
          </h1>

          {/* Price Row */}
          <div className="flex flex-wrap items-baseline gap-2 mb-[16px]">
            <span className="font-h1 text-primary text-[36px] font-bold leading-[1.2] tracking-[-0.01em]">
              ₱{effectiveUnitPrice.toFixed(2)}
            </span>
            {wholesaleActive && (
              <span className="line-through text-on-surface-variant text-[20px] font-medium">
                ₱{product.pricePerKg.toFixed(2)}
              </span>
            )}
            <span className="font-body-md text-on-surface-variant">
              / kg
            </span>
            {wholesaleActive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Wholesale Price Applied
              </span>
            )}
          </div>

          {/* Wholesale Tier Callout */}
          {hasWholesale && !wholesaleActive && (
            <div className="mb-[24px] p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <span className="font-medium">
                💡 Order <strong>{product.wholesaleMinQty} kg</strong> or more to get the wholesale rate of <strong>₱{Number(product.wholesalePrice).toFixed(2)}/kg</strong>!
              </span>
              <button
                type="button"
                onClick={() => setQuantity(product.wholesaleMinQty || 1)}
                className="ml-2 font-bold text-emerald-800 underline hover:text-emerald-950 shrink-0"
              >
                Set to {product.wholesaleMinQty} kg
              </button>
            </div>
          )}

          {/* Description */}
          <div className="mb-[32px] border-b border-surface-variant pb-[32px] space-y-4">
            <p className="font-body-lg text-on-surface-variant text-[18px]">
              {product.description || `Locally grown ${product.name.toLowerCase()} straight from ${product.farm.farmName}.`}
            </p>
            {product.harvestDate && (
              <div className="flex items-center gap-2 mt-4 text-on-surface">
                <span className="material-symbols-outlined text-outline">calendar_month</span>
                <span className="font-label-md">
                  Harvested: <strong className="font-semibold">{new Date(product.harvestDate).toLocaleDateString()}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Purchase Actions */}
          <div className="flex flex-col gap-[20px] mb-[32px]">
            <div>
              {/* Quick Fraction Selector Pills */}
              <div className="mb-3">
                <label className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1.5">
                  Quick Select Weight
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '1/4 kg', val: 0.25, badge: '0.25' },
                    { label: '1/2 kg', val: 0.5, badge: '0.5' },
                    { label: '3/4 kg', val: 0.75, badge: '0.75' },
                    { label: '1 kg', val: 1.0, badge: '1.0' },
                  ].map((pill) => {
                    const isSelected = Math.abs(quantity - pill.val) < 0.01;
                    const isDisabled = pill.val < minOrder || pill.val > maxStock;
                    return (
                      <button
                        key={pill.val}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => updateQuantityValue(pill.val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-primary text-on-primary border-primary shadow-sm scale-105'
                            : isDisabled
                            ? 'opacity-40 cursor-not-allowed bg-surface-container border-outline-variant/30 text-on-surface-variant'
                            : 'bg-surface-container-lowest border-outline-variant/60 text-on-surface hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        <span>{pill.label}</span>
                        <span className={`text-[10px] px-1 py-0.2 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-surface-variant text-on-surface-variant'}`}>
                          {pill.badge}
                        </span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => updateQuantityValue(Number((quantity + 0.5).toFixed(2)))}
                    disabled={quantity + 0.5 > maxStock}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    + 1/2 kg
                  </button>
                </div>
              </div>

              {/* Quantity Stepper & Display */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden h-12 w-44 bg-surface-container-lowest shadow-sm">
                  <button 
                    type="button"
                    onClick={() => updateQuantityValue(Number((quantity - 0.25).toFixed(2)))}
                    disabled={quantity <= minOrder}
                    className="w-11 h-full flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Decrease quantity by 0.25 kg"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
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
                    className="flex-grow text-center h-full border-none focus:ring-0 font-label-md bg-transparent text-on-surface p-0 w-16 outline-none font-bold text-base"
                  />
                  <button 
                    type="button"
                    onClick={() => updateQuantityValue(Number((quantity + 0.25).toFixed(2)))}
                    disabled={quantity >= maxStock}
                    className="w-11 h-full flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Increase quantity by 0.25 kg"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-body-md text-on-surface font-bold text-base">
                      {formatQuantity(quantity, 'kg')}
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-variant">
                    Subtotal: <strong className="text-primary font-bold">₱{(effectiveUnitPrice * quantity).toFixed(2)}</strong>
                  </span>
                </div>
              </div>

              {minOrder > 1 && (
                <p className="text-[12px] text-on-surface-variant mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">info</span>
                  Minimum order for this product is <strong>{minOrder} kg</strong>.
                </p>
              )}
            </div>

            <button 
              onClick={handleAddToCart}
              className="w-full bg-primary text-on-primary font-label-md py-4 rounded-xl shadow-sm hover:opacity-90 transition-opacity active:scale-[0.98] flex justify-center items-center gap-2 text-base font-semibold"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              Add to Cart • ₱{(effectiveUnitPrice * quantity).toFixed(2)}
            </button>
          </div>

          {/* Farmer Card */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-level-1 border border-surface-container-highest mt-auto">
            <div className="font-label-sm text-outline uppercase tracking-[0.03em] mb-4">Cultivated By</div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-variant flex-shrink-0 relative">
                <Image src={product.farm.user?.avatarUrl || 'https://i.pravatar.cc/150?img=57'} alt={product.farm.farmName} fill className="object-cover" sizes="64px" />
              </div>
              <div className="flex-grow">
                <div className="font-h3 text-on-surface mb-1">{product.farm.farmName}</div>
                <div className="flex items-center gap-1 font-body-md text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  Agoo, La Union
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-container-highest">
              <div className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-label-md">{product.farm.rating || 5.0}</span>
              </div>
              <Link href={`/farmers/${product.farm.id}`} className="font-label-md text-primary hover:text-primary-container font-semibold transition-colors">
                View Farm
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* More From Farmer */}
      {relatedProducts.length > 0 && (
        <section className="mt-[48px] pt-[48px] border-t border-surface-variant">
          <div className="flex justify-between items-end mb-[32px]">
            <h2 className="font-h2 text-on-background tracking-[-0.01em]">More from {product.farm.farmName}</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex overflow-x-auto gap-6 pb-4 snap-x hide-scrollbar">
            {relatedProducts.map(related => (
              <Link href={`/products/${related.id}`} key={related.id} className="min-w-[280px] w-[280px] snap-start bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden group cursor-pointer border border-transparent hover:border-surface-variant transition-colors block">
                <div className="h-48 w-full bg-surface-container overflow-hidden relative">
                  <Image src={related.photos[0] || '/images/crops/generic.jpg'} alt={related.name} fill sizes="280px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <div className="font-h3 text-on-surface line-clamp-1">{related.name}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="font-label-md font-semibold text-primary">
                      ₱{related.pricePerKg.toFixed(2)} / kg
                    </div>
                    <button 
                      onClick={(e) => handleRelatedAddToCart(e, related)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
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
