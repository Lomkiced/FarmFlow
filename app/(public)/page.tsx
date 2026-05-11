import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/marketplace/ProductCard';
import CategoryFilter from '@/components/marketplace/CategoryFilter';

const FEATURED_PRODUCTS = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80',
    alt: 'Fresh Tomatoes',
    badge: 'In Stock' as const,
    farmerAvatar: 'https://i.pravatar.cc/150?img=11',
    farmerName: "Mang Juan's Farm",
    productName: 'Heirloom Tomatoes',
    price: '₱120',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400&q=80',
    alt: 'Fresh Carrots',
    badge: 'In Stock' as const,
    farmerAvatar: 'https://i.pravatar.cc/150?img=45',
    farmerName: 'Aling Maria Fields',
    productName: 'Organic Carrots',
    price: '₱85',
  },
  {
    id: '7',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
    alt: 'Dinorado Rice',
    badge: 'Low Stock' as const,
    farmerAvatar: 'https://i.pravatar.cc/150?img=33',
    farmerName: 'San Nicolas Coop',
    productName: 'Dinorado Rice',
    price: '₱65',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400&q=80',
    alt: 'Fresh Eggplant',
    badge: 'In Stock' as const,
    farmerAvatar: 'https://i.pravatar.cc/150?img=22',
    farmerName: 'Barangay Sta. Cruz Farm',
    productName: 'Purple Eggplant',
    price: '₱55',
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
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
            <button className="bg-amber-500 text-white px-8 py-4 rounded-xl hover:bg-[#D97706] transition-colors shadow-lg active:scale-95 font-label-md flex items-center justify-center gap-2">
              Shop Harvest
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Main Content Wrapper */}
        <div className="max-w-[1280px] mx-auto px-[24px] py-[48px] flex flex-col gap-[48px]">
          
          {/* Section 3A: Category Filter Chips */}
          <section>
            <CategoryFilter />
          </section>

          {/* Section 3B: Featured Products Grid */}
          <section className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-display font-semibold text-h2 text-primary">Featured Harvest</h2>
                <p className="font-sans text-[16px] text-on-surface-variant mt-1">Freshly picked within the last 24 hours.</p>
              </div>
              <Link href="/products" className="hidden md:flex items-center gap-1 text-primary font-label-md hover:underline">
                View all
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURED_PRODUCTS.map(({ id, ...product }) => (
                <Link key={id} href={`/products/${id}`} className="block h-full">
                  <ProductCard {...product} />
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}