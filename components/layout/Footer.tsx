import Link from 'next/link';

import type { SessionUser } from '@/lib/dal';

export default function Footer({ user }: { user?: SessionUser | null }) {
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
          <Link href="#" className="hover:text-emerald-600 hover:underline underline-offset-4 transition-all">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-emerald-600 hover:underline underline-offset-4 transition-all">
            Terms of Service
          </Link>
          {!user && (
            <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 hover:underline underline-offset-4 transition-all font-bold">
              Farmer Login
            </Link>
          )}
          {user && user.role === 'BUYER' && (
            <Link href="/auth/register" className="text-amber-600 hover:text-amber-700 hover:underline underline-offset-4 transition-all font-bold">
              Become a Farmer
            </Link>
          )}
          {user && user.role === 'FARMER' && (
            <Link href="/farmer/dashboard" className="text-amber-600 hover:text-amber-700 hover:underline underline-offset-4 transition-all font-bold">
              Farmer Dashboard
            </Link>
          )}
          <Link href="#" className="hover:text-emerald-600 hover:underline underline-offset-4 transition-all">
            Support
          </Link>
        </div>

        {/* RIGHT: Copyright */}
        <div className="text-stone-500 text-xs text-center md:text-right normal-case tracking-normal">
          &copy; 2024 FarmFlow Agoo. Premium Agricultural Commerce.
        </div>
      </div>
    </footer>
  );
}