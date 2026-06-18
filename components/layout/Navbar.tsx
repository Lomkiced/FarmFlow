'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import type { SessionUser } from '@/lib/dal';
import { logoutAction } from '@/app/actions/auth';

export default function Navbar({ user }: { user?: SessionUser | null }) {
  const items = useCartStore((state) => state.items);
  const cartCount = items.length;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path || (path !== '/' && pathname?.startsWith(path));
    return isActive 
      ? 'text-emerald-900 font-label-md border-b-2 border-emerald-900 pb-1'
      : 'text-stone-600 font-label-md hover:text-emerald-700 hover:border-emerald-700 border-b-2 border-transparent pb-1 transition-colors';
  };

  return (
    <>
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
        <div className="flex items-center gap-2 md:gap-4 relative z-50">
          
          {/* Mobile Search Toggle */}
          <button 
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-on-surface hover:bg-surface-variant transition-colors active:scale-95"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            aria-label="Toggle Search"
          >
            <span className="material-symbols-outlined text-[24px]">search</span>
          </button>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className={getLinkClass('/products')}
            >
              Marketplace
            </Link>
            <Link
              href="/farmers"
              className={getLinkClass('/farmers')}
            >
              Farmers
            </Link>
            <Link
              href="/about"
              className={getLinkClass('/about')}
            >
              Our Story
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link 
              href="/cart" 
              className="relative flex items-center justify-center w-10 h-10 rounded-full text-on-surface hover:bg-surface-variant transition-colors active:scale-95"
              aria-label="Cart"
            >
              <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#FAFAF7]">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-surface-container hover:bg-surface-variant px-3 py-1.5 rounded-full transition-colors border border-outline-variant shadow-sm active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden relative border border-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col items-start max-w-[120px]">
                    <span className="font-label-md text-on-surface truncate w-full leading-tight">{user.name}</span>
                    <span className="text-[10px] uppercase font-bold text-primary tracking-widest">{user.role.toLowerCase()}</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px] transition-transform duration-200" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }}>
                    expand_more
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#fcf9f2] rounded-xl shadow-lg border border-surface-variant py-2 animate-in fade-in slide-in-from-top-2 z-[100]">
                    <div className="px-4 py-2 border-b border-surface-variant/50 mb-2">
                      <div className="font-label-md text-on-surface truncate">{user.name}</div>
                      <div className="text-[12px] text-on-surface-variant truncate">{user.email}</div>
                    </div>
                    
                    {user.role === 'ADMIN' ? (
                      <Link href="/admin" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-on-surface hover:bg-surface-variant transition-colors text-[14px]">
                        <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                        Admin Dashboard
                      </Link>
                    ) : user.role === 'FARMER' ? (
                      <Link href="/farmer/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-on-surface hover:bg-surface-variant transition-colors text-[14px]">
                        <span className="material-symbols-outlined text-[18px]">agriculture</span>
                        Farmer Dashboard
                      </Link>
                    ) : (
                      <Link href="/buyer/orders" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-on-surface hover:bg-surface-variant transition-colors text-[14px]">
                        <span className="material-symbols-outlined text-[18px]">local_mall</span>
                        My Orders
                      </Link>
                    )}
                    
                    <button 
                      onClick={async () => {
                        setIsDropdownOpen(false);
                        await logoutAction();
                      }} 
                      className="w-full flex items-center gap-3 px-4 py-2 text-error hover:bg-error/10 transition-colors text-[14px] mt-2 border-t border-surface-variant/50 pt-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">account_circle</span>
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-variant transition-colors shadow-sm active:scale-95 ml-1"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Menu"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
          </div>
        </div>
      </div>
      </nav>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="md:hidden fixed top-[73px] left-0 w-full bg-[#fcf9f2] border-b border-stone-200 p-4 shadow-md z-40 animate-in slide-in-from-top-2">
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

      {/* Mobile Menu Full-Screen Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-[200] flex flex-col animate-in slide-in-from-bottom-8 duration-300"
          style={{ backgroundColor: '#fcf9f2' }}
        >
          {/* Header */}
          <div className="px-4 py-4 flex items-center justify-between border-b border-stone-200/60" style={{ backgroundColor: '#fcf9f2' }}>
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl text-emerald-900">eco</span>
              <span className="font-display font-black text-2xl text-emerald-900 tracking-tighter">
                FarmFlow
              </span>
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="flex items-center justify-center w-10 h-10 rounded-full transition-colors active:scale-95"
              style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* Links Area */}
          <div className="flex-1 overflow-y-auto px-6 py-10 flex flex-col gap-8">
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between group">
              <span className="text-4xl font-display font-black text-emerald-900 tracking-tighter group-active:opacity-70 transition-opacity">Marketplace</span>
              <span className="material-symbols-outlined text-3xl text-emerald-900/50">arrow_forward</span>
            </Link>
            <Link href="/farmers" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between group">
              <span className="text-4xl font-display font-black text-emerald-900 tracking-tighter group-active:opacity-70 transition-opacity">Farmers</span>
              <span className="material-symbols-outlined text-3xl text-emerald-900/50">arrow_forward</span>
            </Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between group">
              <span className="text-4xl font-display font-black text-emerald-900 tracking-tighter group-active:opacity-70 transition-opacity">Our Story</span>
              <span className="material-symbols-outlined text-3xl text-emerald-900/50">arrow_forward</span>
            </Link>
          </div>

          {/* Bottom Actions Area */}
          <div className="p-6 border-t border-stone-200/60" style={{ backgroundColor: '#ffffff' }}>
            {user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-900/10 overflow-hidden relative border border-emerald-900/20 flex items-center justify-center shrink-0 text-emerald-900 font-bold text-[20px]">
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-emerald-900">{user.name}</span>
                    <span className="text-[12px] uppercase font-bold text-emerald-700 tracking-widest">{user.role.toLowerCase()}</span>
                  </div>
                </div>
                
                {user.role === 'ADMIN' ? (
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-colors text-[16px]" style={{ backgroundColor: '#f0eee6', color: '#012d1d' }}>
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    Admin Dashboard
                  </Link>
                ) : user.role === 'FARMER' ? (
                  <Link href="/farmer/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-colors text-[16px]" style={{ backgroundColor: '#f0eee6', color: '#012d1d' }}>
                    <span className="material-symbols-outlined">agriculture</span>
                    Farmer Dashboard
                  </Link>
                ) : (
                  <Link href="/buyer/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-colors text-[16px]" style={{ backgroundColor: '#f0eee6', color: '#012d1d' }}>
                    <span className="material-symbols-outlined">local_mall</span>
                    My Orders
                  </Link>
                )}
                
                <button 
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await logoutAction();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-colors text-[16px]"
                  style={{ backgroundColor: '#fff0f0', color: '#ba1a1a' }}
                >
                  <span className="material-symbols-outlined">logout</span>
                  Log out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold shadow-sm text-[16px] active:scale-95 transition-transform"
                style={{ backgroundColor: '#012d1d', color: '#ffffff' }}
              >
                <span className="material-symbols-outlined text-[20px]">account_circle</span>
                Login to FarmFlow
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}