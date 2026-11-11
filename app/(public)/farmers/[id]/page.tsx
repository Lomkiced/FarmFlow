import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicFarmerByIdAction } from '@/app/actions/farm';
import ProductListingCard from '@/components/marketplace/ProductListingCard';
import PaginationBar from '@/components/ui/PaginationBar';
import { sanitizeProfileImageUrl } from '@/lib/constants/farm-media';
import { ProfileAvatar, CoverPhotoPlaceholder } from '@/components/ui/ProfileMediaPlaceholders';

export const dynamic = 'force-dynamic';

export default async function FarmerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const page = typeof sp.page === 'string' ? Math.max(1, parseInt(sp.page) || 1) : 1;
  const pageSize = typeof sp.pageSize === 'string' ? Math.min(36, Math.max(4, parseInt(sp.pageSize) || 8)) : 8;

  const farm = await getPublicFarmerByIdAction(id);

  if (!farm) {
    notFound();
  }

  const totalProducts = farm.products.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedProducts = farm.products.slice((safePage - 1) * pageSize, safePage * pageSize);

  const joinDate = new Date(farm.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const cleanCover = sanitizeProfileImageUrl(farm.coverPhoto);
  const practices = Array.isArray((farm as any).practices) ? ((farm as any).practices as string[]) : [];

  return (
    <main className="flex-grow w-full bg-[#F9FAFB] pb-24">
      {/* Facebook-style Cover & Profile Header */}
      <section className="bg-white border-b border-gray-200">
        {/* Cover Photo */}
        <div className="w-full h-56 sm:h-72 bg-gray-100 border-b border-gray-200 relative overflow-hidden">
          {cleanCover ? (
            <Image
              src={cleanCover}
              alt={`${farm.farmName} Cover`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <CoverPhotoPlaceholder label="No cover photo" />
          )}
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            {/* Avatar + Farm Identity */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              <div className="relative -mt-16 sm:-mt-20 w-32 h-32 sm:w-36 sm:h-36 rounded-full ring-4 ring-white bg-gray-200 shrink-0">
                <ProfileAvatar
                  src={farm.user?.avatarUrl}
                  alt={farm.farmName}
                  className="w-full h-full border border-gray-200"
                  sizes="144px"
                />
              </div>

              <div className="pt-1 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    {farm.farmName}
                  </h1>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded border border-green-200 bg-green-50 text-green-800">
                    Verified Farm
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-600 mt-1">
                  {farm.user?.name || 'Farm Owner'} • Farm Owner
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 tabular-nums">
                  Brgy. {farm.barangay}, {farm.municipality}, {farm.province} • {farm.landArea} Hectares • Joined {joinDate}
                </p>
              </div>
            </div>

            {/* Right-aligned Stats & Actions */}
            <div className="flex flex-wrap items-center gap-2.5 lg:pb-1 shrink-0">
              <span className="h-10 px-4 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-800 text-xs font-semibold tabular-nums">
                ★ {farm.rating > 0 ? farm.rating.toFixed(1) : 'New'}
              </span>
              <span className="h-10 px-4 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-800 text-xs font-semibold tabular-nums">
                {farm._count.products} Active Listings
              </span>
              <Link
                href="/farmers"
                className="h-10 px-4 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
              >
                All Farmers
              </Link>
            </div>
          </div>

          {/* Bio & Practices Row */}
          {(farm.bio || practices.length > 0) && (
            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {farm.bio && (
                <div className="lg:col-span-8">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    About the Farm
                  </h2>
                  <p className="text-sm text-gray-700 leading-relaxed">{farm.bio}</p>
                </div>
              )}
              {practices.length > 0 && (
                <div className="lg:col-span-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Farming Practices
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {practices.map((practice) => (
                      <span
                        key={practice}
                        className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded border border-gray-200"
                      >
                        {practice}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-xl sm:text-2xl text-gray-900 tracking-tight">
            Fresh Harvest from {farm.farmName}
          </h2>
        </div>

        {farm.products.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-1">No Active Products</h3>
            <p className="text-xs text-gray-500">
              This farm doesn&apos;t have any active harvest listings right now.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {paginatedProducts.map((product) => (
                <Link href={`/products/${product.id}`} key={product.id} className="block group">
                  <ProductListingCard
                    id={product.id}
                    image={product.photos[0] || '/images/crops/generic.jpg'}
                    alt={product.name}
                    badge={product.category === 'VEGETABLES' ? 'Organic' : product.stockKg > 10 ? 'In Stock' : 'Low Stock'}
                    badgeVariant={product.category === 'VEGETABLES' ? 'organic' : product.stockKg > 10 ? 'instock' : 'lowstock'}
                    productName={product.name}
                    price={`₱${product.pricePerKg.toFixed(2)}`}
                    unit="/ kg"
                    farmerName={farm.farmName}
                    rating={farm.rating || 0}
                    stockKg={product.stockKg}
                    minOrderQty={product.minOrderQty}
                    wholesalePrice={product.wholesalePrice ? Number(product.wholesalePrice) : null}
                    wholesaleMinQty={product.wholesaleMinQty}
                  />
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <PaginationBar
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={totalProducts}
                pageSize={pageSize}
                pageSizeOptions={[4, 8, 12, 24]}
                itemLabel="farm products"
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
