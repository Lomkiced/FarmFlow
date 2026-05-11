'use client';

interface FilterSidebarProps {
  categories: { [key: string]: boolean };
  setCategories: (cats: { [key: string]: boolean }) => void;
  location: string;
  setLocation: (loc: string) => void;
  priceMin: string;
  setPriceMin: (min: string) => void;
  priceMax: string;
  setPriceMax: (max: string) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  harvestingSoon: boolean;
  setHarvestingSoon: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export default function FilterSidebar({
  categories,
  setCategories,
  location,
  setLocation,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  inStockOnly,
  setInStockOnly,
  harvestingSoon,
  setHarvestingSoon,
  searchQuery,
  setSearchQuery,
}: FilterSidebarProps) {

  const handleCategoryChange = (category: string) => {
    setCategories({
      ...categories,
      [category]: !categories[category],
    });
  };

  const handleClearAll = () => {
    setCategories({
      "All Vegetables": false,
      "Fruits": false,
      "Root Crops": false,
      "Herbs & Spices": false,
    });
    setLocation("Any Barangay");
    setPriceMin("");
    setPriceMax("");
    setInStockOnly(false);
    setHarvestingSoon(false);
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
          {Object.entries(categories).map(([category, isChecked]) => (
            <label key={category} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={isChecked}
                onChange={() => handleCategoryChange(category)}
                className="form-checkbox text-primary accent-primary rounded border-outline-variant focus:ring-primary w-5 h-5 cursor-pointer"
              />
              <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Filter Section 2 - Location */}
      <div className="flex flex-col gap-[8px]">
        <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider">Location (Agoo)</h3>
        <select 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary outline-none text-body-md text-on-surface appearance-none"
        >
          <option value="Any Barangay">Any Barangay</option>
          <option value="San Nicolas">San Nicolas</option>
          <option value="San Julian">San Julian</option>
          <option value="San Roque">San Roque</option>
          <option value="Consolacion">Consolacion</option>
        </select>
      </div>

      {/* Filter Section 3 - Price Range */}
      <div className="flex flex-col gap-[8px]">
        <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider">Price Range (₱)</h3>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-1/2 p-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary outline-none text-body-md text-on-surface"
          />
          <span className="text-on-surface-variant">-</span>
          <input 
            type="number" 
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
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
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="form-checkbox text-primary accent-primary rounded border-outline-variant focus:ring-primary w-5 h-5 cursor-pointer"
            />
            <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">In Stock Only</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={harvestingSoon}
              onChange={(e) => setHarvestingSoon(e.target.checked)}
              className="form-checkbox text-primary accent-primary rounded border-outline-variant focus:ring-primary w-5 h-5 cursor-pointer"
            />
            <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">Harvesting Soon</span>
          </label>
        </div>
      </div>

    </aside>
  );
}
