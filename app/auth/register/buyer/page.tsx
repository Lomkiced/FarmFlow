'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';
import AuthInput from '@/components/auth/AuthInput';
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar';
import ProgressStepper from '@/components/auth/ProgressStepper';
import { registerBuyerAction, type AuthActionState } from '@/app/actions/auth';

export default function BuyerRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [state, formAction, isPending] = useActionState<AuthActionState | undefined, FormData>(
    registerBuyerAction,
    undefined
  );

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-auth-surface">
      <AuthLeftPanel variant="buyer" widthClass="w-1/2" />

      <div className="w-full lg:w-1/2 flex flex-col p-[20px] md:p-[40px] bg-auth-surface overflow-y-auto">
        <div className="flex justify-between items-center mb-[32px]">
          <Link href="/auth/register" className="inline-flex items-center gap-1 text-auth-secondary text-[14px] hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Choose role
          </Link>
          <ProgressStepper currentStep={1} variant="inline" />
        </div>

        <div className="mb-[32px] max-w-md mx-auto w-full">
          <h2 className="text-[30px] font-semibold tracking-[-0.02em] font-['Manrope'] mb-[8px]">Create Buyer Account</h2>
          <p className="text-[16px] text-auth-secondary">Start shopping fresh produce today.</p>
        </div>

        {/* Global error */}
        {state?.message && (
          <div className="mb-4 max-w-md mx-auto w-full p-3 bg-error-container/20 border border-error/30 rounded-lg flex items-start gap-2">
            <span className="material-symbols-outlined text-error text-[18px] mt-0.5 flex-shrink-0">error</span>
            <p className="text-[14px] text-error font-medium">{state.message}</p>
          </div>
        )}

        <form action={formAction} className="max-w-md mx-auto w-full space-y-[16px]">
          <AuthInput
            id="name"
            label="Full Name"
            icon="person_outline"
            placeholder="Juan Dela Cruz"
            error={state?.errors?.name?.[0]}
            autoComplete="name"
          />
          <AuthInput
            id="email"
            label="Email"
            type="email"
            icon="mail_outline"
            placeholder="juan@example.com"
            error={state?.errors?.email?.[0]}
            autoComplete="email"
          />
          <AuthInput
            id="phone"
            label="Phone (Optional)"
            type="tel"
            icon="phone"
            placeholder="+63 900 000 0000"
            error={state?.errors?.phone?.[0]}
            autoComplete="tel"
          />

          <div>
            <AuthInput
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              icon="lock_outline"
              trailingIcon={showPassword ? 'visibility_off' : 'visibility'}
              onTrailingClick={() => setShowPassword(v => !v)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={state?.errors?.password?.[0]}
              autoComplete="new-password"
            />
            <PasswordStrengthBar password={password} />
          </div>

          <AuthInput
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            icon="lock_outline"
            trailingIcon={confirmPassword.length > 0 ? (passwordsMatch ? 'check_circle' : 'cancel') : undefined}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={
              state?.errors?.confirmPassword?.[0] ??
              (confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match.' : undefined)
            }
            placeholder="••••••••"
            autoComplete="new-password"
          />

          <div className="flex items-start mt-[16px]">
            <input type="checkbox" id="terms" required className="w-4 h-4 text-primary border-auth-secondary-fixed rounded focus:ring-primary/20 bg-white mt-1" />
            <label htmlFor="terms" className="ml-2 text-[14px] text-auth-secondary">
              I agree to the{' '}
              <a href="#" className="hover:underline text-primary">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="hover:underline text-primary">Privacy Policy</a>
            </label>
          </div>

          <div className="mt-[32px] pt-[16px] space-y-[16px]">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary text-on-primary py-4 rounded-xl text-[16px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  Creating account...
                </>
              ) : (
                'Create Buyer Account'
              )}
            </button>

            <div className="text-center text-[14px] text-auth-secondary pt-[16px]">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">Log in</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
