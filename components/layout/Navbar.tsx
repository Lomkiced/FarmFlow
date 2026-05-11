'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const cartCount = items.length;

  return (
    <nav className="sticky top-0 z-50 bg-[#FAFAF7]/90 backdrop-blur-md border-b border-stone-200 shadow-sm px-8 py-4">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        {/* LEFT: Brand logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl text-emerald-900">eco</span>
          <span className="font-display font-black text-2xl text-emerald-900 tracking-tighter">
            FarmFlow
          </span>
        </Link>

        {/* CENTER: Search */}
        <div className="hidden md:block flex-1 max-w-md mx-8 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            placeholder="Search fresh produce..."
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-inter text-on-surface"
          />
        </div>

        {/* RIGHT: Links and actions */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className="text-emerald-900 font-label-md border-b-2 border-emerald-900 pb-1"
            >
              Marketplace
            </Link>
            <Link
              href="#"
              className="text-stone-600 font-label-md hover:text-emerald-700 transition-colors"
            >
              Farmers
            </Link>
            <Link
              href="#"
              className="text-stone-600 font-label-md hover:text-emerald-700 transition-colors"
            >
              Our Story
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/checkout" className="relative text-on-surface hover:text-primary transition-colors">
              <span className="material-symbols-outlined">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/auth/login"
              className="hidden md:flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl font-label-md hover:bg-primary-container transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
              Login
            </Link>

            <button className="md:hidden text-on-surface">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}