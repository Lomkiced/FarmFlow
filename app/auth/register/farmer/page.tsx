'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';
import ProgressStepper from '@/components/auth/ProgressStepper';
import { registerFarmerAction, type AuthActionState } from '@/app/actions/auth';
import { uploadRegistrationDocument } from '@/app/actions/upload';
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar';
import { AGOO_BARANGAYS } from '@/lib/constants/locations';
import { VALID_ID_TYPES } from '@/lib/validations/auth';
import toast from 'react-hot-toast';

export default function FarmerRegisterPage() {
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Vegetables']);
  const [idType, setIdType] = useState<string>('PhilSys National ID');
  const [idNumber, setIdNumber] = useState<string>('');
  
  // ID Upload State
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [govIdUrl, setGovIdUrl] = useState<string>('');
  const [govIdPreview, setGovIdPreview] = useState<string>('');
  const [isUploadingGovId, setIsUploadingGovId] = useState(false);

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

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev => 
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
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
        toast.success('Government ID uploaded and verified successfully!', { id: toastId });
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
      toast.error('Network error during upload. Please try again.', { id: toastId });
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
      toast.error('File size exceeds the 5MB limit.');
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
        toast.success('Document uploaded successfully!', { id: toastId });
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

  const canSubmit = !isPending && !isUploadingGovId && !isUploadingFarmDoc && govIdUrl.length > 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-auth-background">
      <AuthLeftPanel variant="farmer" widthClass="w-1/3" />

      <div className="w-full lg:w-2/3 flex flex-col h-screen overflow-y-auto bg-auth-surface">
        <div className="w-full max-w-3xl mx-auto p-[40px] flex-1 pb-32">
          
          <ProgressStepper currentStep={1} variant="full" />

          <div className="mb-[32px] flex items-center justify-between">
            <div>
              <h2 className="text-[24px] font-semibold mb-1 text-auth-on-surface">Farmer Registration</h2>
              <p className="text-[16px] text-auth-on-surface-variant">Complete your profile with government verification to start selling on FarmFlow.</p>
            </div>
            <Link href="/auth/register" className="inline-flex items-center gap-1 text-auth-secondary text-[14px] hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Choose role
            </Link>
          </div>

          {/* Global error */}
          {state?.message && (
            <div className="mb-6 p-4 bg-error-container/20 border border-error/30 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-[20px] mt-0.5 flex-shrink-0">error</span>
              <p className="text-[15px] text-error font-medium">{state.message}</p>
            </div>
          )}

          <form action={formAction} className="space-y-[32px]">
            {/* Hidden fields */}
            <input type="hidden" name="crops" value={selectedCrops.join(',')} />
            <input type="hidden" name="idPhotoUrl" value={govIdUrl} />
            <input type="hidden" name="farmDocUrl" value={farmDocUrl} />
            
            {/* SECTION 1: Personal Information */}
            <div className="bg-white rounded-xl border border-auth-secondary-fixed p-[24px] shadow-sm">
              <div className="mb-[16px] pb-[8px] border-b border-auth-secondary-fixed">
                <h3 className="text-[20px] font-semibold text-auth-on-surface">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                <div className="space-y-1 col-span-1">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">Full Name *</label>
                  <input required name="name" type="text" placeholder="Juan Dela Cruz" autoComplete="name" className={`w-full text-[14px] rounded-lg border bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 transition-colors shadow-sm py-2 px-3 outline-none ${state?.errors?.name ? 'border-error focus:border-error bg-error-container/5' : 'border-auth-secondary-fixed focus:border-primary'}`} />
                  {state?.errors?.name && <p className="text-[11px] text-error mt-1">{state.errors.name[0]}</p>}
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">Phone Number *</label>
                  <input required name="phone" type="tel" placeholder="+63 900 000 0000" autoComplete="tel" className={`w-full text-[14px] rounded-lg border bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 transition-colors shadow-sm py-2 px-3 outline-none ${state?.errors?.phone ? 'border-error focus:border-error bg-error-container/5' : 'border-auth-secondary-fixed focus:border-primary'}`} />
                  {state?.errors?.phone && <p className="text-[11px] text-error mt-1">{state.errors.phone[0]}</p>}
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">Email Address *</label>
                  <input required name="email" type="email" placeholder="juan@example.com" autoComplete="email" className={`w-full text-[14px] rounded-lg border bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 transition-colors shadow-sm py-2 px-3 outline-none ${state?.errors?.email ? 'border-error focus:border-error bg-error-container/5' : 'border-auth-secondary-fixed focus:border-primary'}`} />
                  {state?.errors?.email && <p className="text-[11px] text-error mt-1">{state.errors.email[0]}</p>}
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">Password *</label>
                  <div className="relative">
                    <input 
                      required
                      name="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full text-[14px] rounded-lg border bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 transition-colors shadow-sm py-2 px-3 pr-10 outline-none ${state?.errors?.password ? 'border-error focus:border-error bg-error-container/5' : 'border-auth-secondary-fixed focus:border-primary'}`} 
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-auth-on-surface flex items-center">
                      <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  <PasswordStrengthBar password={password} />
                  {state?.errors?.password && <p className="text-[11px] text-error mt-1">{state.errors.password[0]}</p>}
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">Confirm Password *</label>
                  <div className="relative">
                    <input 
                      required
                      name="confirmPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full text-[14px] rounded-lg border bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 transition-colors shadow-sm py-2 px-3 pr-10 outline-none ${(!passwordsMatch && confirmPassword.length > 0) || (!passwordsMatch && state?.errors?.confirmPassword) ? 'border-error focus:border-error bg-error-container/5' : 'border-auth-secondary-fixed focus:border-primary'}`} 
                    />
                    {confirmPassword.length > 0 && (
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] ${passwordsMatch ? 'text-primary' : 'text-error'}`}>
                        {passwordsMatch ? 'check_circle' : 'cancel'}
                      </span>
                    )}
                  </div>
                  {(!passwordsMatch && confirmPassword.length > 0) ? (
                    <p className="text-[11px] text-error mt-1">Passwords do not match.</p>
                  ) : (!passwordsMatch && state?.errors?.confirmPassword) ? (
                    <p className="text-[11px] text-error mt-1">{state.errors.confirmPassword[0]}</p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* SECTION 2: Farm Details */}
            <div className="bg-white rounded-xl border border-auth-secondary-fixed p-[24px] shadow-sm">
              <div className="mb-[16px] pb-[8px] border-b border-auth-secondary-fixed">
                <h3 className="text-[20px] font-semibold text-auth-on-surface">Farm Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                <div className="space-y-1 md:col-span-2">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">Farm Name *</label>
                  <input required name="farmName" type="text" placeholder="Green Acres Farm" className={`w-full text-[14px] rounded-lg border bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 transition-colors shadow-sm py-2 px-3 outline-none ${state?.errors?.farmName ? 'border-error focus:border-error bg-error-container/5' : 'border-auth-secondary-fixed focus:border-primary'}`} />
                  {state?.errors?.farmName && <p className="text-[11px] text-error mt-1">{state.errors.farmName[0]}</p>}
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">Barangay *</label>
                  <select
                    required
                    name="barangay"
                    defaultValue=""
                    className={`w-full text-[14px] rounded-lg border bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 transition-colors shadow-sm py-2 px-3 outline-none ${
                      state?.errors?.barangay ? 'border-error focus:border-error bg-error-container/5' : 'border-auth-secondary-fixed focus:border-primary'
                    }`}
                  >
                    <option value="" disabled>Select Barangay</option>
                    {AGOO_BARANGAYS.map((brgy) => (
                      <option key={brgy} value={brgy}>{brgy}</option>
                    ))}
                  </select>
                  {state?.errors?.barangay && <p className="text-[11px] text-error mt-1">{state.errors.barangay[0]}</p>}
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">Land Area in Hectares *</label>
                  <input required name="landArea" type="number" step="0.1" placeholder="0.0" className={`w-full text-[14px] rounded-lg border bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 transition-colors shadow-sm py-2 px-3 outline-none ${state?.errors?.landArea ? 'border-error focus:border-error bg-error-container/5' : 'border-auth-secondary-fixed focus:border-primary'}`} />
                  {state?.errors?.landArea && <p className="text-[11px] text-error mt-1">{state.errors.landArea[0]}</p>}
                </div>
                <div className="space-y-1 md:col-span-2 mt-[8px]">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">PRIMARY CROPS *</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cropOptions.map(crop => {
                      const isSelected = selectedCrops.includes(crop);
                      return (
                        <button
                          key={crop}
                          type="button"
                          onClick={() => toggleCrop(crop)}
                          className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${isSelected ? 'bg-primary text-on-primary shadow-sm' : 'bg-auth-surface-container-low border border-outline-variant text-auth-on-surface hover:bg-auth-surface-container-high'}`}
                        >
                          {crop}
                        </button>
                      );
                    })}
                  </div>
                  {state?.errors?.crops && <p className="text-[11px] text-error mt-1">{state.errors.crops[0]}</p>}
                </div>
              </div>
            </div>

            {/* SECTION 3: Identity & Farm Verification Documents (MANDATORY) */}
            <div className="bg-white rounded-xl border border-auth-secondary-fixed p-[24px] shadow-sm">
              <div className="mb-[16px] pb-[8px] border-b border-auth-secondary-fixed flex items-center justify-between">
                <div>
                  <h3 className="text-[20px] font-semibold text-auth-on-surface">Identity & Farm Verification</h3>
                  <p className="text-xs text-auth-on-surface-variant mt-0.5">Real ID verification is strictly mandatory for all producers on FarmFlow.</p>
                </div>
                <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                  Mandatory
                </span>
              </div>

              <div className="bg-[#FFF8E1] border border-[#FFECB3] rounded-lg p-[16px] flex items-start gap-[16px] mb-[24px]">
                <span className="material-symbols-outlined text-[#FF8F00] mt-0.5">verified_user</span>
                <p className="text-[14px] text-[#5D4037] leading-relaxed">
                  To ensure consumer safety, fair pricing, and platform integrity, our Local Government Unit (LGU) and Agriculture Office verify all farmer credentials before product listings go live.
                </p>
              </div>

              {/* ID Type & Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-6">
                <div className="space-y-1">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">ID Type (Required) *</label>
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

                <div className="space-y-1">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">ID Number / Reference (Required) *</label>
                  <input
                    required
                    name="idNumber"
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="e.g., 1234-5678-9012 or RSBSA-01-23"
                    className="w-full text-[14px] rounded-lg border border-auth-secondary-fixed bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors shadow-sm py-2 px-3 outline-none"
                  />
                  {state?.errors?.idNumber && <p className="text-[11px] text-error mt-1">{state.errors.idNumber[0]}</p>}
                </div>
              </div>

              {/* Upload Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                
                {/* File Upload 1: Valid Government ID (Required) */}
                <div>
                  <div className="flex items-center justify-between mb-[8px]">
                    <span className="font-auth-label-caps text-auth-on-surface font-semibold text-sm">
                      Valid Government ID (Required) *
                    </span>
                    {govIdUrl && (
                      <span className="text-xs text-primary font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Verified
                      </span>
                    )}
                  </div>
                  
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
                      className={`border-2 border-dashed rounded-xl p-[24px] flex flex-col items-center justify-center text-center transition-colors cursor-pointer group bg-auth-surface ${
                        state?.errors?.idPhotoUrl ? 'border-error bg-error/5' : 'border-outline-variant hover:border-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-outline text-3xl mb-[8px] group-hover:text-primary">badge</span>
                      <span className="text-auth-on-surface font-medium text-[14px]">Upload {idType}</span>
                      <span className="text-outline text-[12px] mt-1">JPG, PNG, WebP or PDF (Max 5MB)</span>
                      <span className="mt-3 px-4 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold text-xs group-hover:bg-primary group-hover:text-white transition-colors">
                        Choose Document
                      </span>
                    </label>
                  ) : (
                    <div className="bg-auth-surface-container-low border-2 border-primary rounded-xl p-[16px] flex flex-col gap-3">
                      <div className="flex items-center gap-[12px]">
                        <span className="material-symbols-outlined text-primary text-2xl">
                          {govIdFile?.type === 'application/pdf' ? 'picture_as_pdf' : 'badge'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[14px] font-medium text-auth-on-surface truncate">{govIdFile?.name || 'Government ID'}</div>
                          <div className="text-[12px] text-auth-secondary">
                            {govIdFile ? `${(govIdFile.size / 1024 / 1024).toFixed(2)} MB • ` : ''}
                            {isUploadingGovId ? 'Uploading...' : 'Uploaded'}
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
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>

                      {/* Image Thumbnail Preview */}
                      {govIdPreview && (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-outline-variant/40 bg-surface">
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

                {/* File Upload 2: Proof of Farm Ownership or LGU Endorsement */}
                <div>
                  <div className="flex items-center justify-between mb-[8px]">
                    <span className="font-auth-label-caps text-auth-on-surface font-semibold text-sm">
                      Proof of Farm / RSBSA Certificate
                    </span>
                    {farmDocUrl && (
                      <span className="text-xs text-primary font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Attached
                      </span>
                    )}
                  </div>

                  <input 
                    type="file" 
                    id="farmDoc" 
                    className="hidden" 
                    accept=".jpg,.jpeg,.png,.webp,.pdf" 
                    onChange={handleFarmDocUpload}
                    disabled={isUploadingFarmDoc}
                  />

                  {!farmDocFile && !farmDocUrl ? (
                    <label htmlFor="farmDoc" className="border-2 border-dashed border-outline-variant rounded-xl p-[24px] flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer bg-auth-surface group">
                      <span className="material-symbols-outlined text-outline text-3xl mb-[8px] group-hover:text-primary">description</span>
                      <span className="text-auth-on-surface font-medium text-[14px]">Land Title, Tax Dec, or RSBSA</span>
                      <span className="text-outline text-[12px] mt-1">JPG, PNG, WebP or PDF (Max 5MB)</span>
                      <span className="mt-3 px-4 py-1.5 rounded-lg bg-surface-variant text-on-surface-variant font-semibold text-xs group-hover:bg-primary group-hover:text-white transition-colors">
                        Attach Certificate
                      </span>
                    </label>
                  ) : (
                    <div className="bg-auth-surface-container-low border-2 border-primary rounded-xl p-[16px] flex flex-col gap-3">
                      <div className="flex items-center gap-[12px]">
                        <span className="material-symbols-outlined text-primary text-2xl">
                          {farmDocFile?.type === 'application/pdf' ? 'picture_as_pdf' : 'description'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[14px] font-medium text-auth-on-surface truncate">{farmDocFile?.name || 'Certificate'}</div>
                          <div className="text-[12px] text-auth-secondary">
                            {farmDocFile ? `${(farmDocFile.size / 1024 / 1024).toFixed(2)} MB • ` : ''}
                            {isUploadingFarmDoc ? 'Uploading...' : 'Uploaded'}
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            setFarmDocFile(null);
                            setFarmDocUrl('');
                            setFarmDocPreview('');
                          }} 
                          className="text-auth-secondary hover:text-error p-1"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>

                      {farmDocPreview && (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-outline-variant/40 bg-surface">
                          <Image src={farmDocPreview} alt="Doc Preview" fill className="object-contain" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* TERMS & SUBMIT */}
            <div>
              <div className="flex items-start gap-[8px] pt-[8px] mb-[24px]">
                <input type="checkbox" required className="rounded border-outline-variant text-primary focus:ring-primary/20 bg-white mt-1 w-4 h-4 cursor-pointer" />
                <label className="text-[14px] text-auth-on-surface-variant">
                  I confirm that the submitted identity and agricultural documents are genuine and accurate, and I agree to the FarmFlow Terms of Service and Verification Policy.
                </label>
              </div>

              {!govIdUrl && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  <span>Please upload your Valid Government ID above before proceeding with registration.</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-primary text-on-primary py-4 rounded-xl text-[18px] font-semibold flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    Submitting Registration...
                  </>
                ) : isUploadingGovId || isUploadingFarmDoc ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">cloud_upload</span>
                    Uploading Verification Documents...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                    Submit for Official LGU Verification
                  </>
                )}
              </button>
              
              <div className="text-center text-[14px] text-auth-secondary pt-[24px]">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary font-medium hover:underline">Log in</Link>
              </div>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
