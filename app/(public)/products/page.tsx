import FilterSidebar from '@/components/marketplace/FilterSidebar';
import ProductListingCard from '@/components/marketplace/ProductListingCard';
import Pagination from '@/components/marketplace/Pagination';
import ProductsTopBar from '@/components/marketplace/ProductsTopBar';
import { getPublicProductsAction } from '@/app/actions/search';
import { getProductStockBadge } from '@/lib/utils';
import Link from 'next/link';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const dynamic = 'force-dynamic';

export default async function ProductsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  const query = typeof searchParams.query === 'string' ? searchParams.query : typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const barangay = typeof searchParams.barangay === 'string' ? searchParams.barangay : undefined;
  const minPrice = typeof searchParams.minPrice === 'string' ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? parseFloat(searchParams.maxPrice) : undefined;
  const inStockOnly = searchParams.inStockOnly === 'true' || searchParams.inStock === 'true';
  const sort = typeof searchParams.sort === 'string' ? (searchParams.sort as any) : 'newest';
  const page = typeof searchParams.page === 'string' ? Math.max(1, parseInt(searchParams.page) || 1) : 1;
  const pageSize = typeof searchParams.pageSize === 'string' ? Math.min(48, Math.max(4, parseInt(searchParams.pageSize) || 12)) : 12;

  const { products, total, totalPages, categories } = await getPublicProductsAction({
    query,
    category,
    barangay,
    minPrice: isNaN(minPrice as number) ? undefined : minPrice,
    maxPrice: isNaN(maxPrice as number) ? undefined : maxPrice,
    inStockOnly,
    sort,
    page,
    pageSize,
  });

  return (
    <main className="flex-grow max-w-screen-2xl mx-auto px-4 md:px-8 py-10 w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-green-800 transition-colors">
          ← Back to Home
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded border border-green-200 bg-green-50 text-green-800">
            Harvested Fresh • La Union
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700">
            Escrow Protected
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <FilterSidebar categoriesList={[...categories]} />

        <section className="flex-grow flex flex-col gap-6">
          <ProductsTopBar totalCount={total} />

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center p-6">
              <h3 className="text-base font-semibold text-gray-900">No harvest found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search term to find what you're looking for.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => {
                const stockStatus = getProductStockBadge(product.stockKg, product.category);
                const badgeVariant = product.category === 'Vegetables' || product.category === 'VEGETABLES' ? 'organic' : stockStatus === 'Low Stock' ? 'lowstock' : 'instock';
                const badge = badgeVariant === 'organic' ? 'Organic' : stockStatus;

                return (
                  <Link key={product.id} href={`/products/${product.id}`} className="block h-full cursor-pointer hover:no-underline">
                    <ProductListingCard
                      id={product.id}
                      image={product.photos[0] || '/images/crops/generic.jpg'}
                      alt={product.name}
                      badge={badge}
                      badgeVariant={badgeVariant as any}
                      productName={product.name}
                      price={`₱${product.pricePerKg.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                      unit="/kg"
                      farmerName={product.farm.farmName}
                      rating={product.farm.rating || 0}
                      stockKg={product.stockKg}
                      minOrderQty={product.minOrderQty}
                      wholesalePrice={product.wholesalePrice ? Number(product.wholesalePrice) : null}
                      wholesaleMinQty={product.wholesaleMinQty}
                    />
                  </Link>
                );
              })}
            </div>
          )}

          <Pagination 
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            itemLabel="harvest listings"
          />
        </section>
      </div>
    </main>
  );
}
