import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex-grow w-full flex flex-col items-center justify-center bg-background min-h-[80vh] px-6 text-center">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center gap-6">

        {/* Big 404 */}
        <div className="relative">
          <span
            className="text-[160px] md:text-[200px] font-extrabold leading-none tracking-tighter select-none"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </span>
          {/* Floating leaf icon */}
          <span
            className="absolute top-6 right-0 material-symbols-outlined text-secondary/40 text-[48px] animate-bounce"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            psychiatry
          </span>
        </div>

        {/* Copy */}
        <div className="space-y-3">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-on-background">
            This field is empty.
          </h1>
          <p className="font-body-lg text-on-surface-variant leading-relaxed max-w-sm mx-auto">
            The page you&apos;re looking for has been harvested or doesn&apos;t exist. Let&apos;s get you back to fresh ground.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:justify-center mt-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md px-7 py-3.5 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Go Home
          </Link>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md px-7 py-3.5 rounded-xl hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            Browse Marketplace
          </Link>
        </div>

        {/* Help link */}
        <p className="text-sm text-on-surface-variant">
          Lost?{' '}
          <Link href="/support" className="text-primary hover:underline font-medium">
            Contact Support
          </Link>
        </p>
      </div>
    </main>
  );
}