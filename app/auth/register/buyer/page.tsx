'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';
import AuthInput from '@/components/auth/AuthInput';
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar';
import ProgressStepper from '@/components/auth/ProgressStepper';
import { registerBuyerAction, type AuthActionState } from '@/app/actions/auth';
import { uploadRegistrationDocument } from '@/app/actions/upload';
import { VALID_ID_TYPES } from '@/lib/validations/auth';
import toast from 'react-hot-toast';

export default function BuyerRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ID Verification state
  const [idType, setIdType] = useState<string>('PhilSys National ID');
  const [idNumber, setIdNumber] = useState<string>('');
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [govIdUrl, setGovIdUrl] = useState<string>('');
  const [govIdPreview, setGovIdPreview] = useState<string>('');
  const [isUploadingGovId, setIsUploadingGovId] = useState(false);

  const [state, formAction, isPending] = useActionState<AuthActionState | undefined, FormData>(
    registerBuyerAction,
    undefined
  );

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPG, PNG, WebP images or PDF files are accepted.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit.');
      return;
    }

    setGovIdFile(file);
    if (file.type.startsWith('image/')) {
      setGovIdPreview(URL.createObjectURL(file));
    } else {
      setGovIdPreview('');
    }

    setIsUploadingGovId(true);
    const toastId = toast.loading('Uploading government ID...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadRegistrationDocument(formData);

      if (res.success && 'url' in res) {
        setGovIdUrl(res.url);
        toast.success('ID uploaded and attached successfully!', { id: toastId });
      } else {
        setGovIdFile(null);
        setGovIdUrl('');
        setGovIdPreview('');
        toast.error((res as any).error || 'Failed to upload ID', { id: toastId });
      }
    } catch {
      setGovIdFile(null);
      setGovIdUrl('');
      setGovIdPreview('');
      toast.error('Network error during upload.', { id: toastId });
    } finally {
      setIsUploadingGovId(false);
    }
  };

  const canSubmit = !isPending && !isUploadingGovId && govIdUrl.length > 0;

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
          <p className="text-[16px] text-auth-secondary">Complete your profile to purchase fresh produce directly from local farms.</p>
        </div>

        {/* Global error */}
        {state?.message && (
          <div className="mb-4 max-w-md mx-auto w-full p-3 bg-error-container/20 border border-error/30 rounded-lg flex items-start gap-2">
            <span className="material-symbols-outlined text-error text-[18px] mt-0.5 flex-shrink-0">error</span>
            <p className="text-[14px] text-error font-medium">{state.message}</p>
          </div>
        )}

        <form action={formAction} className="max-w-md mx-auto w-full space-y-[20px]">
          {/* Hidden ID Photo URL */}
          <input type="hidden" name="idPhotoUrl" value={govIdUrl} />

          <AuthInput
            id="name"
            label="Full Name *"
            icon="person_outline"
            placeholder="Juan Dela Cruz"
            error={state?.errors?.name?.[0]}
            autoComplete="name"
          />
          <AuthInput
            id="email"
            label="Email *"
            type="email"
            icon="mail_outline"
            placeholder="juan@example.com"
            error={state?.errors?.email?.[0]}
            autoComplete="email"
          />
          <AuthInput
            id="phone"
            label="Phone Number"
            type="tel"
            icon="phone"
            placeholder="+63 900 000 0000"
            error={state?.errors?.phone?.[0]}
            autoComplete="tel"
          />

          {/* ID VERIFICATION SECTION (MANDATORY) */}
          <div className="bg-surface-container-lowest border border-auth-secondary-fixed rounded-xl p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-auth-secondary-fixed">
              <span className="font-semibold text-sm text-auth-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                Valid Government ID (Required) *
              </span>
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">
                Required
              </span>
            </div>

            {/* ID Type Dropdown */}
            <div className="space-y-1">
              <label className="font-auth-label-caps text-auth-on-surface-variant uppercase text-xs">
                Select ID Type *
              </label>
              <select
                required
                name="idType"
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full text-[14px] rounded-lg border border-auth-secondary-fixed bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors shadow-sm py-2.5 px-3 outline-none"
              >
                {VALID_ID_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* ID Number */}
            <div className="space-y-1">
              <label className="font-auth-label-caps text-auth-on-surface-variant uppercase text-xs">
                ID Number / Reference *
              </label>
              <input
                required
                name="idNumber"
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="e.g., 1234-5678-9012"
                className="w-full text-[14px] rounded-lg border border-auth-secondary-fixed bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors shadow-sm py-2 px-3 outline-none"
              />
              {state?.errors?.idNumber && <p className="text-[11px] text-error mt-1">{state.errors.idNumber[0]}</p>}
            </div>

            {/* Document Upload */}
            <div>
              <label className="font-auth-label-caps text-auth-on-surface-variant uppercase text-xs block mb-1.5">
                Upload {idType} Photo / Document *
              </label>

              <input 
                type="file" 
                id="buyerGovId" 
                className="hidden" 
                accept=".jpg,.jpeg,.png,.webp,.pdf" 
                onChange={handleIdUpload}
                disabled={isUploadingGovId}
              />

              {!govIdFile && !govIdUrl ? (
                <label 
                  htmlFor="buyerGovId" 
                  className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group bg-auth-surface ${
                    state?.errors?.idPhotoUrl ? 'border-error bg-error/5' : 'border-outline-variant hover:border-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-outline text-2xl mb-1 group-hover:text-primary">upload_file</span>
                  <span className="text-auth-on-surface font-medium text-xs">Click to upload valid government ID</span>
                  <span className="text-outline text-[11px] mt-0.5">JPG, PNG, WebP or PDF (Max 5MB)</span>
                </label>
              ) : (
                <div className="bg-auth-surface-container-low border border-primary rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">
                      {govIdFile?.type === 'application/pdf' ? 'picture_as_pdf' : 'badge'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-auth-on-surface truncate">{govIdFile?.name || 'Government ID'}</div>
                      <div className="text-[11px] text-auth-secondary">
                        {isUploadingGovId ? 'Uploading...' : 'Uploaded successfully'}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setGovIdFile(null);
                        setGovIdUrl('');
                        setGovIdPreview('');
                      }} 
                      className="text-auth-secondary hover:text-error p-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>

                  {govIdPreview && (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-outline-variant/40 bg-surface">
                      <Image src={govIdPreview} alt="ID Preview" fill className="object-contain" />
                    </div>
                  )}
                </div>
              )}

              {state?.errors?.idPhotoUrl && (
                <p className="text-[12px] text-error font-medium mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {state.errors.idPhotoUrl[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <AuthInput
              id="password"
              label="Password *"
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
            label="Confirm Password *"
            type="password"
            icon="lock_outline"
            trailingIcon={confirmPassword.length > 0 ? (passwordsMatch ? 'check_circle' : 'cancel') : undefined}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={
              (confirmPassword.length > 0 && !passwordsMatch)
                ? 'Passwords do not match.'
                : (passwordsMatch ? undefined : state?.errors?.confirmPassword?.[0])
            }
            placeholder="••••••••"
            autoComplete="new-password"
          />

          <div className="flex items-start mt-[16px]">
            <input type="checkbox" id="terms" required className="w-4 h-4 text-primary border-auth-secondary-fixed rounded focus:ring-primary/20 bg-white mt-1 cursor-pointer" />
            <label htmlFor="terms" className="ml-2 text-[14px] text-auth-secondary">
              I agree to the{' '}
              <a href="#" className="hover:underline text-primary">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="hover:underline text-primary">Privacy Policy</a>
            </label>
          </div>

          {!govIdUrl && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>Valid Government ID is required to complete buyer registration.</span>
            </div>
          )}

          <div className="mt-[24px] pt-[8px] space-y-[16px]">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-primary text-on-primary py-4 rounded-xl text-[16px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  Creating account...
                </>
              ) : isUploadingGovId ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">cloud_upload</span>
                  Uploading Government ID...
                </>
              ) : (
                'Create Buyer Account'
              )}
            </button>

            <div className="text-center text-[14px] text-auth-secondary pt-[8px]">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">Log in</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
