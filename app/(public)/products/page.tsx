'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FilterSidebar from '@/components/marketplace/FilterSidebar';
import ProductListingCard from '@/components/marketplace/ProductListingCard';
import Pagination from '@/components/marketplace/Pagination';

const mockProducts = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80',
    alt: 'Fresh organic tomatoes',
    badge: 'Organic',
    badgeVariant: 'organic' as const,
    productName: 'Heirloom Tomatoes',
    price: '₱120',
    unit: '/kg',
    farmerName: 'Juan dela Cruz',
    rating: 4.5,
    reviewCount: 24,
    distanceKm: 2.5,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&q=80',
    alt: 'Crisp Romaine Lettuce',
    badge: 'In Stock',
    badgeVariant: 'instock' as const,
    productName: 'Crisp Romaine Lettuce',
    price: '₱85',
    unit: '/head',
    farmerName: 'Maria Santos Farm',
    rating: 5,
    reviewCount: 56,
    distanceKm: 4.1,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400&q=80',
    alt: 'Fresh Carrots',
    badge: 'In Stock',
    badgeVariant: 'instock' as const,
    productName: 'Fresh Carrots',
    price: '₱60',
    unit: '/kg',
    farmerName: 'Reyes Agri Coop',
    rating: 3,
    reviewCount: 12,
    distanceKm: 1.2,
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&q=80',
    alt: 'White Onions',
    badge: 'In Stock',
    badgeVariant: 'instock' as const,
    productName: 'White Onions',
    price: '₱150',
    unit: '/kg',
    farmerName: 'Agoo Central Farms',
    rating: 4,
    reviewCount: 89,
    distanceKm: 0.8,
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400&q=80',
    alt: 'Purple Eggplant',
    badge: 'In Stock',
    badgeVariant: 'instock' as const,
    productName: 'Purple Eggplant',
    price: '₱55',
    unit: '/kg',
    farmerName: 'Barangay Sta. Cruz Farm',
    rating: 4.5,
    reviewCount: 31,
    distanceKm: 3.3,
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=400&q=80',
    alt: 'Fresh Kangkong',
    badge: 'In Stock',
    badgeVariant: 'instock' as const,
    productName: 'Kangkong (Water Spinach)',
    price: '₱30',
    unit: '/bundle',
    farmerName: 'Mang Pedro Fields',
    rating: 4,
    reviewCount: 18,
    distanceKm: 1.8,
  },
  {
    id: '7',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
    alt: 'Dinorado Rice',
    badge: 'Low Stock',
    badgeVariant: 'lowstock' as const,
    productName: 'Dinorado Premium Rice',
    price: '₱65',
    unit: '/kg',
    farmerName: 'San Nicolas Coop',
    rating: 5,
    reviewCount: 103,
    distanceKm: 5.0,
  },
  {
    id: '8',
    image: 'https://images.unsplash.com/photo-1471194402529-8e0f5cf8b0a8?w=400&q=80',
    alt: 'Fresh Sitaw',
    badge: 'Organic',
    badgeVariant: 'organic' as const,
    productName: 'Sitaw (String Beans)',
    price: '₱45',
    unit: '/bundle',
    farmerName: 'Aling Rosa Organics',
    rating: 3.5,
    reviewCount: 9,
    distanceKm: 2.1,
  },
];

export default function ProductsPage() {
  const [categories, setCategories] = useState<{ [key: string]: boolean }>({
    "All Vegetables": true,
    "Fruits": false,
    "Root Crops": false,
    "Herbs & Spices": false,
  });
  const [location, setLocation] = useState("Any Barangay");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [inStockOnly, setInStockOnly] = useState(true);
  const [harvestingSoon, setHarvestingSoon] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("Newly Listed");
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <>
      <Navbar />
      <main className="flex-grow max-w-screen-2xl mx-auto px-8 py-12 w-full">
        <div className="flex flex-col md:flex-row gap-[24px]">
          
          <FilterSidebar 
            categories={categories}
            setCategories={setCategories}
            location={location}
            setLocation={setLocation}
            priceMin={priceMin}
            setPriceMin={setPriceMin}
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            harvestingSoon={harvestingSoon}
            setHarvestingSoon={setHarvestingSoon}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          
          <section className="flex-grow flex flex-col gap-6">
            
            {/* Desktop Top Bar */}
            <div className="hidden md:flex justify-between items-center gap-4">
              <div className="relative w-96">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input 
                  type="text" 
                  placeholder="Search fresh produce..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:ring-1 outline-none text-body-md shadow-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-body-md text-on-surface-variant">Sort by:</span>
                <select 
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="p-2 bg-transparent border-none text-primary font-label-md cursor-pointer outline-none focus:ring-0 appearance-none pr-4 relative"
                >
                  <option value="Newly Listed">Newly Listed</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                  <option value="Highest Rated">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-body-md text-on-surface-variant mr-2">Showing 124 results for:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm">
                All Vegetables
                <button className="material-symbols-outlined text-[14px] hover:text-primary leading-none">close</button>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm">
                In Stock
                <button className="material-symbols-outlined text-[14px] hover:text-primary leading-none">close</button>
              </span>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockProducts.map((product) => (
                <ProductListingCard key={product.id} {...product} />
              ))}
            </div>

            <Pagination 
              currentPage={currentPage}
              totalPages={12}
              onPageChange={setCurrentPage}
            />

          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}