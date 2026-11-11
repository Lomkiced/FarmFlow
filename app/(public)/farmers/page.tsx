import Image from 'next/image';
import Link from 'next/link';
import { getPublicFarmersAction } from '@/app/actions/farm';
import FarmersSearchBar from '@/components/marketplace/FarmersSearchBar';
import PaginationBar from '@/components/ui/PaginationBar';
import { sanitizeProfileImageUrl } from '@/lib/constants/farm-media';
import { ProfileAvatar, CoverPhotoPlaceholder } from '@/components/ui/ProfileMediaPlaceholders';

type Props = {
  searchParams: Promise<{ search?: string; sort?: string; page?: string; pageSize?: string }>;
};

export const dynamic = 'force-dynamic';

export default async function FarmersDirectoryPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search || '';
  const sort = (params.sort as 'rating' | 'products' | 'name') || 'rating';
  const page = typeof params.page === 'string' ? Math.max(1, parseInt(params.page) || 1) : 1;
  const pageSize = typeof params.pageSize === 'string' ? Math.min(36, Math.max(3, parseInt(params.pageSize) || 6)) : 6;

  const farmers = await getPublicFarmersAction({ search, sort });
  const totalFarmers = farmers.length;
  const totalPages = Math.max(1, Math.ceil(totalFarmers / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedFarmers = farmers.slice((safePage - 1) * pageSize, safePage * pageSize);

  const SORT_LABELS: Record<string, string> = {
    rating: 'Top Rated',
    products: 'Most Listings',
    name: 'A–Z',
  };

  return (
    <main className="flex-grow w-full bg-[#F9FAFB] pb-24">
      {/* Header */}
      <div className="bg-[#0B291B] pt-12 pb-20 px-6 border-b border-green-900">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-block px-2.5 py-0.5 rounded bg-green-900 text-green-100 border border-green-700/60 text-[11px] font-semibold uppercase tracking-wider mb-3">
            RSBSA &amp; KYC Verified Registry
          </span>
          <h1 className="font-bold text-3xl sm:text-4xl text-white mb-3 tracking-tight">
            Verified Farmers Directory
          </h1>
          <p className="text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
            Discover verified local growers in Agoo, La Union cultivating fresh produce for retail and wholesale delivery.
          </p>
        </div>
      </div>

      {/* Search / Filter Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 mb-10">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <FarmersSearchBar initialSearch={search} />

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-500 font-medium hidden sm:block">Sort:</span>
            {(['rating', 'products', 'name'] as const).map((s) => (
              <Link
                key={s}
                href={`/farmers?${new URLSearchParams({ ...(search ? { search } : {}), sort: s }).toString()}`}
                className={`h-9 px-3.5 inline-flex items-center justify-center rounded-lg text-xs font-medium border transition-colors ${
                  sort === s
                    ? 'bg-green-800 text-white border-green-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {SORT_LABELS[s]}
              </Link>
            ))}
          </div>
        </div>

        {/* Results summary */}
        <div className="mt-3 px-1 text-xs text-gray-500 tabular-nums">
          {search ? (
            <>
              Showing <strong className="text-gray-900">{farmers.length}</strong> result{farmers.length !== 1 ? 's' : ''} for &quot;<strong className="text-green-800">{search}</strong>&quot;{' '}
              <Link href="/farmers" className="text-green-800 hover:underline ml-1 font-medium">Clear</Link>
            </>
          ) : (
            <><strong className="text-gray-900">{farmers.length}</strong> verified farmer{farmers.length !== 1 ? 's' : ''} on FarmFlow</>
          )}
        </div>
      </div>

      {/* Farmer Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {farmers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <h2 className="text-base font-bold text-gray-900 mb-1">
              {search ? `No farmers found for "${search}"` : 'No Farmers Listed Yet'}
            </h2>
            <p className="text-xs text-gray-500">
              {search ? 'Try a different search term or clear your search.' : 'Check back later as more verified farmers join.'}
            </p>
            {search && (
              <Link
                href="/farmers"
                className="mt-5 inline-flex items-center justify-center h-9 px-4 bg-green-800 text-white rounded-lg text-xs font-medium hover:bg-green-900 transition-colors"
              >
                View All Farmers
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedFarmers.map((farm) => {
                const cleanCover = sanitizeProfileImageUrl(farm.coverPhoto);

                return (
                  <Link
                    href={`/farmers/${farm.id}`}
                    key={farm.id}
                    className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-green-800 transition-colors flex flex-col"
                  >
                    {/* Cover Photo or Clean Empty Placeholder */}
                    <div className="h-40 w-full bg-gray-100 border-b border-gray-200 relative overflow-hidden">
                      {cleanCover ? (
                        <Image
                          src={cleanCover}
                          alt={farm.farmName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <CoverPhotoPlaceholder label="No Cover Photo" />
                      )}

                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3 bg-white text-gray-900 border border-gray-200 px-2.5 py-0.5 rounded text-[11px] font-semibold tabular-nums">
                        ★ {farm.rating > 0 ? farm.rating.toFixed(1) : 'New'}
                      </div>
                    </div>

                    {/* Profile Content */}
                    <div className="p-5 flex-grow flex flex-col relative -mt-10">
                      {/* Avatar & Name */}
                      <div className="flex gap-3.5 items-end mb-4">
                        <ProfileAvatar
                          src={farm.user?.avatarUrl}
                          alt={farm.farmName}
                          className="w-20 h-20 ring-4 ring-white border border-gray-200 z-10"
                          sizes="80px"
                        />
                        <div className="pb-1 z-10 w-full min-w-0">
                          <h2 className="font-bold text-lg text-gray-900 truncate group-hover:text-green-800 transition-colors">
                            {farm.farmName}
                          </h2>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {farm.barangay}, {farm.municipality}
                          </p>
                        </div>
                      </div>

                      {/* Bio snippet */}
                      <p className="text-xs text-gray-600 line-clamp-2 mb-5 flex-grow leading-relaxed">
                        {farm.bio || `A verified farm in Brgy. ${farm.barangay}, ${farm.municipality} supplying fresh local harvest.`}
                      </p>

                      {/* Products Preview Area */}
                      <div className="pt-3.5 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Fresh Harvests
                          </span>
                          <span className="text-xs font-medium text-green-800 group-hover:underline tabular-nums">
                            {farm._count.products} Products →
                          </span>
                        </div>

                        {farm.products.length > 0 ? (
                          <div className="flex gap-2">
                            {farm.products.map((p) => (
                              <div
                                key={p.id}
                                className="w-12 h-12 rounded-lg relative overflow-hidden border border-gray-200 bg-gray-50 shrink-0"
                              >
                                <Image
                                  src={p.photos[0] || '/images/crops/generic.jpg'}
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                            ))}
                            {farm._count.products > 3 && (
                              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600 text-xs font-semibold border border-gray-200 tabular-nums">
                                +{farm._count.products - 3}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 py-1.5">
                            No active listings currently.
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-10">
              <PaginationBar
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={totalFarmers}
                pageSize={pageSize}
                pageSizeOptions={[3, 6, 9, 18]}
                itemLabel="verified farmers"
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
