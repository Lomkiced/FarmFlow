import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Our Story — FarmFlow',
  description:
    'Restoring fairness and transparency to Philippine agriculture through direct farm-to-market commerce and agricultural ERP.',
};

const HERO_STATS = [
  {
    label: 'Direct Margin',
    value: '100%',
    caption: 'Farmer-set pricing with zero middleman cuts',
  },
  {
    label: 'Minimum Order',
    value: '0.25 kg',
    caption: 'Accessible fractional retail & bulk wholesale',
  },
  {
    label: 'Verification',
    value: 'RSBSA + KYC',
    caption: 'Strict identity-matched farmer onboarding',
  },
  {
    label: 'Coverage',
    value: 'La Union',
    caption: 'Barangay-level harvest & logistics tracking',
  },
];

const OLD_REALITY_POINTS = [
  {
    idx: '01',
    title: 'Depressed farm-gate margins',
    detail: 'Multiple tiers of regional traders capture the majority of retail produce value before harvest reaches consumers.',
  },
  {
    idx: '02',
    title: '3–4 days of transit spoilage',
    detail: 'Produce sits across intermediate bagsakan hubs without cold-chain coordination or dispatch schedules.',
  },
  {
    idx: '03',
    title: 'Zero origin traceability',
    detail: 'Buyers rarely know which farm cultivated their produce, when it was harvested, or how it was handled.',
  },
  {
    idx: '04',
    title: 'Rigid wholesale requirements',
    detail: 'Small kitchens and households are locked out of farm-direct pricing by steep minimum order volumes.',
  },
];

const FARMFLOW_STANDARD_POINTS = [
  {
    idx: '01',
    title: 'Farmer-controlled pricing & escrow',
    detail: 'Growers retain transparent pricing authority while FarmFlow Escrow protects settlement until delivery confirmation.',
  },
  {
    idx: '02',
    title: 'Harvest-to-listing ERP pipeline',
    detail: 'Crop tracking directly feeds marketplace inventory so freshly harvested batches go live the same day.',
  },
  {
    idx: '03',
    title: 'Real-time checkpoint logistics',
    detail: 'Every parcel includes assigned courier telemetry, live status milestones, and photo proof-of-delivery.',
  },
  {
    idx: '04',
    title: 'Fractional 1/4 kg to wholesale contracts',
    detail: 'Purchase quarter-kilo household portions or schedule recurring weekly wholesale supply contracts seamlessly.',
  },
];

const ECOSYSTEM_PILLARS = [
  {
    idx: '01',
    title: 'Strict KYC & RSBSA Verification',
    desc: 'Every farmer is verified against RSBSA registries and government ID cross-matching before listing produce on the marketplace.',
  },
  {
    idx: '02',
    title: 'Seed-to-Harvest Farm ERP',
    desc: 'Growers log crop stages, plot sizes, and harvest schedules to forecast yield and convert ready batches into active listings in one step.',
  },
  {
    idx: '03',
    title: 'Fractional & Wholesale Marketplace',
    desc: 'Flexible unit weights starting at 1/4 kg serve households while tiered wholesale pricing and scheduled contracts serve B2B kitchens.',
  },
  {
    idx: '04',
    title: 'Live Checkpoint Logistics',
    desc: 'Structured parcel telemetry, driver contact visibility, photo proof-of-delivery, and freshness dispute protection from farm to table.',
  },
];

const HARVEST_SHOWCASE = [
  {
    src: '/images/crops/cabbage.jpg',
    category: 'Highland Greens',
    name: 'Fresh Crisp Cabbage',
    origin: 'Agoo, La Union',
    standard: 'Same-day harvest dispatch',
  },
  {
    src: '/images/crops/carrots.jpg',
    category: 'Root Vegetables',
    name: 'Farm-Gate Carrots',
    origin: 'La Union Highlands',
    standard: 'Washed & sorted QC',
  },
  {
    src: '/images/crops/ampalaya.jpg',
    category: 'Lowland Produce',
    name: 'Native Ampalaya',
    origin: 'San Vicente, Agoo',
    standard: 'RSBSA-verified plots',
  },
  {
    src: '/images/crops/banana.jpg',
    category: 'Tropical Fruits',
    name: 'Saba & Lakatan Bananas',
    origin: 'La Union Foothills',
    standard: 'Retail & wholesale lots',
  },
];

