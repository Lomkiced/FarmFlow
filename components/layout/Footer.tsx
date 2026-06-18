'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { SessionUser } from '@/lib/dal';

export default function Footer({ user }: { user?: SessionUser | null }) {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const baseClass = "hover:text-emerald-600 hover:underline underline-offset-4 transition-all";
    return pathname === path ? `${baseClass} text-emerald-600 font-bold underline` : baseClass;
  };

  return (
    <footer className="bg-stone-50 border-t border-stone-200 font-display text-sm uppercase tracking-widest mt-auto">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center px-12 py-16 gap-8">
        
        {/* LEFT: Brand mark */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-900 text-2xl">eco</span>
          <span className="font-bold text-emerald-900 normal-case tracking-tight text-xl">FarmFlow</span>
        </div>

        {/* CENTER: Links */}
        <div className="flex flex-wrap justify-center gap-6 text-stone-500">
          <Link href="/privacy-policy" className={getLinkClass('/privacy-policy')}>
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className={getLinkClass('/terms-of-service')}>
            Terms of Service
          </Link>
          {!user && (
            <Link href="/auth/login" className={getLinkClass('/auth/login')}>
              Farmer Login
            </Link>
          )}
          {user && user.role === 'BUYER' && (
            <Link href="/auth/register" className={getLinkClass('/auth/register')}>
              Become a Farmer
            </Link>
          )}
          {user && user.role === 'FARMER' && (
            <Link href="/farmer/dashboard" className={getLinkClass('/farmer/dashboard')}>
              Farmer Dashboard
            </Link>
          )}
          <Link href="/support" className={getLinkClass('/support')}>
            Support
          </Link>
        </div>

        {/* RIGHT: Copyright */}
        <div className="text-stone-500 text-xs text-center md:text-right normal-case tracking-normal">
          &copy; 2026 FarmFlow Agoo. Premium Agricultural Commerce.
        </div>
      </div>
    </footer>
  );
}