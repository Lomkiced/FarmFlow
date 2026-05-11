'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';
import AuthInput from '@/components/auth/AuthInput';
import { loginAction, type AuthActionState } from '@/app/actions/auth';

export default function LoginPage() {
  const [role, setRole] = useState<'buyer' | 'farmer'>('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState<AuthActionState | undefined, FormData>(
    loginAction,
    undefined
  );

  return (
    <div className="flex w-full min-h-screen overflow-hidden bg-[#fcf9f2] lg:bg-auth-surface">
      <AuthLeftPanel variant="login" />

      <div className="w-full lg:w-1/2 h-full overflow-y-auto flex items-center justify-center p-[16px] md:p-[32px]">

        {/* Mobile top section */}
        <div className="lg:hidden text-center mb-8 flex flex-col items-center mt-8">
          <span className="material-symbols-outlined text-[48px] text-primary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          <h2 className="text-[30px] font-semibold leading-[38px] tracking-[-0.02em] text-auth-on-surface mb-1">Welcome back</h2>
          <p className="text-[14px] text-auth-on-surface-variant">Sign in to your FarmFlow account</p>
        </div>

        <div className="w-full max-w-md bg-white border border-auth-secondary-fixed rounded-xl p-[32px] shadow-sm">

          <Link href="/" className="inline-flex items-center gap-1 text-auth-secondary hover:text-primary mb-[24px] group">
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">chevron_left</span>
            <span className="text-[14px]">Back to Marketplace</span>
          </Link>

          <div className="hidden lg:block mb-[24px]">
            <h2 className="text-[30px] font-semibold leading-[38px] tracking-[-0.02em] text-auth-on-surface mb-1">Welcome back</h2>
            <p className="text-[14px] text-auth-on-surface-variant">Sign in to your FarmFlow account</p>
          </div>

          <div className="mb-[24px]">
            <label className="text-[12px] font-semibold tracking-[0.05em] text-auth-on-surface-variant mb-[8px] uppercase block">
              I AM SIGNING IN AS A:
            </label>

            {/* Desktop Role Selector */}
            <div className="hidden lg:flex bg-auth-surface-container-low p-1 rounded-lg border border-auth-secondary-fixed">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`flex-1 py-2 px-[16px] text-center rounded text-[14px] transition-all ${role === 'buyer' ? 'bg-white text-auth-on-surface font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-auth-secondary-fixed' : 'text-auth-on-surface-variant hover:text-auth-on-surface'}`}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`flex-1 py-2 px-[16px] text-center rounded text-[14px] transition-all ${role === 'farmer' ? 'bg-white text-auth-on-surface font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-auth-secondary-fixed' : 'text-auth-on-surface-variant hover:text-auth-on-surface'}`}
              >
                Farmer / Admin
              </button>
            </div>

            {/* Mobile Role Selector */}
            <div className="relative flex bg-auth-surface-container-low p-1 rounded-full border border-outline-variant/30 lg:hidden mt-2">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`flex-1 py-2 text-[14px] text-center z-10 relative font-semibold transition-colors ${role === 'buyer' ? 'text-primary' : 'text-auth-on-surface-variant'}`}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`flex-1 py-2 text-[14px] text-center z-10 relative font-semibold transition-colors ${role === 'farmer' ? 'text-primary' : 'text-auth-on-surface-variant'}`}
              >
                Farmer / Admin
              </button>
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] border border-outline-variant/20 transition-all duration-300 ease-in-out"
                style={{ transform: role === 'buyer' ? 'translateX(0)' : 'translateX(calc(100% + 4px))', left: '4px' }}
              />
            </div>
          </div>

          {/* Global error message */}
          {state?.message && (
            <div className="mb-4 p-3 bg-error-container/20 border border-error/30 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-[18px] mt-0.5 flex-shrink-0">error</span>
              <p className="text-[14px] text-error font-medium">{state.message}</p>
            </div>
          )}

          <form action={formAction} className="space-y-[16px]">
            <AuthInput
              id="email"
              name="email"
              type="email"
              icon="mail"
              placeholder="name@company.com"
              error={state?.errors?.email?.[0]}
            />

            <AuthInput
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              icon="lock"
              trailingIcon={showPassword ? 'visibility_off' : 'visibility'}
              onTrailingClick={() => setShowPassword(v => !v)}
              placeholder="••••••••"
              error={state?.errors?.password?.[0]}
            />

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-[14px] text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary-container text-on-primary text-[16px] font-medium py-[16px] rounded-lg hover:bg-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center text-[14px] text-auth-on-surface-variant mt-[32px] mb-[32px]">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:underline font-medium">Register here</Link>
          </div>

          <div className="text-center text-[13px] text-auth-secondary px-[32px]">
            By signing in, you agree to our{' '}
            <a href="#" className="hover:underline text-auth-on-surface">Terms</a>{' '}
            and{' '}
            <a href="#" className="hover:underline text-auth-on-surface">Privacy Policy</a>.
          </div>

        </div>
      </div>
    </div>
  );
}