'use client';

import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface ProductListingCardProps {
  id: string;
  image: string;
  alt: string;
  badge: string;
  badgeVariant: 'organic' | 'instock' | 'lowstock';
  productName: string;
  price: string;
  unit: string;
  farmerName: string;
  rating: number;
  stockKg?: number;
}

export default function ProductListingCard({
  id,
  image,
  alt,
  badge,
  badgeVariant,
  productName,
  price,
  unit,
  farmerName,
  rating,
  stockKg = 0,
}: ProductListingCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      productId: id,
      name: productName,
      pricePerKg: parseFloat(price.replace('₱', '').replace(/,/g, '')),
      quantityKg: 1,
      stockKg,
      photo: image,
      farmerName: farmerName,
    });
    toast.success(`${productName} added to cart!`, { icon: '🛒', duration: 2000 });
  };

  const badgeStyles = {
    organic: 'bg-secondary-container text-on-secondary-container',
    instock: 'bg-surface-container-high text-on-surface',
    lowstock: 'bg-amber-100 text-amber-800',
  };

  // Show real rating if > 0, otherwise show "New" label
  const hasRating = rating > 0;

  return (
    <article className="bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col shadow-[0px_4px_20px_rgba(27,67,50,0.04)] hover:shadow-[0px_12px_32px_rgba(27,67,50,0.08)] transition-shadow duration-300 border border-surface-variant group h-full">
      {/* Image Area */}
      <div className="relative h-48 w-full bg-surface-variant overflow-hidden flex-shrink-0">
        <span className={`absolute top-3 left-3 z-10 px-2 py-1 rounded font-label-sm uppercase tracking-wider ${badgeStyles[badgeVariant]}`}>
          {badge}
        </span>
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-grow gap-2">
        {/* Row 1: Name + Price */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-h3 text-on-surface leading-tight line-clamp-2">{productName}</h3>
          <span className="whitespace-nowrap flex-shrink-0">
            <span className="font-h2 text-primary">{price}</span>
            <span className="font-normal text-on-surface-variant text-sm">{unit}</span>
          </span>
        </div>

        {/* Row 2: Farmer Name */}
        <p className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">storefront</span>
          <span className="font-body-md text-on-surface-variant truncate">{farmerName}</span>
        </p>

        {/* Row 3: Rating */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          {hasRating ? (
            <>
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((pos) => {
                  if (pos <= Math.floor(rating)) {
                    return <span key={pos} className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>;
                  }
                  if (pos === Math.ceil(rating) && rating % 1 !== 0) {
                    return <span key={pos} className="material-symbols-outlined text-[15px]">star_half</span>;
                  }
                  return <span key={pos} className="material-symbols-outlined text-[15px]">star_border</span>;
                })}
              </div>
              <span className="font-label-sm text-on-surface-variant">{rating.toFixed(1)}</span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary bg-secondary-container/30 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[12px]">new_releases</span>
              New Listing
            </span>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleAddToCart}
          className="w-full mt-3 bg-primary text-on-primary font-label-md py-3 rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
          Add to Cart
        </button>
      </div>
    </article>
  );
}
