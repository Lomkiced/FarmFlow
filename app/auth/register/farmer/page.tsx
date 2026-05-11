'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import AuthLeftPanel from '@/components/auth/AuthLeftPanel';
import ProgressStepper from '@/components/auth/ProgressStepper';
import { registerFarmerAction, type AuthActionState } from '@/app/actions/auth';
import PasswordStrengthBar from '@/components/auth/PasswordStrengthBar';

export default function FarmerRegisterPage() {
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Vegetables']);
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [farmDocFile, setFarmDocFile] = useState<File | null>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  return (
    <div className="flex min-h-screen bg-auth-background">
      <AuthLeftPanel variant="farmer" widthClass="w-1/3" />

      <div className="w-full lg:w-2/3 flex flex-col h-screen overflow-y-auto bg-auth-surface">
        <div className="w-full max-w-3xl mx-auto p-[40px] flex-1 pb-32">
          
          <ProgressStepper currentStep={1} variant="full" />

          <div className="mb-[32px] flex items-center justify-between">
            <div>
              <h2 className="text-[24px] font-semibold mb-1 text-auth-on-surface">Farmer Registration</h2>
              <p className="text-[16px] text-auth-on-surface-variant">Complete your profile to start selling on FarmFlow.</p>
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
            {/* Hidden field for selected crops */}
            <input type="hidden" name="crops" value={selectedCrops.join(',')} />
            
            {/* SECTION 1: Personal Information */}
            <div className="bg-white rounded-xl border border-auth-secondary-fixed p-[24px] shadow-sm">
              <div className="mb-[16px] pb-[8px] border-b border-auth-secondary-fixed">
                <h3 className="text-[20px] font-semibold text-auth-on-surface">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                <div className="space-y-1 col-span-1">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">Full Name</label>
                  <input name="name" type="text" placeholder="Juan Dela Cruz" autoComplete="name" className={`w-full text-[14px] rounded-lg border bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 transition-colors shadow-sm py-2 px-3 outline-none ${state?.errors?.name ? 'border-error focus:border-error bg-error-container/5' : 'border-auth-secondary-fixed focus:border-primary'}`} />
                  {state?.errors?.name && <p className="text-[11px] text-error mt-1">{state.errors.name[0]}</p>}
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">Phone Number</label>
                  <input name="phone" type="tel" placeholder="+63 900 000 0000" autoComplete="tel" className={`w-full text-[14px] rounded-lg border bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 transition-colors shadow-sm py-2 px-3 outline-none ${state?.errors?.phone ? 'border-error focus:border-error bg-error-container/5' : 'border-auth-secondary-fixed focus:border-primary'}`} />
                  {state?.errors?.phone && <p className="text-[11px] text-error mt-1">{state.errors.phone[0]}</p>}
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">Email Address</label>
                  <input name="email" type="email" placeholder="juan@example.com" autoComplete="email" className={`w-full text-[14px] rounded-lg border bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 transition-colors shadow-sm py-2 px-3 outline-none ${state?.errors?.email ? 'border-error focus:border-error bg-error-container/5' : 'border-auth-secondary-fixed focus:border-primary'}`} />
                  {state?.errors?.email && <p className="text-[11px] text-error mt-1">{state.errors.email[0]}</p>}
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">Password</label>
                  <div className="relative">
                    <input 
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
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">Confirm Password</label>
                  <div className="relative">
                    <input 
                      name="confirmPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full text-[14px] rounded-lg border bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 transition-colors shadow-sm py-2 px-3 pr-10 outline-none ${!passwordsMatch && confirmPassword.length > 0 ? 'border-error focus:border-error bg-error-container/5' : 'border-auth-secondary-fixed focus:border-primary'}`} 
                    />
                    {confirmPassword.length > 0 && (
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] ${passwordsMatch ? 'text-primary' : 'text-error'}`}>
                        {passwordsMatch ? 'check_circle' : 'cancel'}
                      </span>
                    )}
                  </div>
                  {!passwordsMatch && confirmPassword.length > 0 && <p className="text-[11px] text-error mt-1">Passwords do not match.</p>}
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
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">Farm Name</label>
                  <input name="farmName" type="text" placeholder="Green Acres Farm" className={`w-full text-[14px] rounded-lg border bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 transition-colors shadow-sm py-2 px-3 outline-none ${state?.errors?.farmName ? 'border-error focus:border-error bg-error-container/5' : 'border-auth-secondary-fixed focus:border-primary'}`} />
                  {state?.errors?.farmName && <p className="text-[11px] text-error mt-1">{state.errors.farmName[0]}</p>}
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">Barangay</label>
                  <select name="barangay" className={`w-full text-[14px] rounded-lg border bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 transition-colors shadow-sm py-2 px-3 outline-none ${state?.errors?.barangay ? 'border-error focus:border-error bg-error-container/5' : 'border-auth-secondary-fixed focus:border-primary'}`}>
                    <option value="">Select Barangay</option>
                    <option value="San Nicolas">San Nicolas</option>
                    <option value="San Julian">San Julian</option>
                    <option value="Santo Rosario">Santo Rosario</option>
                    <option value="San Vicente">San Vicente</option>
                    <option value="San Roque">San Roque</option>
                    <option value="Consolacion">Consolacion</option>
                  </select>
                  {state?.errors?.barangay && <p className="text-[11px] text-error mt-1">{state.errors.barangay[0]}</p>}
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">Land Area in Hectares</label>
                  <input name="landArea" type="number" step="0.1" placeholder="0.0" className={`w-full text-[14px] rounded-lg border bg-white text-auth-on-surface focus:ring-2 focus:ring-primary/20 transition-colors shadow-sm py-2 px-3 outline-none ${state?.errors?.landArea ? 'border-error focus:border-error bg-error-container/5' : 'border-auth-secondary-fixed focus:border-primary'}`} />
                  {state?.errors?.landArea && <p className="text-[11px] text-error mt-1">{state.errors.landArea[0]}</p>}
                </div>
                <div className="space-y-1 md:col-span-2 mt-[8px]">
                  <label className="font-auth-label-caps text-auth-on-surface-variant uppercase">PRIMARY CROPS</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cropOptions.map(crop => {
                      const isSelected = selectedCrops.includes(crop);
                      return (
                        <button
                          key={crop}
                          type="button"
                          onClick={() => toggleCrop(crop)}
                          className={`px-2 py-1 rounded-full text-[13px] transition-colors ${isSelected ? 'bg-primary-container text-on-primary-container border border-primary-container' : 'bg-auth-surface-container-low border border-outline-variant text-auth-on-surface hover:bg-auth-surface-container-high'}`}
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

            {/* SECTION 3: Verification Documents */}
            <div className="bg-white rounded-xl border border-auth-secondary-fixed p-[24px] shadow-sm">
              <div className="mb-[16px] pb-[8px] border-b border-auth-secondary-fixed">
                <h3 className="text-[20px] font-semibold text-auth-on-surface">Verification Documents</h3>
              </div>

              <div className="bg-[#FFF8E1] border border-[#FFECB3] rounded-lg p-[16px] flex items-start gap-[16px] mb-[24px]">
                <span className="material-symbols-outlined text-[#FF8F00]">info</span>
                <p className="text-[14px] text-[#5D4037]">
                  Your documents will be reviewed by the Local Government Unit (LGU) before your account is fully activated. This ensures the integrity of the FarmFlow marketplace.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                
                {/* File Upload 1 */}
                <div>
                  <span className="font-auth-label-caps text-auth-on-surface-variant block mb-[8px]">Government ID (Optional for dev)</span>
                  <input type="file" id="govId" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileUpload(e, setGovIdFile)} />
                  {!govIdFile ? (
                    <label htmlFor="govId" className="border-2 border-dashed border-outline-variant rounded-xl p-[24px] flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer bg-auth-surface group">
                      <span className="material-symbols-outlined text-outline text-3xl mb-[8px] group-hover:text-primary">upload_file</span>
                      <span className="text-auth-on-surface-variant group-hover:text-primary text-[14px]">JPG, PNG or PDF (Max 5MB)</span>
                      <span className="text-outline text-[13px] mt-1">Click to upload</span>
                    </label>
                  ) : (
                    <div className="bg-auth-surface-container-low border-2 border-primary rounded-xl p-[16px] flex items-center gap-[12px]">
                      <span className="material-symbols-outlined text-primary text-2xl">insert_drive_file</span>
                      <div>
                        <div className="text-[14px] font-medium text-auth-on-surface truncate max-w-[150px]">{govIdFile.name}</div>
                        <div className="text-[13px] text-auth-secondary">{(govIdFile.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                      <button type="button" onClick={() => setGovIdFile(null)} className="ml-auto text-auth-secondary hover:text-error flex">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* File Upload 2 */}
                <div>
                  <span className="font-auth-label-caps text-auth-on-surface-variant block mb-[8px]">Proof of Farm Ownership (Optional for dev)</span>
                  <input type="file" id="farmDoc" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileUpload(e, setFarmDocFile)} />
                  {!farmDocFile ? (
                    <label htmlFor="farmDoc" className="border-2 border-dashed border-outline-variant rounded-xl p-[24px] flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer bg-auth-surface group">
                      <span className="material-symbols-outlined text-outline text-3xl mb-[8px] group-hover:text-primary">upload_file</span>
                      <span className="text-auth-on-surface-variant group-hover:text-primary text-[14px]">JPG, PNG or PDF (Max 5MB)</span>
                      <span className="text-outline text-[13px] mt-1">Click to upload</span>
                    </label>
                  ) : (
                    <div className="bg-auth-surface-container-low border-2 border-primary rounded-xl p-[16px] flex items-center gap-[12px]">
                      <span className="material-symbols-outlined text-primary text-2xl">insert_drive_file</span>
                      <div>
                        <div className="text-[14px] font-medium text-auth-on-surface truncate max-w-[150px]">{farmDocFile.name}</div>
                        <div className="text-[13px] text-auth-secondary">{(farmDocFile.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                      <button type="button" onClick={() => setFarmDocFile(null)} className="ml-auto text-auth-secondary hover:text-error flex">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* TERMS & SUBMIT */}
            <div>
              <div className="flex items-start gap-[8px] pt-[16px] mb-[24px]">
                <input type="checkbox" required className="rounded border-outline-variant text-primary focus:ring-primary/20 bg-white mt-1 w-4 h-4" />
                <label className="text-[14px] text-auth-on-surface-variant">
                  I confirm that the information provided is accurate and I agree to the Terms of Service and Privacy Policy.
                </label>
              </div>

              <button 
                type="submit"
                disabled={isPending}
                className="w-full bg-primary text-on-primary py-4 rounded-xl text-[20px] font-semibold flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Submit for Review
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
