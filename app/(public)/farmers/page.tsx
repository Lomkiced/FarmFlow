import Image from 'next/image';
import Link from 'next/link';
import { getPublicFarmersAction } from '@/app/actions/farm';
import FarmersSearchBar from '@/components/marketplace/FarmersSearchBar';

type Props = {
  searchParams: Promise<{ search?: string; sort?: string }>;
};

export const dynamic = 'force-dynamic';

export default async function FarmersDirectoryPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params.search || '';
  const sort = (params.sort as 'rating' | 'products' | 'name') || 'rating';

  const farmers = await getPublicFarmersAction({ search, sort });

  const SORT_LABELS: Record<string, string> = {
    rating: 'Top Rated',
    products: 'Most Listings',
    name: 'A–Z',
  };

  return (
    <main className="flex-grow w-full bg-background pb-24">
      {/* ─── Header ────────────────────────────────────────────────────────────── */}
      <div className="bg-primary pt-12 pb-24 px-6 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 tracking-tight drop-shadow-md">
            Meet Our Farmers
          </h1>
          <p className="font-body-lg text-white/90 max-w-2xl mx-auto drop-shadow-sm">
            Discover the dedicated individuals and families growing the fresh produce that sustains our community.
          </p>
        </div>
      </div>

      {/* ─── Search / Filter Bar ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 mb-12">
        <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-6 shadow-level-2 border border-surface-variant flex flex-col md:flex-row gap-4 items-center justify-between">
          <FarmersSearchBar initialSearch={search} />

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-on-surface-variant font-medium hidden sm:block">Sort:</span>
            {(['rating', 'products', 'name'] as const).map((s) => (
              <Link
                key={s}
                href={`/farmers?${new URLSearchParams({ ...(search ? { search } : {}), sort: s }).toString()}`}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  sort === s
                    ? 'bg-primary text-on-primary border-primary shadow-sm'
                    : 'bg-surface-container border-outline-variant text-on-surface hover:bg-surface-variant'
                }`}
              >
                {SORT_LABELS[s]}
              </Link>
            ))}
          </div>
        </div>

        {/* Results summary */}
        <div className="mt-3 px-1 text-sm text-on-surface-variant">
          {search ? (
            <>
              Showing <strong className="text-on-surface">{farmers.length}</strong> result{farmers.length !== 1 ? 's' : ''} for &quot;<strong className="text-primary">{search}</strong>&quot;{' '}
              <Link href="/farmers" className="text-primary hover:underline ml-1">Clear</Link>
            </>
          ) : (
            <><strong className="text-on-surface">{farmers.length}</strong> verified farmer{farmers.length !== 1 ? 's' : ''} on FarmFlow</>
          )}
        </div>
      </div>

      {/* ─── Farmer Grid ───────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6">
        {farmers.length === 0 ? (
          <div className="text-center py-20 bg-surface-container rounded-3xl border border-surface-variant border-dashed">
            <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">agriculture</span>
            <h2 className="font-h2 text-on-surface mb-2">
              {search ? `No farmers found for "${search}"` : 'No Farmers Yet'}
            </h2>
            <p className="font-body-md text-on-surface-variant">
              {search ? 'Try a different search term or clear your search.' : 'Check back later as more farmers join the platform.'}
            </p>
            {search && (
              <Link href="/farmers" className="mt-6 inline-block bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md hover:bg-primary/90 transition-colors">
                View All Farmers
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {farmers.map((farm) => (
              <Link
                href={`/farmers/${farm.id}`}
                key={farm.id}
                className="group bg-surface-container-lowest rounded-3xl overflow-hidden border border-surface-variant shadow-[0px_4px_20px_rgba(27,67,50,0.04)] hover:shadow-[0px_12px_32px_rgba(27,67,50,0.12)] transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Cover Photo */}
                <div className="h-40 w-full bg-surface-container relative overflow-hidden">
                  <Image
                    src={farm.coverPhoto || 'https://images.unsplash.com/photo-1500937386664-56d1dfef4525?q=80&w=800'}
                    alt={farm.farmName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-label-md font-bold">{farm.rating > 0 ? farm.rating.toFixed(1) : 'New'}</span>
                  </div>
                </div>

                {/* Profile Content */}
                <div className="p-6 flex-grow flex flex-col relative -mt-10">
                  {/* Avatar & Name */}
                  <div className="flex gap-4 items-end mb-4">
                    <div className="w-20 h-20 rounded-full border-4 border-surface-container-lowest bg-surface-container relative overflow-hidden shadow-sm flex-shrink-0 z-10">
                      <Image
                        src={farm.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(farm.farmName)}&background=012d1d&color=fff`}
                        alt={farm.farmName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="pb-1 z-10 w-full min-w-0">
                      <h2 className="font-display font-bold text-xl text-on-surface truncate group-hover:text-primary transition-colors">
                        {farm.farmName}
                      </h2>
                      <div className="flex items-center gap-1 text-on-surface-variant font-body-sm mt-0.5 truncate">
                        <span className="material-symbols-outlined text-[14px] flex-shrink-0">location_on</span>
                        <span className="truncate">{farm.barangay}, {farm.municipality}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio snippet */}
                  <p className="font-body-sm text-on-surface-variant line-clamp-2 mb-6 flex-grow">
                    {farm.bio || `A local farm in ${farm.barangay} dedicated to providing fresh, quality produce to the community.`}
                  </p>

                  {/* Products Preview Area */}
                  <div className="pt-4 border-t border-surface-variant">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-label-sm uppercase tracking-wider text-outline">Fresh Harvests</span>
                      <span className="font-label-sm text-primary group-hover:underline">View {farm._count.products} Products</span>
                    </div>

                    {farm.products.length > 0 ? (
                      <div className="flex gap-3">
                        {farm.products.map(p => (
                          <div key={p.id} className="w-14 h-14 rounded-xl relative overflow-hidden border border-surface-variant/50 group/img bg-surface-container shadow-sm">
                            <Image src={p.photos[0] || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=100&q=80'} alt={p.name} fill className="object-cover group-hover/img:scale-110 transition-transform duration-500" sizes="56px" />
                          </div>
                        ))}
                        {farm._count.products > 3 && (
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-surface-variant text-on-surface-variant font-label-md border border-outline-variant/30">
                            +{farm._count.products - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="font-body-sm text-on-surface-variant italic py-2">
                        No active listings currently.
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
