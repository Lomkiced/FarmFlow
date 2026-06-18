import Image from 'next/image';
import Link from 'next/link';
import CategoryFilter from '@/components/marketplace/CategoryFilter';
import { getFeaturedProductsAction } from '@/app/actions/search';

export default async function HomePage() {
  const featuredProducts = await getFeaturedProductsAction();

  return (
    <>
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="w-full h-[600px] relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1600&q=80"
              alt="Lush farmland in La Union at sunrise"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center max-w-3xl mx-auto gap-stack-lg px-4">
            <h1 className="font-display font-bold text-display tracking-[-0.02em] text-surface-container-lowest leading-[1.1]">
              Fresh from Agoo Farms
            </h1>
            <p className="font-body-lg text-surface-container-lowest/90 max-w-xl">
              Connect directly with local farmers in La Union. Premium, freshly harvested produce delivered to your door while supporting sustainable local agriculture.
            </p>
            <Link href="/products" className="bg-amber-500 text-white px-8 py-4 rounded-xl hover:bg-[#D97706] transition-colors shadow-lg active:scale-95 font-label-md flex items-center justify-center gap-2">
              Shop Harvest
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* Main Content Wrapper */}
        <div className="max-w-[1280px] mx-auto px-[24px] py-[48px] flex flex-col gap-[48px]">
          
          {/* Section 3: Featured Harvest & Category Filter */}
          <CategoryFilter products={featuredProducts} />

        </div>
      </main>
    </>
  );
}