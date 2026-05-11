'use client';

import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';

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
  reviewCount: number;
  distanceKm: number;
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
  reviewCount,
  distanceKm,
}: ProductListingCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      productId: id,
      name: productName,
      pricePerKg: parseFloat(price.replace('₱', '')),
      quantityKg: 1,
      photo: image,
      farmerName: farmerName,
    });
  };

  const badgeStyles = {
    organic: 'bg-secondary-container text-on-secondary-container',
    instock: 'bg-surface-container-high text-on-surface',
    lowstock: 'bg-amber-100 text-amber-800',
  };

  return (
    <article className="bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col shadow-[0px_4px_20px_rgba(27,67,50,0.04)] hover:shadow-[0px_12px_32px_rgba(27,67,50,0.08)] transition-shadow duration-300 border border-surface-variant group">
      {/* Image Area */}
      <div className="relative h-48 w-full bg-surface-variant overflow-hidden">
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
        <div className="flex justify-between items-start">
          <h3 className="font-h3 text-on-surface leading-tight line-clamp-2">{productName}</h3>
          <span className="whitespace-nowrap ml-2">
            <span className="font-h2 text-primary">{price}</span>
            <span className="font-normal text-on-surface-variant text-sm">{unit}</span>
          </span>
        </div>

        {/* Row 2: Farmer Name */}
        <p className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">person</span>
          <span className="font-body-md text-on-surface-variant">{farmerName}</span>
        </p>

        {/* Row 3: Rating + Distance */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          {/* Star Rating */}
          <div className="flex items-center text-amber-500">
            {[1, 2, 3, 4, 5].map((pos) => {
              if (pos <= Math.floor(rating)) {
                return <span key={pos} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>;
              }
              if (pos === Math.ceil(rating) && rating % 1 !== 0) {
                return <span key={pos} className="material-symbols-outlined text-[16px]">star_half</span>;
              }
              return <span key={pos} className="material-symbols-outlined text-[16px]">star_border</span>;
            })}
          </div>
          <span className="font-label-sm text-on-surface-variant">({reviewCount})</span>

          {/* Distance */}
          <div className="ml-auto flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            <span className="font-label-sm text-on-surface-variant">{distanceKm}km</span>
          </div>
        </div>

        {/* CTA Button */}
        <button 
          onClick={handleAddToCart}
          className="w-full mt-3 bg-primary text-on-primary font-label-md py-3 rounded-lg hover:bg-primary-container transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
          Add to Cart
        </button>
      </div>
    </article>
  );
}
