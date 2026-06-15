import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FilterSidebar from '@/components/marketplace/FilterSidebar';
import ProductListingCard from '@/components/marketplace/ProductListingCard';
import Pagination from '@/components/marketplace/Pagination';
import ProductsTopBar from '@/components/marketplace/ProductsTopBar';
import { getPublicProductsAction } from '@/app/actions/search';
import Link from 'next/link';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ProductsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  const query = typeof searchParams.query === 'string' ? searchParams.query : undefined;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const minPrice = typeof searchParams.minPrice === 'string' ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? parseFloat(searchParams.maxPrice) : undefined;
  const inStockOnly = searchParams.inStockOnly === 'true';
  const sort = typeof searchParams.sort === 'string' ? (searchParams.sort as any) : 'newest';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;

  const { products, total, totalPages, categories } = await getPublicProductsAction({
    query,
    category,
    minPrice: isNaN(minPrice as number) ? undefined : minPrice,
    maxPrice: isNaN(maxPrice as number) ? undefined : maxPrice,
    inStockOnly,
    sort,
    page,
    pageSize: 12,
  });

  return (
    <>
      <Navbar />
      <main className="flex-grow max-w-screen-2xl mx-auto px-8 py-12 w-full">
        <div className="flex flex-col md:flex-row gap-[24px]">
          
          <FilterSidebar categoriesList={categories} />
          
          <section className="flex-grow flex flex-col gap-6">
            
            <ProductsTopBar totalCount={total} />

            {/* Product Grid */}
            {products.length === 0 ? (
              <div className="text-center py-20 text-on-surface-variant bg-surface-container-lowest rounded-xl border border-surface-variant">
                <span className="material-symbols-outlined text-[48px] mb-4 text-outline">search_off</span>
                <h3 className="text-[20px] font-semibold text-on-surface">No harvest found</h3>
                <p className="mt-2 text-[14px]">Try adjusting your filters or search term to find what you're looking for.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                  const badgeVariant = product.category === 'VEGETABLES' ? 'organic' : product.stockKg > 10 ? 'instock' : 'lowstock';
                  const badge = badgeVariant === 'organic' ? 'Organic' : badgeVariant === 'lowstock' ? 'Low Stock' : 'In Stock';
                  
                  return (
                    <Link key={product.id} href={`/products/${product.id}`} className="block h-full cursor-pointer hover:no-underline">
                      <ProductListingCard
                        id={product.id}
                        image={product.photos[0] || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80'}
                        alt={product.name}
                        badge={badge}
                        badgeVariant={badgeVariant as any}
                        productName={product.name}
                        price={`₱${product.pricePerKg.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        unit="/kg"
                        farmerName={product.farm.farmName}
                        rating={product.farm.rating || 5}
                        reviewCount={product.orderItems?.length || 0} // Using order count as proxy for reviews for now
                        distanceKm={Math.floor(Math.random() * 5) + 1} // Mapped for demonstration
                      />
                    </Link>
                  );
                })}
              </div>
            )}

            <Pagination 
              currentPage={page}
              totalPages={totalPages}
            />

          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}