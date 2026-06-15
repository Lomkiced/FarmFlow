'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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
    if (value) {
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
  const priceMin = searchParams.get('minPrice') || '';
  const priceMax = searchParams.get('maxPrice') || '';
  const inStockOnly = searchParams.get('inStockOnly') === 'true';
  const searchQuery = searchParams.get('query') || '';

  const handleClearAll = () => {
    router.push(pathname);
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-6">
      
      {/* Mobile Top Bar */}
      <div className="flex gap-2 md:hidden mb-4">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            type="text" 
            placeholder="Search crops..."
            value={searchQuery}
            onChange={(e) => updateFilters('query', e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:ring-1 outline-none"
          />
        </div>
        <button className="p-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface">
          <span className="material-symbols-outlined">tune</span>
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex justify-between items-center pb-4 border-b border-surface-variant">
        <h2 className="font-display text-[20px] font-semibold text-on-surface">Filters</h2>
        <button onClick={handleClearAll} className="text-primary font-label-md hover:underline">Clear all</button>
      </div>

      {/* Filter Section 1 - Category */}
      <div className="flex flex-col gap-[8px]">
        <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider">Category</h3>
        <div className="flex flex-col gap-2">
          {categoriesList.map((category) => (
            <label key={category} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="category"
                checked={activeCategory === category}
                onChange={() => updateFilters('category', activeCategory === category ? '' : category)}
                className="form-radio text-primary accent-primary border-outline-variant focus:ring-primary w-5 h-5 cursor-pointer"
              />
              <span className="font-body-md text-on-surface group-hover:text-primary transition-colors capitalize">{category.toLowerCase()}</span>
            </label>
          ))}
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="radio" 
              name="category"
              checked={activeCategory === ''}
              onChange={() => updateFilters('category', '')}
              className="form-radio text-primary accent-primary border-outline-variant focus:ring-primary w-5 h-5 cursor-pointer"
            />
            <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">All Categories</span>
          </label>
        </div>
      </div>

      {/* Filter Section 3 - Price Range */}
      <div className="flex flex-col gap-[8px]">
        <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider">Price Range (₱)</h3>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min"
            value={priceMin}
            onChange={(e) => updateFilters('minPrice', e.target.value)}
            className="w-1/2 p-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary outline-none text-body-md text-on-surface"
          />
          <span className="text-on-surface-variant">-</span>
          <input 
            type="number" 
            placeholder="Max"
            value={priceMax}
            onChange={(e) => updateFilters('maxPrice', e.target.value)}
            className="w-1/2 p-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary outline-none text-body-md text-on-surface"
          />
        </div>
      </div>

      {/* Filter Section 4 - Availability */}
      <div className="flex flex-col gap-[8px]">
        <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider">Availability</h3>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={inStockOnly}
              onChange={(e) => updateFilters('inStockOnly', e.target.checked ? 'true' : '')}
              className="form-checkbox text-primary accent-primary rounded border-outline-variant focus:ring-primary w-5 h-5 cursor-pointer"
            />
            <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">In Stock Only</span>
          </label>
        </div>
      </div>

    </aside>
  );
}
