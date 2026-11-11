import Image from 'next/image';
import Link from 'next/link';
import CategoryFilter from '@/components/marketplace/CategoryFilter';
import { getFeaturedProductsAction } from '@/app/actions/search';
import { AUTH_FARM_HERO_IMAGE } from '@/lib/constants/farm-media';

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
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
          {/* Featured Harvest & Category Filter */}
          <CategoryFilter products={featuredProducts} />
        </div>

        {/* Our Story Section */}
        <section className="py-20 sm:py-24 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column (6 cols — Editorial Narrative) */}
            <div className="lg:col-span-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-green-800 block">
                OUR STORY
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mt-3 leading-tight">
                Built to connect La Union farms directly to every table.
              </h2>
              <p className="text-base text-gray-600 leading-relaxed mt-4">
                For too long, multi-layered middlemen depressed farm-gate prices while buyers paid high retail markups for produce days past harvest. FarmFlow replaces fragmented broker chains with direct digital commerce.
              </p>
              <p className="text-base text-gray-600 leading-relaxed mt-3">
                Verified RSBSA farmers set fair prices directly from their fields, while households, restaurants, and wholesale buyers receive traceable, same-day harvests backed by live delivery checkpoints.
              </p>

              {/* 3-Column Inline Metrics Strip */}
              <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-gray-200">
                <div>
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">100%</div>
                  <div className="text-xs text-gray-500 mt-1">Verified La Union Farms</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">0</div>
                  <div className="text-xs text-gray-500 mt-1">Middleman Markups</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">1/4 kg</div>
                  <div className="text-xs text-gray-500 mt-1">Flexible Retail to Wholesale</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-8">
                <Link
                  href="/about"
                  className="h-11 px-5 inline-flex items-center justify-center rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors"
                >
                  Read Our Full Story
                </Link>
                <Link
                  href="/farmers"
                  className="h-11 px-5 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Meet Our Farmers
                </Link>
              </div>
            </div>

            {/* Right Column (6 cols — Structured Bento Showcase Card) */}
            <div className="lg:col-span-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                {/* Top Visual Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <Image
                      src="/images/crops/cabbage.jpg"
                      alt="Fresh highland cabbage harvested in La Union"
                      fill
                      className="object-cover w-full h-full"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                    <span className="absolute bottom-2.5 left-2.5 bg-white/95 text-gray-900 text-[11px] font-medium px-2.5 py-1 rounded border border-gray-200">
                      Leafy Harvest
                    </span>
                  </div>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <Image
                      src="/images/crops/carrots.jpg"
                      alt="Fresh crisp carrots from Agoo farmers"
                      fill
                      className="object-cover w-full h-full"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                    <span className="absolute bottom-2.5 left-2.5 bg-white/95 text-gray-900 text-[11px] font-medium px-2.5 py-1 rounded border border-gray-200">
                      Root Crops
                    </span>
                  </div>
                </div>

                {/* Bottom Traceability Card */}
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Direct Farm-to-Buyer Protocol
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      RSBSA-verified farms • Escrow-protected orders • Live delivery checkpoints
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold uppercase tracking-wider bg-green-50 text-green-800 border border-green-200 shrink-0 w-fit">
                    LA UNION, PH
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
