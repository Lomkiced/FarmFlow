'use client';

import { useState, useTransition } from 'react';
import { updateFarmProfileAction } from '@/app/actions/farm';

export default function EditProfileModal({ farmProfile }: { farmProfile: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateFarmProfileAction(undefined as any, formData);
      if (result.success) {
        setSuccessMsg(result.message || 'Profile updated successfully!');
        setTimeout(() => setIsOpen(false), 1500);
      } else {
        setErrorMsg(result.error || 'Failed to update profile.');
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="mb-2 bg-secondary-container text-on-secondary-container text-[14px] font-medium px-4 py-2 rounded-lg hover:bg-secondary-fixed transition-colors border border-outline-variant"
      >
        Edit Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-[24px] font-bold text-on-surface mb-4">Edit Farm Profile</h2>
            
            {errorMsg && <div className="text-error bg-error-container p-3 rounded-lg mb-4 text-sm">{errorMsg}</div>}
            {successMsg && <div className="text-primary bg-primary-container p-3 rounded-lg mb-4 text-sm">{successMsg}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Farm Name</label>
                <input name="farmName" defaultValue={farmProfile.farmName} required className="w-full bg-surface-variant text-on-surface p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Barangay</label>
                <input name="barangay" defaultValue={farmProfile.barangay} required className="w-full bg-surface-variant text-on-surface p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Municipality</label>
                  <input name="municipality" defaultValue={farmProfile.municipality} required className="w-full bg-surface-variant text-on-surface p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Province</label>
                  <input name="province" defaultValue={farmProfile.province} required className="w-full bg-surface-variant text-on-surface p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Land Area (Hectares)</label>
                <input name="landArea" type="number" step="0.01" defaultValue={farmProfile.landArea} required className="w-full bg-surface-variant text-on-surface p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Bio / Description</label>
                <textarea name="bio" defaultValue={farmProfile.bio || ''} className="w-full bg-surface-variant text-on-surface p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[100px]" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-variant">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-on-surface-variant font-medium hover:bg-surface-variant rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="px-5 py-2.5 bg-primary text-on-primary font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isPending && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
