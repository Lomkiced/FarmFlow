'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { AGOO_BARANGAYS } from '@/lib/constants/locations';

interface FilterSidebarProps {
  categoriesList: string[];
}

export default function FilterSidebar({ categoriesList }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Create a new URLSearchParams to update and push
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value.trim() !== '') {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    // Reset page to 1 on filter change
    params.set('page', '1');
    return params.toString();
  };

  const updateFilters = (name: string, value: string) => {
    router.push(pathname + '?' + createQueryString(name, value));
  };

  const activeCategory = searchParams.get('category') || '';
  const activeBarangay = searchParams.get('barangay') || '';
  const priceMin = searchParams.get('minPrice') || '';
  const priceMax = searchParams.get('maxPrice') || '';
  const inStockOnly = searchParams.get('inStockOnly') === 'true' || searchParams.get('inStock') === 'true';
  const searchQuery = searchParams.get('query') || searchParams.get('q') || '';

  const handleClearAll = () => {
    router.push(pathname);
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-6">
      
      {/* Mobile Top Bar */}
      <div className="flex gap-2 md:hidden mb-2">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            type="text" 
            placeholder="Search crops..."
            value={searchQuery}
            onChange={(e) => updateFilters('query', e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:ring-1 outline-none text-sm"
          />
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex justify-between items-center pb-4 border-b border-surface-variant">
        <h2 className="font-display text-[20px] font-semibold text-on-surface">Filters</h2>
        {(activeCategory || activeBarangay || priceMin || priceMax || inStockOnly || searchQuery) && (
          <button onClick={handleClearAll} className="text-primary font-label-md text-sm hover:underline">Clear all</button>
        )}
      </div>

      {/* Filter Section 1 - Category */}
      <div className="flex flex-col gap-2">
        <h3 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Category</h3>
        <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
          <label className="flex items-center gap-3 cursor-pointer group py-0.5">
            <input 
              type="radio" 
              name="category"
              checked={activeCategory === '' || activeCategory.toLowerCase() === 'all'}
              onChange={() => updateFilters('category', '')}
              className="form-radio text-primary accent-primary border-outline-variant focus:ring-primary w-4 h-4 cursor-pointer"
            />
            <span className="font-body-md text-sm text-on-surface group-hover:text-primary transition-colors">All Categories</span>
          </label>
          {categoriesList.map((category) => (
            <label key={category} className="flex items-center gap-3 cursor-pointer group py-0.5">
              <input 
                type="radio" 
                name="category"
                checked={activeCategory.toLowerCase() === category.toLowerCase()}
                onChange={() => updateFilters('category', activeCategory.toLowerCase() === category.toLowerCase() ? '' : category)}
                className="form-radio text-primary accent-primary border-outline-variant focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <span className="font-body-md text-sm text-on-surface group-hover:text-primary transition-colors">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Filter Section 2 - Barangay / Location */}
      <div className="flex flex-col gap-2">
        <h3 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Farm Location (Agoo)</h3>
        <div className="relative">
          <select 
            value={activeBarangay}
            onChange={(e) => updateFilters('barangay', e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface focus:border-primary focus:ring-1 outline-none appearance-none pr-9 cursor-pointer"
          >
            <option value="">All Barangays</option>
            {AGOO_BARANGAYS.map((brgy) => (
              <option key={brgy} value={brgy}>{brgy}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
            expand_more
          </span>
        </div>
      </div>

      {/* Filter Section 3 - Price Range */}
      <div className="flex flex-col gap-2">
        <h3 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Price Range (₱/kg)</h3>
        <div className="flex items-center gap-2">
          <div className="relative w-1/2">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-outline">₱</span>
            <input 
              type="number" 
              min="0"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => updateFilters('minPrice', e.target.value)}
              className="w-full pl-6 pr-2 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary outline-none text-sm text-on-surface"
            />
          </div>
          <span className="text-on-surface-variant text-xs">-</span>
          <div className="relative w-1/2">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-outline">₱</span>
            <input 
              type="number" 
              min="0"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => updateFilters('maxPrice', e.target.value)}
              className="w-full pl-6 pr-2 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary outline-none text-sm text-on-surface"
            />
          </div>
        </div>
      </div>

      {/* Filter Section 4 - Availability */}
      <div className="flex flex-col gap-2">
        <h3 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Availability</h3>
        <label className="flex items-center gap-3 cursor-pointer group py-1">
          <input 
            type="checkbox" 
            checked={inStockOnly}
            onChange={(e) => updateFilters('inStockOnly', e.target.checked ? 'true' : '')}
            className="form-checkbox text-primary accent-primary rounded border-outline-variant focus:ring-primary w-4 h-4 cursor-pointer"
          />
          <span className="font-body-md text-sm text-on-surface group-hover:text-primary transition-colors">In Stock Only</span>
        </label>
      </div>

    </aside>
  );
}
