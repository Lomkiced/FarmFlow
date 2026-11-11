import Image from 'next/image';
import Link from 'next/link';
import { OUR_STORY_FARM_IMAGE, ABOUT_SECONDARY_FARM_IMAGE } from '@/lib/constants/farm-media';

export default function AboutPage() {
  return (
    <main className="flex-grow w-full flex flex-col items-center bg-[#F9FAFB]">
      {/* Hero Section */}
      <section className="relative w-full h-[54vh] min-h-[420px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-green-950">
          <Image
            src={OUR_STORY_FARM_IMAGE}
            alt="Sunlit farmland and agricultural fields"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-green-950/75" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center">
          <span className="px-3 py-1 rounded bg-green-900/90 text-green-100 border border-green-700/60 text-xs font-semibold uppercase tracking-wider mb-4">
            Our Story
          </span>
          <h1 className="font-bold text-3xl sm:text-5xl text-white mb-4 leading-tight tracking-tight">
            Bridging Local Farms &amp; Your Table
          </h1>
          <p className="text-gray-200 text-sm sm:text-base max-w-2xl leading-relaxed">
            FarmFlow was built on a straightforward conviction: fresh produce should be directly traceable, and the farmers who cultivate it should keep the full value of their harvest.
          </p>
        </div>
      </section>

      {/* The Vision Section */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-white border border-gray-200 rounded-xl p-6 sm:p-10">
          <div className="relative aspect-[4/3] lg:h-[440px] rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
            <Image
              src={ABOUT_SECONDARY_FARM_IMAGE}
              alt="Freshly harvested green vegetable crops in hands"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-col gap-5">
            <h2 className="font-bold text-2xl sm:text-3xl text-gray-900 tracking-tight">
              Empowering the Agricultural Backbone
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              For generations, smallholder farmers in La Union faced opaque pricing and fragmented supply chains. FarmFlow replaces guesswork with structured crop tracking, government KYC validation, and transparent farm-gate pricing.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              By operating a verified direct marketplace with escrow protection, buyers receive same-day harvest quality while growers manage recurring wholesale contracts and digital logistics effortlessly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
              <div className="p-4 rounded-lg border border-gray-200 bg-[#F9FAFB]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-green-800 mb-1">
                  Direct Farm Value
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Transparent farm-gate pricing with escrow release directly to verified growers.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-gray-200 bg-[#F9FAFB]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-green-800 mb-1">
                  Reduced Food Miles
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Local Agoo cold-chain dispatch keeps transit short and reduces post-harvest loss.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full bg-[#0B291B] py-16 border-y border-green-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <h2 className="font-bold text-2xl sm:text-3xl text-white mb-2 tracking-tight">
              How FarmFlow Works
            </h2>
            <p className="text-sm text-green-100/80 max-w-xl">
              A disciplined supply-chain connection from municipal soil to your kitchen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                step: '01',
                title: 'Verified Growers List Harvests',
                desc: 'RSBSA-verified farms record crop cycles and publish real-time fractional or wholesale harvest lots.',
              },
              {
                step: '02',
                title: 'Direct Retail & B2B Purchasing',
                desc: 'Buyers order exact fractional weights starting at 1/4 kg or schedule recurring weekly wholesale deliveries.',
              },
              {
                step: '03',
                title: 'Tracked Cold-Chain Fulfillment',
                desc: 'Live parcel checkpoints, assigned courier details, and photo proof-of-delivery protect every order.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-6 bg-green-950/60 rounded-xl border border-green-800/70 flex flex-col gap-2"
              >
                <span className="text-xs font-bold text-green-300 tabular-nums uppercase tracking-wider">
                  Step {item.step}
                </span>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center flex flex-col items-center">
        <h2 className="font-bold text-2xl sm:text-4xl text-gray-900 mb-3 tracking-tight">
          Join the Local Food Network
        </h2>
        <p className="text-sm text-gray-600 mb-8 max-w-xl leading-relaxed">
          Whether you operate a farm in La Union or purchase fresh produce for your household or business, FarmFlow connects you directly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
          <Link
            href="/products"
            className="h-11 px-6 inline-flex items-center justify-center bg-green-800 hover:bg-green-900 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Browse Marketplace
          </Link>
          <Link
            href="/auth/register/farmer"
            className="h-11 px-6 inline-flex items-center justify-center bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            Register as a Farmer
          </Link>
        </div>
      </section>
    </main>
  );
}
