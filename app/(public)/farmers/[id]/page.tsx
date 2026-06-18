import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicFarmerByIdAction } from '@/app/actions/farm';
import ProductListingCard from '@/components/marketplace/ProductListingCard';

export default async function FarmerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const farm = await getPublicFarmerByIdAction(id);

  if (!farm) {
    notFound();
  }

  const joinDate = new Date(farm.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <main className="flex-grow w-full bg-background pb-24">
      {/* ─── Cover & Profile Header ────────────────────────────────────────────── */}
      <section className="relative bg-surface-container-lowest border-b border-surface-variant shadow-sm">
        {/* Cover Photo */}
        <div className="w-full h-64 md:h-80 bg-surface-container relative">
          <Image 
            src={farm.coverPhoto || 'https://images.unsplash.com/photo-1500937386664-56d1dfef4525?q=80&w=1600'} 
            alt={`${farm.farmName} Cover`} 
            fill 
            className="object-cover" 
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 pb-10">
            {/* Avatar (Overlapping cover) */}
            <div className="-mt-16 md:-mt-24 z-10 flex-shrink-0">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 md:border-8 border-surface-container-lowest bg-surface-container relative overflow-hidden shadow-level-1">
                <Image 
                  src={farm.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(farm.farmName)}&background=012d1d&color=fff&size=512`} 
                  alt={farm.farmName} 
                  fill 
                  className="object-cover" 
                />
              </div>
            </div>

            {/* Farm Details */}
            <div className="flex-grow pt-4 md:pt-6 flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                <h1 className="font-display font-bold text-3xl md:text-4xl text-on-surface mb-2 tracking-tight">
                  {farm.farmName}
                </h1>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-on-surface-variant font-body-md mb-4">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {farm.barangay}, {farm.municipality}, {farm.province}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    Joined {joinDate}
                  </div>
                  {farm.landArea && (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">landscape</span>
                      {farm.landArea} hectares
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg flex items-center gap-1 font-label-md">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-bold">{farm.rating > 0 ? farm.rating.toFixed(1) : 'New Farm'}</span>
                  </div>
                  <div className="bg-surface-container px-3 py-1 rounded-lg text-on-surface-variant font-label-md border border-outline-variant/30">
                    {farm._count.products} Active Products
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 w-full md:w-auto flex flex-row md:flex-col gap-3">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md hover:bg-primary/90 transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  Message Farm
                </button>
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-surface-container-lowest text-primary border border-primary px-6 py-3 rounded-xl font-label-md hover:bg-primary/5 transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">share</span>
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {farm.bio && (
            <div className="py-8 border-t border-surface-variant max-w-3xl">
              <h2 className="font-display font-semibold text-xl text-on-surface mb-3">About the Farm</h2>
              <p className="font-body-lg text-on-surface-variant leading-relaxed">
                {farm.bio}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Products Section ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-on-background tracking-tight">
            Shop from {farm.farmName}
          </h2>
          {/* Simple category filter tabs placeholder */}
          <div className="hidden md:flex gap-2">
            <button className="px-4 py-2 rounded-full bg-primary text-on-primary font-label-md">All Products</button>
            <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface hover:bg-surface-variant transition-colors font-label-md">Vegetables</button>
            <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface hover:bg-surface-variant transition-colors font-label-md">Fruits</button>
          </div>
        </div>

        {farm.products.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-lowest rounded-3xl border border-surface-variant shadow-sm">
            <span className="material-symbols-outlined text-6xl text-primary/30 mb-4">inventory_2</span>
            <h3 className="font-h3 text-on-surface mb-2">No active products</h3>
            <p className="font-body-md text-on-surface-variant">This farm doesn't have any products listed for sale right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {farm.products.map(product => (
              <Link href={`/products/${product.id}`} key={product.id} className="block group">
                <ProductListingCard
                  id={product.id}
                  image={product.photos[0] || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80'}
                  alt={product.name}
                  badge={product.category === 'VEGETABLES' ? 'Organic' : (product.stockKg > 10 ? 'In Stock' : 'Low Stock')}
                  badgeVariant={product.category === 'VEGETABLES' ? 'organic' : (product.stockKg > 10 ? 'instock' : 'lowstock')}
                  productName={product.name}
                  price={`₱${product.pricePerKg.toFixed(2)}`}
                  unit="/ kg"
                  farmerName={farm.farmName}
                  rating={5.0} // Placeholder until product ratings exist
                  reviewCount={12} // Placeholder
                  distanceKm={5.2} // Placeholder
                  stockKg={product.stockKg}
                />
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
