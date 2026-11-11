import Image from 'next/image';
import Link from 'next/link';
import CategoryFilter from '@/components/marketplace/CategoryFilter';
import { getFeaturedProductsAction } from '@/app/actions/search';
import { AUTH_FARM_HERO_IMAGE, OUR_STORY_FARM_IMAGE } from '@/lib/constants/farm-media';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const featuredProducts = await getFeaturedProductsAction();

  return (
    <>
      <main className="flex-grow bg-white">
        {/* Hero Section */}
        <section className="w-full h-[560px] relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={AUTH_FARM_HERO_IMAGE}
              alt="Lush green agricultural farmland in Agoo, La Union"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-green-950/65" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center max-w-3xl mx-auto px-4 gap-6">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-block px-3 py-1 rounded bg-green-900/85 text-green-100 border border-green-700/60 text-xs font-semibold uppercase tracking-wider">
                Harvested Fresh • La Union Verified
              </span>
              <span className="inline-block px-3 py-1 rounded bg-white/10 text-white border border-white/25 text-xs font-semibold uppercase tracking-wider">
                FarmFlow Escrow Protected
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Fresh from Agoo Farms
            </h1>

            <p className="text-sm sm:text-base text-gray-200 max-w-xl leading-relaxed">
              Connect directly with RSBSA-verified farmers in La Union. Freshly harvested produce delivered with live cold-chain tracking and guaranteed escrow payout.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/products"
                className="h-11 px-6 inline-flex items-center justify-center bg-green-800 hover:bg-green-900 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Shop Harvest
              </Link>
              <Link
                href="/farmers"
                className="h-11 px-6 inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg font-semibold text-sm transition-colors"
              >
                Meet Verified Farmers
              </Link>
            </div>
          </div>
        </section>

        {/* Trust & Traceability Strip */}
        <section className="bg-[#0B291B] text-white border-b border-green-900">
          <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <p className="font-bold text-white uppercase tracking-wider">100% RSBSA &amp; KYC Verified</p>
              <p className="text-gray-300 mt-0.5 leading-relaxed">
                Every farmer and wholesale buyer undergoes government ID matching and verification.
              </p>
            </div>
            <div>
              <p className="font-bold text-white uppercase tracking-wider">Cold-Chain Logistics Telemetry</p>
              <p className="text-gray-300 mt-0.5 leading-relaxed">
                Live parcel checkpoints, dispatched driver contacts, and photo proof-of-delivery.
              </p>
            </div>
            <div>
              <p className="font-bold text-white uppercase tracking-wider">FarmFlow Escrow Guarantee</p>
              <p className="text-gray-300 mt-0.5 leading-relaxed">
                Payout is held safely until you inspect your produce and confirm freshness.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Wrapper */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 flex flex-col gap-16">
          {/* Featured Harvest & Category Filter */}
          <CategoryFilter products={featuredProducts} />

          {/* Our Story & Direct Farm Traceability */}
          <section className="border border-gray-200 rounded-xl bg-[#F9FAFB] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-6 p-8 md:p-10 flex flex-col justify-between gap-6">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded border border-green-200 bg-green-50 text-green-800 text-[11px] font-semibold uppercase tracking-wider mb-3">
                  Our Story
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3">
                  Direct from Local Fields in Agoo, La Union
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  FarmFlow links municipal vegetable and fruit growers directly to households, restaurants, and institutional buyers—eliminating unnecessary middlemen and preserving peak harvest freshness.
                </p>
                <div className="grid grid-cols-4 gap-2.5 pt-2">
                  {[
                    { src: '/images/crops/cabbage.jpg', label: 'Cabbage' },
                    { src: '/images/crops/carrots.jpg', label: 'Carrots' },
                    { src: '/images/crops/ampalaya.jpg', label: 'Ampalaya' },
                    { src: '/images/crops/banana.jpg', label: 'Banana' },
                  ].map((crop) => (
                    <div key={crop.label} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white">
                      <Image src={crop.src} alt={crop.label} fill className="object-cover" sizes="120px" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/about"
                  className="h-10 px-4 inline-flex items-center justify-center rounded-lg bg-green-800 hover:bg-green-900 text-white text-xs font-semibold transition-colors"
                >
                  Read Our Story
                </Link>
                <Link
                  href="/farmers"
                  className="h-10 px-4 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors"
                >
                  Explore Verified Farms
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative min-h-[280px] lg:min-h-[380px] border-t lg:border-t-0 lg:border-l border-gray-200">
              <Image
                src={OUR_STORY_FARM_IMAGE}
                alt="Sunlit terraced farmland and lush green crops"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
