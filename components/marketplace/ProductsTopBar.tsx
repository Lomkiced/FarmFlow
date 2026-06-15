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
  const inStockOnly = searchParams.get('inStockOnly') === 'true';

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
          <span className="font-body-md text-on-surface-variant">Sort by:</span>
          <select 
            value={sort}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="p-2 bg-transparent border-none text-primary font-label-md cursor-pointer outline-none focus:ring-0 appearance-none pr-4 relative"
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
        <span className="font-body-md text-on-surface-variant mr-2">Showing {totalCount} results</span>
        {activeCategory && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm capitalize">
            {activeCategory.toLowerCase()}
            <button onClick={() => clearFilter('category')} className="material-symbols-outlined text-[14px] hover:text-primary leading-none">close</button>
          </span>
        )}
        {inStockOnly && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm">
            In Stock
            <button onClick={() => clearFilter('inStockOnly')} className="material-symbols-outlined text-[14px] hover:text-primary leading-none">close</button>
          </span>
        )}
      </div>
    </>
  );
}