export default function AboutPage() {
  return (
    <main className="flex-grow w-full bg-white">
      {/* Section 1 — Editorial Hero & Key Metrics Bar */}
      <section className="bg-white border-b border-gray-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-green-50 text-green-800 border border-green-200">
            OUR STORY • LA UNION AGRICULTURAL NETWORK
          </span>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mt-4 max-w-3xl leading-[1.15]">
            Restoring fairness and transparency to Philippine agriculture.
          </h1>

          <p className="text-lg text-gray-600 mt-5 max-w-2xl leading-relaxed">
            FarmFlow is a direct farm-to-market e-commerce and agricultural ERP platform engineered for the farming communities of La Union.
          </p>

          {/* 4-Column Architectural Stat Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 border border-gray-200 rounded-xl bg-gray-50/60 mt-12 overflow-hidden">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {stat.label}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums mt-2">
                    {stat.value}
                  </p>
                </div>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">{stat.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2 — The Problem vs. The FarmFlow Standard */}
      <section className="py-16 sm:py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-green-800 block">
              WHY WE BUILT FARMFLOW
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mt-2">
              Replacing opaque broker layers with direct infrastructure
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Card A — Traditional Supply Chain */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-500">
                  THE OLD REALITY
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-2">
                  Opaque middleman chains
                </h3>
                <ul className="divide-y divide-gray-100 mt-6 text-sm text-gray-600">
                  {OLD_REALITY_POINTS.map((item) => (
                    <li key={item.idx} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5">
                      <span className="font-mono text-xs font-semibold text-gray-400 tabular-nums pt-0.5 shrink-0">
                        {item.idx}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Card B — The FarmFlow Direct Model */}
            <div className="bg-white border-2 border-green-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-green-800">
                  THE FARMFLOW STANDARD
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-2">
                  Direct, traceable, and equitable commerce
                </h3>
                <ul className="divide-y divide-gray-100 mt-6 text-sm text-gray-900 font-medium">
                  {FARMFLOW_STANDARD_POINTS.map((item) => (
                    <li key={item.idx} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3.5">
                      <span className="font-mono text-xs font-semibold text-green-800 tabular-nums pt-0.5 shrink-0">
                        {item.idx}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        <p className="text-xs font-normal text-gray-600 mt-0.5 leading-relaxed">
                          {item.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — How the Ecosystem Works */}
      <section className="py-16 sm:py-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-green-800 block">
              SYSTEM ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mt-2">
              How the ecosystem works
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed">
              Four integrated pillars connecting verified growers in La Union with households and institutional buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {ECOSYSTEM_PILLARS.map((pillar) => (
              <div
                key={pillar.idx}
                className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between hover:border-green-800 transition-colors"
              >
                <div>
                  <span className="font-mono text-xs font-semibold text-green-800 px-2.5 py-1 rounded bg-green-50 border border-green-200 w-fit inline-block tabular-nums">
                    {pillar.idx}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-5">{pillar.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-gray-100 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  FarmFlow Standard
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Local Harvest Showcase */}
      <section className="py-16 sm:py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-green-800 block">
                REGIONAL HARVEST
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mt-2">
                Cultivated across Agoo &amp; La Union
              </h2>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-green-800 hover:text-green-900 hover:underline shrink-0"
            >
              Browse All Produce →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HARVEST_SHOWCASE.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3] w-full bg-gray-100">
                  <Image
                    src={item.src}
                    alt={item.name}
                    fill
                    className="object-cover w-full h-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="border-t border-gray-200 bg-white px-5 py-3.5 flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-green-800">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1.5 mt-1 border-t border-gray-100">
                    <span>{item.origin}</span>
                    <span>{item.standard}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — Clean Call-to-Action Banner */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Ready to source directly from La Union farmers?
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-xl leading-relaxed">
                Shop traceable quarter-kilo harvests, schedule B2B wholesale deliveries, or register your farm with RSBSA verification today.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/products"
                className="h-11 px-6 rounded-lg text-sm font-medium inline-flex items-center justify-center whitespace-nowrap bg-green-800 text-white hover:bg-green-900 transition-colors"
              >
                Explore Marketplace
              </Link>
              <Link
                href="/auth/register/farmer"
                className="h-11 px-6 rounded-lg text-sm font-medium inline-flex items-center justify-center whitespace-nowrap border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Partner as a Farmer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
