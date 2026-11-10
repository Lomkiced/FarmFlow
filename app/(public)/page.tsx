import Image from 'next/image';
import Link from 'next/link';
import CategoryFilter from '@/components/marketplace/CategoryFilter';
import { getFeaturedProductsAction } from '@/app/actions/search';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const featuredProducts = await getFeaturedProductsAction();

  return (
    <>
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="w-full h-[580px] relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/FARMER1.jpg"
              alt="Farmers harvesting in Agoo, La Union"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-black/45" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center max-w-3xl mx-auto px-4 gap-6">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-block px-3 py-1 rounded bg-green-900/80 text-green-200 border border-green-700/60 text-xs font-semibold uppercase tracking-wider">
                Harvested Fresh • La Union Verified
              </span>
              <span className="inline-block px-3 py-1 rounded bg-white/10 text-white border border-white/20 text-xs font-semibold uppercase tracking-wider">
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
                className="bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
              >
                Shop Harvest
              </Link>
              <Link
                href="/farmers"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
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
              <p className="font-bold text-white uppercase tracking-wider">100% RSBSA & KYC Verified</p>
              <p className="text-gray-300 mt-0.5 leading-relaxed">
                Every farmer and wholesale buyer undergoes government ID matching and verification.
              </p>
            </div>
            <div>
              <p className="font-bold text-white uppercase tracking-wider">Cold-Chain Logistics Telemetry</p>
              <p className="text-gray-300 mt-0.5 leading-relaxed">
                Shopee-style live delivery tracking, dispatched driver contacts, and photo POD.
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
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 flex flex-col gap-10">
          {/* Featured Harvest & Category Filter */}
          <CategoryFilter products={featuredProducts} />
        </div>
      </main>
    </>
  );
}
