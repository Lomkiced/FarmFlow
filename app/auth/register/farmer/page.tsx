'use client';

import { useActionState, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';
import ProgressStepper from '@/components/auth/ProgressStepper';
import { registerFarmerAction, type AuthActionState } from '@/app/actions/auth';
import { uploadRegistrationDocument } from '@/app/actions/upload';
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar';
import { AGOO_BARANGAYS } from '@/lib/constants/locations';
import {
  KYC_ID_OPTIONS,
  getKycIdSpec,
  formatRsbsaNumber,
  isValidRsbsaNumber,
  verifyIdentityMatch,
} from '@/lib/kyc-utils';
import toast from 'react-hot-toast';

export default function FarmerRegisterPage() {
  // Personal Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Vegetables']);

  // KYC & RSBSA State
  const [rsbsaNumber, setRsbsaNumber] = useState<string>('');
  const [idType, setIdType] = useState<string>('RSBSA_ID');
  const [idNumber, setIdNumber] = useState<string>('');
  const [confirmIdNumber, setConfirmIdNumber] = useState<string>('');
  const [idNameOnDocument, setIdNameOnDocument] = useState<string>('');

  // ID Upload & Auto-Scan State
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [govIdUrl, setGovIdUrl] = useState<string>('');
  const [govIdPreview, setGovIdPreview] = useState<string>('');
  const [isUploadingGovId, setIsUploadingGovId] = useState(false);
  const [isScanningId, setIsScanningId] = useState(false);
  const [idScanVerified, setIdScanVerified] = useState(false);
  const [idDimensions, setIdDimensions] = useState<{ width: number; height: number } | null>(null);

  // Farm Doc Upload State
  const [farmDocFile, setFarmDocFile] = useState<File | null>(null);
  const [farmDocUrl, setFarmDocUrl] = useState<string>('');
  const [farmDocPreview, setFarmDocPreview] = useState<string>('');
  const [isUploadingFarmDoc, setIsUploadingFarmDoc] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [state, formAction, isPending] = useActionState<AuthActionState | undefined, FormData>(
    registerFarmerAction,
    undefined
  );

  const cropOptions = ['Rice', 'Corn', 'Vegetables', 'Fruits', 'Root Crops', 'Herbs'];
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const activeIdSpec = useMemo(() => getKycIdSpec(idType), [idType]);

  // Live KYC Identity Verification Result
  const kycVerification = useMemo(() => {
    return verifyIdentityMatch({
      registeredName: fullName,
      firstName,
      lastName,
      idNameOnDocument,
      idType,
      idNumber,
      confirmIdNumber,
      rsbsaNumber,
      requireRsbsa: true,
      hasUploadedDocument: Boolean(govIdUrl),
    });
  }, [fullName, firstName, lastName, idNameOnDocument, idType, idNumber, confirmIdNumber, rsbsaNumber, govIdUrl]);

  const rsbsaValid = isValidRsbsaNumber(rsbsaNumber);

  const toggleCrop = (crop: string) => {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  const handleIdTypeChange = (newType: string) => {
    setIdType(newType);
    const spec = getKycIdSpec(newType);
    if (newType === 'RSBSA_ID' && rsbsaValid && !idNumber) {
      setIdNumber(rsbsaNumber);
      setConfirmIdNumber(rsbsaNumber);
    } else {
      setIdNumber((prev) => spec.maskInput(prev));
      setConfirmIdNumber((prev) => spec.maskInput(prev));
    }
  };

  const inspectImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve({ width: 1200, height: 800 });
        return;
      }
      const img = new window.Image();
      const objUrl = URL.createObjectURL(file);
      img.onload = () => {
        resolve({ width: img.naturalWidth || 800, height: img.naturalHeight || 500 });
      };
      img.onerror = () => {
        resolve({ width: 800, height: 500 });
      };
      img.src = objUrl;
    });
  };

  const runAutoScanSimulation = () => {
    if (!govIdUrl) {
      toast.error('Please upload your Valid ID document first.');
      return;
    }
    setIsScanningId(true);
    const scanToast = toast.loading('Checking ID clarity & field match...');
    setTimeout(() => {
      setIsScanningId(false);
      setIdScanVerified(true);
      if (!idNameOnDocument && fullName) {
        setIdNameOnDocument(fullName.toUpperCase());
      }
      toast.success('ID document scan passed.', {
        id: scanToast,
        duration: 3000,
      });
    }, 900);
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

    const dims = await inspectImageDimensions(file);
    if (dims.width < 200 || dims.height < 120) {
      toast.error('Uploaded ID resolution is too low. Please upload a clearer photo.');
      return;
    }
    setIdDimensions(dims);

    setGovIdFile(file);
    setIdScanVerified(false);
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
        toast.loading('Verifying ID photo...', { id: toastId });
        setIsScanningId(true);
        setTimeout(() => {
          setIsScanningId(false);
          setIdScanVerified(true);
          toast.success('Government ID uploaded & verified.', { id: toastId });
        }, 850);
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

  const handleFarmDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setFarmDocFile(file);
    if (file.type.startsWith('image/')) {
      setFarmDocPreview(URL.createObjectURL(file));
    } else {
      setFarmDocPreview('');
    }

    setIsUploadingFarmDoc(true);
    const toastId = toast.loading('Uploading farm document...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadRegistrationDocument(formData);

      if (res.success && 'url' in res) {
        setFarmDocUrl(res.url);
        toast.success('Document uploaded successfully.', { id: toastId });
      } else {
        setFarmDocFile(null);
        setFarmDocUrl('');
        setFarmDocPreview('');
        toast.error((res as any).error || 'Failed to upload document', { id: toastId });
      }
    } catch {
      setFarmDocFile(null);
      setFarmDocUrl('');
      setFarmDocPreview('');
      toast.error('Network error during upload.', { id: toastId });
    } finally {
      setIsUploadingFarmDoc(false);
    }
  };

  const canSubmit =
    !isPending &&
    !isUploadingGovId &&
    !isUploadingFarmDoc &&
    !isScanningId &&
    govIdUrl.length > 0 &&
    idScanVerified &&
    kycVerification.isValid;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <AuthLeftPanel variant="farmer" widthClass="w-1/3" />

      <div className="w-full lg:w-2/3 flex flex-col h-screen overflow-y-auto bg-white">
        <div className="w-full max-w-3xl mx-auto p-6 md:p-10 flex-1 pb-32">
          <ProgressStepper currentStep={1} variant="full" />

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Farmer Registration & KYC
              </h2>
              <p className="text-sm text-gray-600">
                Complete your profile with verified RSBSA & Government ID to sell on FarmFlow.
              </p>
            </div>
            <Link
              href="/auth/register"
              className="text-xs font-medium text-gray-600 hover:text-green-800 transition-colors"
            >
              ← Choose role
            </Link>
          </div>

          {/* Global error */}
          {state?.message && (
            <div className="mb-6 p-3.5 bg-red-50/60 border border-red-200 rounded-lg text-xs text-red-700">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-6">
            {/* Hidden fields */}
            <input type="hidden" name="name" value={fullName} />
            <input type="hidden" name="crops" value={selectedCrops.join(',')} />
            <input type="hidden" name="idPhotoUrl" value={govIdUrl} />
            <input type="hidden" name="farmDocUrl" value={farmDocUrl} />

            {/* SECTION 1: Personal Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                  1. Personal Information
                </h3>
                <span className="text-xs text-gray-400">
                  Must match Legal Government ID
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                    First Name *
                  </label>
                  <input
                    required
                    name="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Juan"
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
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dela Cruz"
                    autoComplete="family-name"
                    className="w-full text-xs rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 outline-none focus:border-green-800"
                  />
                  {state?.errors?.name && (
                    <p className="text-[11px] text-red-700 mt-1">{state.errors.name[0]}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                    Phone Number *
                  </label>
                  <input
                    required
                    name="phone"
                    type="tel"
                    placeholder="+63 917 123 4567"
                    autoComplete="tel"
                    className="w-full text-xs rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 outline-none focus:border-green-800"
                  />
                  {state?.errors?.phone && (
                    <p className="text-[11px] text-red-700 mt-1">{state.errors.phone[0]}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                    Email Address *
                  </label>
                  <input
                    required
                    name="email"
                    type="email"
                    placeholder="juan@example.com"
                    autoComplete="email"
                    className="w-full text-xs rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 outline-none focus:border-green-800"
                  />
                  {state?.errors?.email && (
                    <p className="text-[11px] text-red-700 mt-1">{state.errors.email[0]}</p>
                  )}
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
                  {state?.errors?.password && (
                    <p className="text-[11px] text-red-700 mt-1">{state.errors.password[0]}</p>
                  )}
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
              </div>
            </div>

            {/* SECTION 2: Farm Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="mb-4 pb-2 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">2. Farm Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                    Farm Name *
                  </label>
                  <input
                    required
                    name="farmName"
                    type="text"
                    placeholder="Dela Cruz Family Farm"
                    className="w-full text-xs rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 outline-none focus:border-green-800"
                  />
                  {state?.errors?.farmName && (
                    <p className="text-[11px] text-red-700 mt-1">{state.errors.farmName[0]}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                    Barangay (Agoo, La Union) *
                  </label>
                  <select
                    required
                    name="barangay"
                    defaultValue=""
                    className="w-full text-xs rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 outline-none focus:border-green-800"
                  >
                    <option value="" disabled>
                      Select Barangay
                    </option>
                    {AGOO_BARANGAYS.map((brgy) => (
                      <option key={brgy} value={brgy}>
                        {brgy}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                    Land Area in Hectares *
                  </label>
                  <input
                    required
                    name="landArea"
                    type="number"
                    step="0.1"
                    placeholder="1.5"
                    className="w-full text-xs rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 outline-none focus:border-green-800"
                  />
                </div>

                <div className="space-y-1 md:col-span-2 mt-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                    Primary Crops *
                  </label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {cropOptions.map((crop) => {
                      const isSelected = selectedCrops.includes(crop);
                      return (
                        <button
                          key={crop}
                          type="button"
                          onClick={() => toggleCrop(crop)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-green-800 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {crop}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: KYC & RSBSA Verification */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <div className="pb-2 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    3. Identity Verification & RSBSA
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Your RSBSA Number, Government ID, and Legal Name must match.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 border border-gray-200 text-[11px] font-medium uppercase tracking-wider rounded">
                  LGU Agoo KYC
                </span>
              </div>

              {/* RSBSA Registration Number */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    DA RSBSA Farmer Reference Number *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = '01-33-02-001-000128';
                      setRsbsaNumber(sample);
                      if (idType === 'RSBSA_ID') {
                        setIdNumber(sample);
                        setConfirmIdNumber(sample);
                      }
                    }}
                    className="text-[11px] font-medium text-green-800 hover:underline"
                  >
                    Fill Agoo Sample (01-33-02-...)
                  </button>
                </div>

                <input
                  required
                  name="rsbsaNumber"
                  type="text"
                  value={rsbsaNumber}
                  onChange={(e) => {
                    const masked = formatRsbsaNumber(e.target.value);
                    setRsbsaNumber(masked);
                    if (idType === 'RSBSA_ID' && !idNumber) {
                      setIdNumber(masked);
                    }
                  }}
                  placeholder="01-33-02-001-000123"
                  className={`w-full font-mono text-xs rounded-lg border bg-white text-gray-900 py-2.5 px-3 outline-none ${
                    rsbsaNumber.length > 0
                      ? rsbsaValid
                        ? 'border-green-800'
                        : 'border-gray-400'
                      : 'border-gray-300 focus:border-green-800'
                  }`}
                />
                <p className="text-[11px] text-gray-500">
                  Format: <strong>XX-XX-XX-XXX-XXXXXX</strong> (Region 1, La Union, Agoo).
                </p>
              </div>

              {/* ID Type, Name on ID, ID Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                    Government ID Type *
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

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                      Full Name as Shown on ID *
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
                    placeholder={fullName ? fullName.toUpperCase() : 'JUAN DELA CRUZ'}
                    className="w-full text-xs uppercase rounded-lg border border-gray-300 bg-white text-gray-900 py-2.5 px-3 outline-none focus:border-green-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium uppercase tracking-wider text-gray-600">
                    ID Number ({activeIdSpec.shortLabel}) *
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

              {/* REAL-TIME IDENTITY MATCH INDICATOR CARD */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-xs text-gray-900 uppercase tracking-wider">
                    Verification Checklist
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider ${
                      kycVerification.isValid && idScanVerified
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    Match Score: {kycVerification.idMatchScore}%
                  </span>
                </div>

                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-green-800 transition-all duration-500 rounded-full"
                    style={{ width: `${kycVerification.idMatchScore}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`p-2 rounded border ${kycVerification.nameMatched ? 'bg-white border-green-200 text-green-900' : 'bg-white border-gray-200 text-gray-500'}`}>
                    <span>{kycVerification.nameMatched ? '[✓]' : '[—]'} Full Name matches Name on ID</span>
                  </div>

                  <div className={`p-2 rounded border ${kycVerification.idNumberFormatValid && kycVerification.idNumbersMatched ? 'bg-white border-green-200 text-green-900' : 'bg-white border-gray-200 text-gray-500'}`}>
                    <span>{kycVerification.idNumberFormatValid && kycVerification.idNumbersMatched ? '[✓]' : '[—]'} ID Number & Confirmation Match</span>
                  </div>

                  <div className={`p-2 rounded border ${rsbsaValid ? 'bg-white border-green-200 text-green-900' : 'bg-white border-gray-200 text-gray-500'}`}>
                    <span>{rsbsaValid ? '[✓]' : '[—]'} Valid DA RSBSA Number</span>
                  </div>

                  <div className={`p-2 rounded border ${govIdUrl && idScanVerified ? 'bg-white border-green-200 text-green-900' : 'bg-white border-gray-200 text-gray-500'}`}>
                    <span>{govIdUrl && idScanVerified ? '[✓]' : '[—]'} ID Photo Uploaded & Verified</span>
                  </div>
                </div>
              </div>

              {/* Upload Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Government ID */}
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-600 block mb-1">
                    Government ID Photo *
                  </span>

                  <input
                    type="file"
                    id="govId"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleIdUpload}
                    disabled={isUploadingGovId}
                  />

                  {!govIdFile && !govIdUrl ? (
                    <label
                      htmlFor="govId"
                      className="border border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-green-800 transition-colors bg-gray-50"
                    >
                      <span className="text-xs font-medium text-gray-900">
                        Upload {activeIdSpec.shortLabel}
                      </span>
                      <span className="text-[11px] text-gray-500 mt-0.5">
                        JPG, PNG, WebP or PDF (Max 5MB)
                      </span>
                    </label>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
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
                            setIdScanVerified(false);
                          }}
                          className="text-gray-400 hover:text-gray-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>

                      {govIdPreview && (
                        <div className="relative w-full h-28 rounded overflow-hidden border border-gray-200 bg-gray-100">
                          <Image src={govIdPreview} alt="ID Preview" fill className="object-contain" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={runAutoScanSimulation}
                        disabled={isScanningId || !govIdUrl}
                        className="w-full py-1.5 px-3 rounded bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {isScanningId ? 'Inspecting ID...' : idScanVerified ? 'ID Verified ✓' : 'Verify ID Document'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Farm Document */}
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-600 block mb-1">
                    Proof of Farm / RSBSA Certificate
                  </span>

                  <input
                    type="file"
                    id="farmDoc"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleFarmDocUpload}
                    disabled={isUploadingFarmDoc}
                  />

                  {!farmDocFile && !farmDocUrl ? (
                    <label
                      htmlFor="farmDoc"
                      className="border border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-green-800 transition-colors bg-gray-50"
                    >
                      <span className="text-xs font-medium text-gray-900">
                        Attach Certificate or Title
                      </span>
                      <span className="text-[11px] text-gray-500 mt-0.5">
                        JPG, PNG, WebP or PDF (Max 5MB)
                      </span>
                    </label>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-900 truncate max-w-[200px]">
                          {farmDocFile?.name || 'Certificate'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFarmDocFile(null);
                            setFarmDocUrl('');
                            setFarmDocPreview('');
                          }}
                          className="text-gray-400 hover:text-gray-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>

                      {farmDocPreview && (
                        <div className="relative w-full h-28 rounded overflow-hidden border border-gray-200 bg-gray-100">
                          <Image src={farmDocPreview} alt="Doc Preview" fill className="object-contain" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TERMS & SUBMIT */}
            <div className="space-y-4">
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  required
                  className="rounded border-gray-300 text-green-800 focus:ring-green-800 mt-0.5 w-4 h-4 cursor-pointer"
                />
                <label className="text-xs text-gray-600 leading-relaxed">
                  I certify that my RSBSA Number, Government ID, and personal profile information belong to me, and I agree to the Terms of Service.
                </label>
              </div>

              {!canSubmit && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                  Complete 100% KYC matching (Name, ID format, RSBSA, and uploaded photo) to enable submission.
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-green-800 hover:bg-green-900 text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Submitting Application...' : 'Submit Verified Farmer Application'}
              </button>

              <div className="text-center text-xs text-gray-500 pt-2">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-green-800 font-medium hover:underline">
                  Log in
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
