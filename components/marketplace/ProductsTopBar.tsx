'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ProductsTopBar({ totalCount }: { totalCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('query') || '');
  const sort = searchParams.get('sort') || 'newest';

  // Sync state if URL changes externally
  useEffect(() => {
    setQuery(searchParams.get('query') || '');
  }, [searchParams]);

  const updateFilters = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    params.set('page', '1');
    router.push(pathname + '?' + params.toString());
  };

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      const currentQuery = searchParams.get('query') || '';
      if (query !== currentQuery) {
        updateFilters('query', query);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Read active filters for badges
  const activeCategory = searchParams.get('category');
  const activeBarangay = searchParams.get('barangay');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const inStockOnly = searchParams.get('inStockOnly') === 'true' || searchParams.get('inStock') === 'true';

  const clearFilter = (name: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(name);
    params.set('page', '1');
    router.push(pathname + '?' + params.toString());
  };

  return (
    <>
      <div className="hidden md:flex justify-between items-center gap-4">
        <div className="relative w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            type="text" 
            placeholder="Search fresh produce..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:ring-1 outline-none text-body-md shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="font-body-md text-on-surface-variant text-sm">Sort by:</span>
          <select 
            value={sort}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="p-2 bg-transparent border border-outline-variant/50 rounded-lg text-primary font-medium text-sm cursor-pointer outline-none focus:ring-1 focus:ring-primary pr-6"
          >
            <option value="newest">Newly Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Popular</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-body-md text-on-surface-variant text-sm mr-1">Showing {totalCount} results</span>
        {activeCategory && activeCategory.toLowerCase() !== 'all' && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full font-label-sm text-xs capitalize">
            {activeCategory}
            <button onClick={() => clearFilter('category')} className="material-symbols-outlined text-[14px] hover:text-red-500 leading-none">close</button>
          </span>
        )}
        {activeBarangay && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-800 border border-green-200 rounded-full font-label-sm text-xs">
            Barangay: {activeBarangay}
            <button onClick={() => clearFilter('barangay')} className="material-symbols-outlined text-[14px] hover:text-red-700 leading-none">close</button>
          </span>
        )}
        {(minPrice || maxPrice) && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-full font-label-sm text-xs tabular-nums">
            ₱{minPrice || 0} - ₱{maxPrice || '∞'}
            <button 
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete('minPrice');
                params.delete('maxPrice');
                params.set('page', '1');
                router.push(pathname + '?' + params.toString());
              }} 
              className="material-symbols-outlined text-[14px] hover:text-red-700 leading-none"
            >
              close
            </button>
          </span>
        )}
        {inStockOnly && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-full font-label-sm text-xs">
            In Stock
            <button 
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete('inStockOnly');
                params.delete('inStock');
                params.set('page', '1');
                router.push(pathname + '?' + params.toString());
              }} 
              className="material-symbols-outlined text-[14px] hover:text-red-500 leading-none"
            >
              close
            </button>
          </span>
        )}
      </div>
    </>
  );
}
