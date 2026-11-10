'use client';

import { useActionState, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar';
import ProgressStepper from '@/components/auth/ProgressStepper';
import { registerBuyerAction, type AuthActionState } from '@/app/actions/auth';
import { uploadRegistrationDocument } from '@/app/actions/upload';
import { KYC_ID_OPTIONS, getKycIdSpec, verifyIdentityMatch } from '@/lib/kyc-utils';
import toast from 'react-hot-toast';

export default function BuyerRegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // KYC Identity Verification state
  const [idType, setIdType] = useState<string>('PHILSYS_NATIONAL_ID');
  const [idNumber, setIdNumber] = useState<string>('');
  const [confirmIdNumber, setConfirmIdNumber] = useState<string>('');
  const [idNameOnDocument, setIdNameOnDocument] = useState<string>('');
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [govIdUrl, setGovIdUrl] = useState<string>('');
  const [govIdPreview, setGovIdPreview] = useState<string>('');
  const [isUploadingGovId, setIsUploadingGovId] = useState(false);

  const [state, formAction, isPending] = useActionState<AuthActionState | undefined, FormData>(
    registerBuyerAction,
    undefined
  );

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const activeIdSpec = useMemo(() => getKycIdSpec(idType), [idType]);

  const kycVerification = useMemo(() => {
    return verifyIdentityMatch({
      registeredName: fullName,
      firstName,
      lastName,
      idNameOnDocument,
      idType,
      idNumber,
      confirmIdNumber,
      requireRsbsa: false,
      hasUploadedDocument: Boolean(govIdUrl),
    });
  }, [fullName, firstName, lastName, idNameOnDocument, idType, idNumber, confirmIdNumber, govIdUrl]);

  const handleIdTypeChange = (newType: string) => {
    setIdType(newType);
    const spec = getKycIdSpec(newType);
    setIdNumber((prev) => spec.maskInput(prev));
    setConfirmIdNumber((prev) => spec.maskInput(prev));
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPG, PNG, WebP images or PDF files are accepted.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
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
        if (!idNameOnDocument && fullName) {
          setIdNameOnDocument(fullName.toUpperCase());
        }
        toast.success('ID uploaded and verified.', { id: toastId });
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

  const canSubmit =
    !isPending &&
    !isUploadingGovId &&
    govIdUrl.length > 0 &&
    kycVerification.isValid;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <AuthLeftPanel variant="buyer" widthClass="w-1/2" />

      <div className="w-full lg:w-1/2 flex flex-col p-6 md:p-10 bg-white overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/auth/register"
            className="text-xs font-medium text-gray-600 hover:text-green-800 transition-colors"
          >
            ← Choose role
          </Link>
          <ProgressStepper currentStep={1} variant="inline" />
        </div>

        <div className="mb-6 max-w-lg mx-auto w-full">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
            Create Verified Buyer Account
          </h2>
          <p className="text-xs text-gray-500">
            Complete your profile and KYC verification to purchase produce or sign Wholesale Contracts.
          </p>
        </div>

        {/* Global error */}
        {state?.message && (
          <div className="mb-4 max-w-lg mx-auto w-full p-3 bg-red-50/60 border border-red-200 rounded-lg text-xs text-red-700">
            {state.message}
          </div>
        )}

        <form action={formAction} className="max-w-lg mx-auto w-full space-y-4">
          {/* Hidden fields */}
          <input type="hidden" name="name" value={fullName} />
          <input type="hidden" name="idPhotoUrl" value={govIdUrl} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                First Name *
              </label>
              <input
                required
                name="firstName"
                type="text"
                placeholder="Maria"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                className="w-full text-xs rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 outline-none focus:border-green-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                Last Name *
              </label>
              <input
                required
                name="lastName"
                type="text"
                placeholder="Clara"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                className="w-full text-xs rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 outline-none focus:border-green-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
              Email *
            </label>
            <input
              required
              name="email"
              type="email"
              placeholder="maria@example.com"
              autoComplete="email"
              className="w-full text-xs rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 outline-none focus:border-green-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
              Phone Number
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="+63 918 123 4567"
              autoComplete="tel"
              className="w-full text-xs rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 outline-none focus:border-green-800"
            />
          </div>

          {/* KYC IDENTITY VERIFICATION SECTION */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50/50">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div>
                <span className="font-semibold text-xs uppercase tracking-wider text-gray-900">
                  Identity Verification
                </span>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Enables Wholesale Contracts & Escrow Protection
                </p>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700">
                {kycVerification.idMatchScore}% Match
              </span>
            </div>

            {/* ID Type */}
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                Valid ID Type *
              </label>
              <select
                required
                name="idType"
                value={idType}
                onChange={(e) => handleIdTypeChange(e.target.value)}
                className="w-full text-xs rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 outline-none focus:border-green-800"
              >
                {KYC_ID_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400">{activeIdSpec.formatHint}</p>
            </div>

            {/* Name on ID */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                  Full Name on ID *
                </label>
                {fullName.length >= 3 && (
                  <button
                    type="button"
                    onClick={() => setIdNameOnDocument(fullName.toUpperCase())}
                    className="text-[11px] font-medium text-green-800 hover:underline"
                  >
                    Copy Profile Name
                  </button>
                )}
              </div>
              <input
                required
                name="idNameOnDocument"
                type="text"
                value={idNameOnDocument}
                onChange={(e) => setIdNameOnDocument(e.target.value)}
                placeholder={fullName ? fullName.toUpperCase() : 'MARIA CLARA'}
                className="w-full text-xs uppercase rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 outline-none focus:border-green-800"
              />
            </div>

            {/* ID Number + Confirm ID Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                  ID Number *
                </label>
                <input
                  required
                  name="idNumber"
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(activeIdSpec.maskInput(e.target.value))}
                  placeholder={activeIdSpec.placeholder}
                  className="w-full font-mono text-xs rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 outline-none focus:border-green-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                  Confirm ID Number *
                </label>
                <input
                  required
                  name="confirmIdNumber"
                  type="text"
                  value={confirmIdNumber}
                  onChange={(e) => setConfirmIdNumber(activeIdSpec.maskInput(e.target.value))}
                  placeholder={`Confirm ${activeIdSpec.placeholder}`}
                  className="w-full font-mono text-xs rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 outline-none focus:border-green-800"
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className={`px-2 py-0.5 rounded border ${kycVerification.nameMatched ? 'bg-white border-green-200 text-green-900' : 'bg-white border-gray-200 text-gray-500'}`}>
                {kycVerification.nameMatched ? '[✓]' : '[—]'} Name Match
              </span>
              <span className={`px-2 py-0.5 rounded border ${kycVerification.idNumberFormatValid && kycVerification.idNumbersMatched ? 'bg-white border-green-200 text-green-900' : 'bg-white border-gray-200 text-gray-500'}`}>
                {kycVerification.idNumberFormatValid && kycVerification.idNumbersMatched ? '[✓]' : '[—]'} ID Format Match
              </span>
              <span className={`px-2 py-0.5 rounded border ${govIdUrl ? 'bg-white border-green-200 text-green-900' : 'bg-white border-gray-200 text-gray-500'}`}>
                {govIdUrl ? '[✓]' : '[—]'} ID Document Attached
              </span>
            </div>

            {/* Document Upload */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-gray-600 block mb-1">
                Upload {activeIdSpec.shortLabel} Photo *
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
                  className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-green-800 transition-colors bg-white"
                >
                  <span className="text-xs font-medium text-gray-900">
                    Upload {activeIdSpec.shortLabel}
                  </span>
                  <span className="text-[11px] text-gray-500 mt-0.5">
                    JPG, PNG, WebP or PDF (Max 5MB)
                  </span>
                </label>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-900 truncate max-w-[200px]">
                      {govIdFile?.name || 'Government ID'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setGovIdFile(null);
                        setGovIdUrl('');
                        setGovIdPreview('');
                      }}
                      className="text-gray-400 hover:text-gray-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>

                  {govIdPreview && (
                    <div className="relative w-full h-24 rounded overflow-hidden border border-gray-200 bg-gray-100">
                      <Image src={govIdPreview} alt="ID Preview" fill className="object-contain" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
              Password *
            </label>
            <div className="relative">
              <input
                required
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 pr-10 outline-none focus:border-green-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <PasswordStrengthBar password={password} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
              Confirm Password *
            </label>
            <input
              required
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 outline-none focus:border-green-800"
            />
            {!passwordsMatch && confirmPassword.length > 0 && (
              <p className="text-[11px] text-red-700 mt-1">Passwords do not match.</p>
            )}
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-4 h-4 text-green-800 border-gray-300 rounded focus:ring-green-800 mt-0.5 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
              I agree to the Terms of Service and Privacy Policy.
            </label>
          </div>

          {!canSubmit && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
              Complete KYC Name & ID matching and upload your Government ID to proceed.
            </div>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-green-800 hover:bg-green-900 text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending
                ? 'Creating verified account...'
                : isUploadingGovId
                ? 'Uploading Government ID...'
                : 'Create KYC-Verified Buyer Account'}
            </button>

            <div className="text-center text-xs text-gray-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-green-800 font-medium hover:underline">
                Log in
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
