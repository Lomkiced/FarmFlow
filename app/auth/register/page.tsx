'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterRoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'farmer' | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-[16px] bg-auth-surface">
      <div className="w-full max-w-[480px] bg-white rounded-2xl p-[32px] shadow-sm border border-auth-secondary-fixed">
        
        <div className="text-center mb-[32px]">
          <div className="flex items-center justify-center gap-2 mb-[24px]">
            <span className="material-symbols-outlined text-primary text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            <span className="text-[24px] font-semibold text-primary tracking-tight">FarmFlow</span>
          </div>
          <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.02em] text-auth-on-surface mb-1">Create your account</h1>
          <p className="text-[16px] text-auth-on-surface-variant">Join the Agoo agricultural community</p>
        </div>

        <span className="text-[12px] font-semibold tracking-[0.05em] text-auth-on-surface-variant mb-[16px] uppercase block">
          I WANT TO JOIN AS A:
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[32px]">
          
          <button 
            onClick={() => setSelectedRole('buyer')}
            className={`group flex flex-col items-start p-[16px] bg-white rounded-xl text-left transition-colors border-2 ${selectedRole === 'buyer' ? 'border-primary bg-primary/5' : 'border-auth-secondary-fixed hover:border-primary/50'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-[16px] transition-colors ${selectedRole === 'buyer' ? 'bg-primary-container text-on-primary-container' : 'bg-auth-surface-container-high text-auth-on-surface group-hover:bg-primary-container group-hover:text-on-primary-container'}`}>
              <span className="material-symbols-outlined">shopping_bag</span>
            </div>
            <h3 className="text-[20px] font-semibold text-auth-on-surface mb-1">Buyer</h3>
            <p className="text-[14px] text-auth-on-surface-variant">Browse and purchase fresh crops directly from Agoo farmers</p>
          </button>

          <button 
            onClick={() => setSelectedRole('farmer')}
            className={`group flex flex-col items-start p-[16px] bg-white rounded-xl text-left transition-colors border-2 ${selectedRole === 'farmer' ? 'border-primary bg-primary/5' : 'border-auth-secondary-fixed hover:border-primary/50'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-[16px] transition-colors ${selectedRole === 'farmer' ? 'bg-primary-container text-on-primary-container' : 'bg-auth-surface-container-high text-auth-on-surface group-hover:bg-primary-container group-hover:text-on-primary-container'}`}>
              <span className="material-symbols-outlined">agriculture</span>
            </div>
            <h3 className="text-[20px] font-semibold text-auth-on-surface mb-1">Farmer</h3>
            <p className="text-[14px] text-auth-on-surface-variant">List your crops, manage your farm, and reach more buyers in La Union</p>
            <div className="mt-auto inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-tertiary-fixed text-on-tertiary-fixed-variant mt-4">
              <span className="material-symbols-outlined text-[14px]">info</span>
              <span className="text-[11px]">Requires admin verification</span>
            </div>
          </button>

        </div>

        <div className="flex flex-col gap-[16px]">
          <button
            disabled={selectedRole === null}
            onClick={() => router.push(`/auth/register/${selectedRole}`)}
            className={`w-full py-[24px] rounded-xl text-[16px] font-medium transition-opacity ${selectedRole !== null ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-auth-surface-container text-auth-on-surface-variant cursor-not-allowed opacity-60'}`}
          >
            Continue
          </button>

          <div className="text-center text-[14px] text-auth-on-surface-variant">
            Already have an account? <Link href="/auth/login" className="font-medium text-primary hover:underline">Sign In</Link>
          </div>
        </div>

      </div>
    </div>
  );
}