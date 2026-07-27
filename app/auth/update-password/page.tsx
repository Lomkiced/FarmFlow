'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';
import AuthInput from '@/components/auth/AuthInput';
import { updatePasswordAction, type AuthActionState } from '@/app/actions/auth';

export default function UpdatePasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, formAction, isPending] = useActionState<AuthActionState | undefined, FormData>(
    updatePasswordAction,
    undefined
  );

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen overflow-hidden bg-[#fcf9f2] lg:bg-auth-surface">
      <AuthLeftPanel variant="login" />

      <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center px-4 py-6 md:p-[32px]">

        {/* Mobile top section */}
        <div className="lg:hidden text-center mb-6 flex flex-col items-center mt-2">
          <span className="material-symbols-outlined text-[40px] text-primary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>password</span>
          <h2 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-auth-on-surface mb-1">Create New Password</h2>
          <p className="text-[14px] text-auth-on-surface-variant">Secure your account with a strong password</p>
        </div>

        <div className="w-full max-w-md bg-white border border-auth-secondary-fixed rounded-xl p-[24px] md:p-[32px] shadow-sm">

          <div className="hidden lg:block mb-[32px]">
            <h2 className="text-[30px] font-semibold leading-[38px] tracking-[-0.02em] text-auth-on-surface mb-1">Create New Password</h2>
            <p className="text-[14px] text-auth-on-surface-variant">Secure your account with a strong password.</p>
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
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              icon="lock"
              trailingIcon={showPassword ? 'visibility_off' : 'visibility'}
              onTrailingClick={() => setShowPassword(v => !v)}
              placeholder="New password"
              error={state?.errors?.password?.[0]}
            />
            
            <div className="text-[12px] text-auth-secondary -mt-2 mb-2 px-1">
              Must be at least 8 characters, contain a letter and a number.
            </div>

            <AuthInput
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              icon="lock_reset"
              trailingIcon={showConfirmPassword ? 'visibility_off' : 'visibility'}
              onTrailingClick={() => setShowConfirmPassword(v => !v)}
              placeholder="Confirm new password"
              error={state?.errors?.confirmPassword?.[0]}
            />

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary-container text-on-primary text-[16px] font-medium py-[14px] md:py-[16px] min-h-[48px] rounded-lg hover:bg-primary transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
