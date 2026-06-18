import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="flex-grow w-full flex flex-col items-center bg-background">
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-primary/20">
          <Image
            src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=2000"
            alt="Farm landscape"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <span className="px-4 py-1.5 rounded-full bg-secondary-container/90 text-on-secondary-container font-label-md uppercase tracking-widest mb-6 backdrop-blur-sm border border-secondary-container/50">
            Our Story
          </span>
          <h1 className="font-display font-bold text-4xl md:text-6xl text-white mb-6 leading-tight drop-shadow-md">
            Bridging the Gap Between <br className="hidden md:block" />
            <span className="text-secondary-container">Local Farms & Your Table</span>
          </h1>
          <p className="font-body-lg text-white/90 text-lg md:text-xl max-w-2xl drop-shadow-sm leading-relaxed">
            FarmFlow was born from a simple idea: fresh food should be accessible, and the people who grow it should be fairly compensated. We are building the future of local agriculture.
          </p>
        </div>
      </section>

      {/* ─── The Vision Section ────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden shadow-level-2 group">
            <Image
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef4525?q=80&w=1200"
              alt="Farmer holding fresh produce"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 border-[8px] border-background/20 rounded-3xl z-10 pointer-events-none"></div>
          </div>

          <div className="flex flex-col gap-8">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-on-background">
              Empowering the Agricultural Backbone
            </h2>
            <p className="font-body-lg text-on-surface-variant leading-relaxed">
              For generations, small-scale farmers have been the silent heroes of our communities. Yet, complex supply chains and middlemen have often disconnected them from the very people they feed. 
            </p>
            <p className="font-body-lg text-on-surface-variant leading-relaxed">
              At FarmFlow, we believe in a transparent ecosystem. By creating a direct marketplace, we ensure that buyers receive peak-freshness produce, while farmers retain the true value of their hard work.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-variant flex flex-col gap-3 hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary mb-2">
                  <span className="material-symbols-outlined text-[28px]">payments</span>
                </div>
                <h3 className="font-h3 text-on-surface">Fair Trade</h3>
                <p className="font-body-sm text-on-surface-variant">100% of the price you see goes directly to the farmer. No hidden marketplace fees.</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-variant flex flex-col gap-3 hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary mb-2">
                  <span className="material-symbols-outlined text-[28px]">eco</span>
                </div>
                <h3 className="font-h3 text-on-surface">Sustainability</h3>
                <p className="font-body-sm text-on-surface-variant">Reducing food miles means a lower carbon footprint and longer-lasting produce.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────────────── */}
      <section className="w-full bg-primary py-24 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">How FarmFlow Works</h2>
            <p className="font-body-lg text-primary-container/80 text-white/80 max-w-2xl mx-auto">
              A seamless connection from the soil to your kitchen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'storefront', title: 'Farmers List Produce', desc: 'Local farmers update their digital storefronts with fresh harvests and upcoming crops.' },
              { icon: 'shopping_basket', title: 'You Shop Fresh', desc: 'Browse available produce in your area, support local farms, and place your order securely.' },
              { icon: 'local_shipping', title: 'Direct Delivery', desc: 'Your food is delivered directly from the farm, ensuring maximum freshness and quality.' },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="w-20 h-20 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-4xl text-secondary-container">{step.icon}</span>
                </div>
                <h3 className="font-h2 text-white mb-3">{step.title}</h3>
                <p className="font-body-md text-white/80">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ───────────────────────────────────────────────────────── */}
      <section className="w-full max-w-4xl mx-auto px-6 py-24 text-center flex flex-col items-center">
        <span className="material-symbols-outlined text-[64px] text-primary/20 mb-6">agriculture</span>
        <h2 className="font-display font-bold text-3xl md:text-5xl text-on-background mb-6 tracking-tight">
          Join the Local Food Movement
        </h2>
        <p className="font-body-lg text-on-surface-variant mb-10 max-w-2xl leading-relaxed">
          Whether you're a farmer looking to reach your community, or a buyer seeking the freshest produce, FarmFlow is your platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <Link href="/products" className="bg-primary text-white px-8 py-4 rounded-xl font-label-md hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            Start Shopping
          </Link>
          <Link href="/auth/register?role=FARMER" className="bg-surface-container-lowest text-primary border border-primary px-8 py-4 rounded-xl font-label-md hover:bg-primary/5 transition-colors shadow-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">psychiatry</span>
            Join as a Farmer
          </Link>
        </div>
      </section>
    </main>
  );
}
