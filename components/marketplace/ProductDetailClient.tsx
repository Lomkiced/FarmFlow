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
    farm: { farmName: string };
  }[];
}

function ImageGallery({ images, name }: { images: string[], name: string }) {
  const [activeImage, setActiveImage] = useState(0);
  const displayImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&q=80'];

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

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const scrollRef = useRef<HTMLDivElement>(null);

  const badge = product.category === 'VEGETABLES' ? 'Organic' : product.stockKg > 10 ? 'In Stock' : 'Low Stock';

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      pricePerKg: product.pricePerKg,
      quantityKg: quantity,
      stockKg: product.stockKg,
      photo: product.photos[0] || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&q=80',
      farmerName: product.farm.farmName,
    });
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      duration: 2000,
    });
  };

  const handleRelatedAddToCart = (e: React.MouseEvent, related: any) => {
    e.preventDefault();
    addItem({
      productId: related.id,
      name: related.name,
      pricePerKg: related.pricePerKg,
      quantityKg: 1,
      stockKg: related.stockKg ?? 0,
      photo: related.photos[0] || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&q=80',
      farmerName: related.farm.farmName,
    });
    toast.success(`${related.name} added to cart!`, { icon: '🛒', duration: 2000 });
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
          <div className="flex items-end gap-2 mb-[32px]">
            <span className="font-h1 text-primary text-[32px] font-bold leading-[1.2] tracking-[-0.01em]">
              ₱{product.pricePerKg.toFixed(2)}
            </span>
            <span className="font-body-md text-on-surface-variant mb-1">
              / kg
            </span>
          </div>

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
          <div className="flex flex-col gap-[16px] mb-[32px]">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden h-12 w-32 bg-surface-container-lowest">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-full flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <input
                  type="text"
                  aria-label="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="flex-grow text-center h-full border-none focus:ring-0 font-label-md bg-transparent text-on-surface p-0 w-12 outline-none"
                />
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-full flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
              <span className="font-body-md text-on-surface-variant">kg</span>
            </div>

            <button 
              onClick={handleAddToCart}
              className="w-full bg-primary text-on-primary font-label-md py-4 rounded-xl shadow-sm hover:opacity-90 transition-opacity active:scale-[0.98] flex justify-center items-center gap-2"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              Add to Cart
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
                  <Image src={related.photos[0] || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80'} alt={related.name} fill sizes="280px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
