'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function RegisterSuccessContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gray-50">
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-xl p-8 md:p-10 flex flex-col items-center text-center">
        {role === 'buyer' && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-800 flex items-center justify-center font-bold text-xl mb-4 border border-green-200">
              ✓
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Created</h1>
            
            <p className="text-xs text-gray-600 max-w-md mb-6 leading-relaxed">
              Welcome to FarmFlow. Your account is verified and ready. You can now browse and order fresh produce directly from local farms.
            </p>
            
            <Link 
              href="/products" 
              className="w-full bg-green-800 hover:bg-green-900 text-white py-3 rounded-lg text-xs font-semibold transition-colors"
            >
              Browse Marketplace
            </Link>
          </>
        )}

        {role === 'farmer' && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-800 flex items-center justify-center font-bold text-lg mb-4 border border-green-200">
              ✓
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted</h1>
            
            <p className="text-xs text-gray-600 max-w-md mb-6 leading-relaxed">
              Your farmer application has been received and is queued for verification by the local agricultural office. You will be notified once reviewed.
            </p>

            <div className="w-full bg-gray-50 rounded-lg p-4 text-left mb-6 border border-gray-200">
              <div className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-3">
                Application Status
              </div>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="text-green-800 font-bold mt-0.5">[✓]</span>
                  <div>
                    <div className="font-semibold text-gray-900">Profile & Farm Information</div>
                    <div className="text-gray-500 text-[11px]">Submitted successfully.</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-green-800 font-bold mt-0.5">[✓]</span>
                  <div>
                    <div className="font-semibold text-gray-900">KYC & RSBSA ID Cross-Check</div>
                    <div className="text-gray-500 text-[11px]">100% Identity match recorded.</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-gray-400 font-bold mt-0.5">[—]</span>
                  <div>
                    <div className="font-semibold text-gray-900">Admin Document Verification</div>
                    <div className="text-gray-500 text-[11px]">Awaiting review by the verification board.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 w-full">
              <Link 
                href="/" 
                className="w-full py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Homepage
              </Link>
              
              <Link href="/support" className="text-xs text-green-800 hover:underline">
                Need help? Contact support
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function RegisterSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xs text-gray-400">
        Loading...
      </div>
    }>
      <RegisterSuccessContent />
    </Suspense>
  );
}
