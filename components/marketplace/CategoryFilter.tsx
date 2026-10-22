'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/marketplace/ProductCard';
import { getProductStockBadge } from '@/lib/utils';

import { PRODUCT_CATEGORIES } from '@/lib/validations/product';

const CATEGORIES = ['All Produce', ...PRODUCT_CATEGORIES];

type Product = {
  id: string;
  name: string;
  category?: string;
  pricePerKg: number;
  stockKg: number;
  photos: string[];
  farm: {
    farmName: string;
    user?: {
      name: string;
      avatarUrl?: string | null;
    } | null;
  };
};

export default function CategoryFilter({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState('All Produce');

  const filteredProducts = activeCategory === 'All Produce'
    ? products
    : products.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <>
      <section>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-2">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`
                  font-label-md text-[14px] whitespace-nowrap shrink-0 px-6 py-2 rounded-xl transition-colors
                  ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-highest text-on-surface border border-outline-variant/30 hover:bg-surface-variant'
                  }
                `}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-12">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-display font-semibold text-h2 text-primary">Featured Harvest</h2>
            <p className="font-sans text-[16px] text-on-surface-variant mt-1">Freshly picked within the last 24 hours.</p>
          </div>
          <Link 
            href={activeCategory === 'All Produce' ? '/products' : `/products?category=${encodeURIComponent(activeCategory)}`} 
            className="hidden md:flex items-center gap-1 text-primary font-label-md hover:underline"
          >
            {activeCategory === 'All Produce' ? 'View all' : `View all in ${activeCategory}`}
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-4 text-center py-12 text-on-surface-variant">
              No products available in this category yet.
            </div>
          ) : (
            filteredProducts.map((product) => {
              const badge = getProductStockBadge(product.stockKg, product.category);
              return (
                <Link key={product.id} href={`/products/${product.id}`} className="block h-full cursor-pointer hover:no-underline">
                  <ProductCard
                    image={product.photos[0] || '/images/crops/generic.jpg'}
                    alt={product.name}
                    badge={badge}
                    farmerAvatar={product.farm.user?.avatarUrl || 'https://i.pravatar.cc/150?img=11'}
                    farmerName={product.farm.farmName}
                    productName={product.name}
                    price={`₱${product.pricePerKg.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  />
                </Link>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}
