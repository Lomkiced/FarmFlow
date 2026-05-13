'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function RegisterSuccessContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  return (
    <div className="min-h-screen flex items-center justify-center p-[16px] md:p-[32px] bg-auth-background">
      <div className="w-full max-w-2xl bg-white border border-auth-secondary-fixed rounded-xl p-[32px] md:p-[40px] flex flex-col items-center text-center">
        
        {role === 'buyer' && (
          <>
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-[24px] bg-secondary-container border-4 border-primary/20">
              <span className="material-symbols-outlined text-[48px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            
            <h1 className="text-[30px] font-semibold text-auth-on-surface mb-[16px]">Account Created!</h1>
            
            <p className="text-[16px] text-auth-secondary max-w-lg mb-[32px]">
              Welcome to FarmFlow! You can now browse and purchase fresh crops from Agoo farmers.
            </p>
            
            <Link href="/products" className="w-full bg-primary text-on-primary py-4 rounded-xl text-[16px] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined">storefront</span>
              Start Shopping
            </Link>
          </>
        )}

        {role === 'farmer' && (
          <>
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-[24px] bg-[#FFFbeb] border-4 border-[#FDE68A]">
              <span className="material-symbols-outlined text-[48px] text-[#D97706]" style={{ fontVariationSettings: "'FILL' 1" }}>hourglass_empty</span>
            </div>
            
            <h1 className="text-[30px] font-semibold text-auth-on-surface mb-[16px]">Application Submitted!</h1>
            
            <p className="text-[16px] text-auth-secondary max-w-lg mb-[32px]">
              Thank you! Your farmer account is under review by the Agoo Agricultural Office. We'll notify you at applicant@example.com within 1-2 business days.
            </p>

            <div className="w-full bg-auth-surface-container rounded-xl p-[16px] text-left mb-[32px] border border-auth-secondary-fixed">
              <div className="text-[12px] font-semibold tracking-wider text-auth-secondary uppercase mb-[16px]">
                APPLICATION STATUS
              </div>
              
              <div className="space-y-[16px]">
                <div className="flex items-start gap-[8px]">
                  <span className="material-symbols-outlined text-primary-container text-[20px] mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <div>
                    <div className="text-[14px] font-medium text-auth-on-surface">Profile Created</div>
                    <div className="text-[13px] text-auth-secondary">Basic information submitted successfully.</div>
                  </div>
                </div>

                <div className="flex items-start gap-[8px]">
                  <span className="material-symbols-outlined text-primary-container text-[20px] mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <div>
                    <div className="text-[14px] font-medium text-auth-on-surface">Farm Details Registered</div>
                    <div className="text-[13px] text-auth-secondary">Location and crop data recorded.</div>
                  </div>
                </div>

                <div className="flex items-start gap-[8px]">
                  <span className="material-symbols-outlined text-[#D97706] text-[20px] mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                  <div>
                    <div className="text-[14px] font-medium text-auth-on-surface">Document Verification Pending</div>
                    <div className="text-[13px] text-auth-secondary">Awaiting manual review of submitted documents.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-[16px] w-full">
              <Link href="/" className="inline-flex items-center justify-center px-[24px] py-[8px] bg-white border border-auth-secondary-fixed rounded-lg text-[14px] font-medium text-auth-on-surface hover:bg-auth-surface-container-low transition-colors min-w-[200px]">
                Back to Homepage
              </Link>
              
              <Link href="/support" className="inline-flex items-center gap-1 text-[14px] text-primary hover:text-primary-container">
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
                Questions? Contact support
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function RegisterSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-auth-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <RegisterSuccessContent />
    </Suspense>
  );
}
