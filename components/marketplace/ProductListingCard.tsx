'use client';

import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { formatQuantity } from '@/lib/utils';
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
  minOrderQty?: number;
  wholesalePrice?: number | string | null;
  wholesaleMinQty?: number | null;
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
  minOrderQty = 0.25,
  wholesalePrice,
  wholesaleMinQty,
}: ProductListingCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const effectiveMoq = (minOrderQty && minOrderQty > 1) ? minOrderQty : (minOrderQty ?? 0.25);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: id,
      name: productName,
      pricePerKg: parseFloat(price.replace('₱', '').replace(/,/g, '')),
      quantityKg: effectiveMoq,
      stockKg,
      photo: image,
      farmerName: farmerName,
      minOrderQty: effectiveMoq,
      wholesalePrice: wholesalePrice ? Number(wholesalePrice) : null,
      wholesaleMinQty: wholesaleMinQty ? Number(wholesaleMinQty) : null,
    });
    toast.success(`${productName} added to cart (${formatQuantity(effectiveMoq, 'kg')})`, { duration: 2000 });
  };

  const badgeClass = badgeVariant === 'lowstock'
    ? 'border-gray-200 bg-gray-100 text-gray-700'
    : 'border-green-200 bg-green-50 text-green-800';

  const hasRating = rating > 0;

  return (
    <article className="bg-white rounded-lg overflow-hidden flex flex-col border border-gray-200 hover:border-green-800 transition-colors h-full">
      {/* Image Area */}
      <div className="relative h-48 w-full bg-gray-50 overflow-hidden flex-shrink-0">
        <span className={`absolute top-2.5 left-2.5 z-10 text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border ${badgeClass}`}>
          {badge}
        </span>
        <span className="absolute top-2.5 right-2.5 z-10 text-[11px] font-medium tracking-tight px-2 py-0.5 rounded border border-gray-200 bg-white/95 text-gray-700 tabular-nums">
          Min. {effectiveMoq >= 1 ? `${effectiveMoq} kg` : formatQuantity(effectiveMoq, 'kg')}
        </span>
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-grow justify-between gap-3">
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{productName}</h3>
            <div className="text-right whitespace-nowrap flex-shrink-0">
              <span className="text-base font-semibold text-green-800 tabular-nums">{price}</span>
              <span className="text-xs text-gray-500 font-normal">{unit}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 truncate">{farmerName}</p>

          {wholesalePrice && wholesaleMinQty && (
            <p className="text-[11px] text-green-800 font-medium tabular-nums pt-1">
              Wholesale: ₱{Number(wholesalePrice).toFixed(2)}/kg (≥{wholesaleMinQty} kg)
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          <span className="text-xs text-gray-600 tabular-nums font-medium">
            {hasRating ? `★ ${rating.toFixed(1)}` : 'New harvest'}
          </span>

          <button
            type="button"
            onClick={handleAddToCart}
            className="px-3 py-1.5 rounded-lg bg-green-800 hover:bg-green-900 text-white text-xs font-medium transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
