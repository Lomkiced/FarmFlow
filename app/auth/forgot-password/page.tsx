'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';
import AuthInput from '@/components/auth/AuthInput';
import { forgotPasswordAction, type AuthActionState } from '@/app/actions/auth';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthActionState | undefined, FormData>(
    forgotPasswordAction,
    undefined
  );

  const [isSuccess, setIsSuccess] = useState(false);

  // If the action returned success, show success state instead of error
  if (state?.message === 'success' && !isSuccess) {
    setIsSuccess(true);
  }

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen overflow-hidden bg-[#fcf9f2] lg:bg-auth-surface">
      <AuthLeftPanel variant="login" />

      <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center px-4 py-6 md:p-[32px]">

        {/* Mobile top section */}
        <div className="lg:hidden text-center mb-6 flex flex-col items-center mt-2">
          <span className="material-symbols-outlined text-[40px] text-primary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
          <h2 className="text-[24px] font-semibold leading-tight tracking-[-0.02em] text-auth-on-surface mb-1">Reset Password</h2>
          <p className="text-[14px] text-auth-on-surface-variant">We'll send you a link to reset it</p>
        </div>

        <div className="w-full max-w-md bg-white border border-auth-secondary-fixed rounded-xl p-[24px] md:p-[32px] shadow-sm">

          <Link href="/auth/login" className="inline-flex items-center gap-1 text-auth-secondary hover:text-primary mb-[20px] md:mb-[24px] group py-1">
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">chevron_left</span>
            <span className="text-[14px]">Back to Login</span>
          </Link>

          <div className="hidden lg:block mb-[24px]">
            <h2 className="text-[30px] font-semibold leading-[38px] tracking-[-0.02em] text-auth-on-surface mb-1">Reset Password</h2>
            <p className="text-[14px] text-auth-on-surface-variant">Enter your email and we'll send you a reset link.</p>
          </div>

          {isSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
              </div>
              <h3 className="text-xl font-semibold text-auth-on-surface mb-2">Check your email</h3>
              <p className="text-sm text-auth-on-surface-variant mb-6">
                We've sent a password reset link to your email address. Please check your inbox (and spam folder).
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center w-full bg-primary-container text-on-primary text-[16px] font-medium py-[14px] md:py-[16px] min-h-[48px] rounded-lg hover:bg-primary transition-colors"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              {/* Global error message */}
              {state?.message && state.message !== 'success' && (
                <div className="mb-4 p-3 bg-error-container/20 border border-error/30 rounded-lg flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-[18px] mt-0.5 flex-shrink-0">error</span>
                  <p className="text-[14px] text-error font-medium">{state.message}</p>
                </div>
              )}

              <form action={formAction} className="space-y-[24px]">
                <AuthInput
                  id="email"
                  name="email"
                  type="email"
                  icon="mail"
                  placeholder="name@example.com"
                  error={state?.errors?.email?.[0]}
                />

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-primary-container text-on-primary text-[16px] font-medium py-[14px] md:py-[16px] min-h-[48px] rounded-lg hover:bg-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
