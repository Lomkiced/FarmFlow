'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const cartCount = items.length;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-[100] bg-[#FAFAF7]/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="px-4 md:px-8 py-4 max-w-screen-2xl mx-auto flex items-center justify-between">
        
        {/* LEFT: Brand logo */}
        <Link href="/" className="flex items-center gap-2 relative z-50">
          <span className="material-symbols-outlined text-3xl text-emerald-900">eco</span>
          <span className="font-display font-black text-2xl text-emerald-900 tracking-tighter">
            FarmFlow
          </span>
        </Link>

        {/* CENTER: Desktop Search */}
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
        <div className="flex items-center gap-4 relative z-50">
          
          {/* Mobile Search Toggle */}
          <button 
            className="md:hidden text-on-surface p-1"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          >
            <span className="material-symbols-outlined">search</span>
          </button>

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

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-on-surface p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="material-symbols-outlined">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-stone-200 p-4 shadow-md z-40 animate-in slide-in-from-top-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              autoFocus
              placeholder="Search fresh produce..."
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-full py-3 pl-10 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-inter text-on-surface text-[16px]"
            />
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[73px] bg-white z-40 flex flex-col p-6 animate-in slide-in-from-right-4">
          <div className="flex flex-col gap-6 text-[18px] font-medium text-on-surface">
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between border-b border-stone-100 pb-4">
              Marketplace
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </Link>
            <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between border-b border-stone-100 pb-4">
              Farmers
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </Link>
            <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between border-b border-stone-100 pb-4">
              Our Story
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </Link>
          </div>

          <div className="mt-auto pb-8">
            <Link
              href="/auth/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary py-4 rounded-xl font-bold transition-colors shadow-sm text-[16px]"
            >
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
              Login to FarmFlow
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}