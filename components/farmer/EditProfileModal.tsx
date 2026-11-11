'use client';

import { useState, useTransition, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { updateFarmProfileAction, updateFarmerMediaAction } from '@/app/actions/farm';
import { uploadAvatar, uploadFarmCoverPhoto } from '@/app/actions/upload';
import { AGOO_BARANGAYS, normalizeBarangayName } from '@/lib/constants/locations';
import { FARMING_PRACTICE_OPTIONS } from '@/lib/validations/farm';
import { sanitizeProfileImageUrl } from '@/lib/constants/farm-media';
import { BlankAvatarSilhouette, CoverPhotoPlaceholder } from '@/components/ui/ProfileMediaPlaceholders';

function splitFullName(fullName?: string | null): { firstName: string; lastName: string } {
  const clean = (fullName || '').trim();
  if (!clean) return { firstName: '', lastName: '' };
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  const lastName = parts.pop() || '';
  return { firstName: parts.join(' '), lastName };
}

interface EditProfileModalProps {
  farmProfile: any;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  focusField?: 'bio' | null;
  hideTrigger?: boolean;
}

export default function EditProfileModal({
  farmProfile,
  isOpen: controlledOpen,
  onOpenChange,
  focusField = null,
  hideTrigger = false,
}: EditProfileModalProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = (next: boolean) => {
    if (onOpenChange) onOpenChange(next);
    if (controlledOpen === undefined) setInternalOpen(next);
  };

  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Media preview & upload states
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() =>
    sanitizeProfileImageUrl(farmProfile.user?.avatarUrl)
  );
  const [coverUrl, setCoverUrl] = useState<string | null>(() =>
    sanitizeProfileImageUrl(farmProfile.coverPhoto)
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Practices state
  const [selectedPractices, setSelectedPractices] = useState<string[]>(() =>
    Array.isArray(farmProfile.practices) ? farmProfile.practices : []
  );

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);

  const isAnyUploading = uploadingAvatar || uploadingCover;
  const { firstName: defaultFirstName, lastName: defaultLastName } = splitFullName(
    farmProfile.user?.name
  );

  useEffect(() => {
    if (isOpen) {
      setAvatarUrl(sanitizeProfileImageUrl(farmProfile.user?.avatarUrl));
      setCoverUrl(sanitizeProfileImageUrl(farmProfile.coverPhoto));
      setSelectedPractices(Array.isArray(farmProfile.practices) ? farmProfile.practices : []);
      setErrorMsg('');
      setSuccessMsg('');

      if (focusField === 'bio') {
        setTimeout(() => {
          bioRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen, farmProfile, focusField]);

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      setUploadingAvatar(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        const uploadRes = await uploadAvatar(fd);
        if (!uploadRes.success) {
          toast.error(uploadRes.error || 'Failed to upload profile picture.');
          return;
        }
        const saveRes = await updateFarmerMediaAction({ avatarUrl: uploadRes.url });
        if (!saveRes.success) {
          toast.error(saveRes.error || 'Failed to save profile picture.');
          return;
        }
        setAvatarUrl(uploadRes.url);
        toast.success('Profile picture updated.');
        router.refresh();
      } catch {
        toast.error('Unexpected error uploading profile picture.');
      } finally {
        setUploadingAvatar(false);
      }
    },
    [router]
  );

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    try {
      const res = await updateFarmerMediaAction({ avatarUrl: null });
      if (res.success) {
        setAvatarUrl(null);
        toast.success('Profile picture removed.');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to remove profile picture.');
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = useCallback(
    async (file: File) => {
      setUploadingCover(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        const uploadRes = await uploadFarmCoverPhoto(fd);
        if (!uploadRes.success) {
          toast.error(uploadRes.error || 'Failed to upload cover photo.');
          return;
        }
        const saveRes = await updateFarmerMediaAction({ coverPhoto: uploadRes.url });
        if (!saveRes.success) {
          toast.error(saveRes.error || 'Failed to save cover photo.');
          return;
        }
        setCoverUrl(uploadRes.url);
        toast.success('Cover photo updated.');
        router.refresh();
      } catch {
        toast.error('Unexpected error uploading cover photo.');
      } finally {
        setUploadingCover(false);
      }
    },
    [router]
  );

  const handleRemoveCover = async () => {
    setUploadingCover(true);
    try {
      const res = await updateFarmerMediaAction({ coverPhoto: null });
      if (res.success) {
        setCoverUrl(null);
        toast.success('Cover photo removed.');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to remove cover photo.');
      }
    } finally {
      setUploadingCover(false);
    }
  };

  const togglePractice = (practice: string) => {
    setSelectedPractices((prev) =>
      prev.includes(practice) ? prev.filter((p) => p !== practice) : [...prev, practice]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateFarmProfileAction(undefined as any, formData);
      if (result.success) {
        setSuccessMsg(result.message || 'Profile updated successfully.');
        toast.success('Profile changes saved.');
        router.refresh();
        setTimeout(() => {
          setOpen(false);
        }, 600);
      } else {
        setErrorMsg(result.error || 'Failed to update profile.');
      }
    });
  };

  const handleClose = () => {
    if (isPending || isAnyUploading) return;
    setOpen(false);
  };

  return (
    <>
      {!hideTrigger && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-10 px-4 inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors cursor-pointer"
        >
          Edit Profile
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="bg-white border border-gray-200 rounded-t-xl sm:rounded-xl w-full sm:max-w-xl max-h-[92vh] overflow-y-auto relative shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Edit Farm Profile</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update your cover photo, avatar, owner details, and farming practices.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending || isAnyUploading}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Media Management Section */}
              <div className="space-y-4 pb-5 border-b border-gray-200">
                {/* Profile Picture Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-gray-200 bg-gray-200 overflow-hidden shrink-0">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BlankAvatarSilhouette />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Profile Picture</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {avatarUrl ? 'Uploaded photo active' : 'Default blank silhouette active'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleAvatarUpload(f);
                        e.target.value = '';
                      }}
                    />
                    <button
                      type="button"
                      disabled={isAnyUploading}
                      onClick={() => avatarInputRef.current?.click()}
                      className="h-9 px-3.5 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {uploadingAvatar ? 'Uploading...' : avatarUrl ? 'Change Picture' : 'Upload Photo'}
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        disabled={isAnyUploading}
                        onClick={handleRemoveAvatar}
                        className="h-9 px-3.5 inline-flex items-center justify-center rounded-lg border border-red-300 bg-white text-red-700 text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Remove Picture
                      </button>
                    )}
                  </div>
                </div>

                {/* Cover Photo Row */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-900">Cover Photo</p>
                    <div className="flex items-center gap-2">
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleCoverUpload(f);
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        disabled={isAnyUploading}
                        onClick={() => coverInputRef.current?.click()}
                        className="h-9 px-3.5 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {uploadingCover ? 'Uploading...' : coverUrl ? 'Change Cover' : 'Upload Cover'}
                      </button>
                      {coverUrl && (
                        <button
                          type="button"
                          disabled={isAnyUploading}
                          onClick={handleRemoveCover}
                          className="h-9 px-3.5 inline-flex items-center justify-center rounded-lg border border-red-300 bg-white text-red-700 text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Remove Cover Photo
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="h-28 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CoverPhotoPlaceholder label="No cover photo" />
                    )}
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="text-red-700 bg-red-50/60 border border-red-300 p-3 rounded-lg text-xs font-medium">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="text-green-800 bg-green-50 border border-green-200 p-3 rounded-lg text-xs font-medium">
                  {successMsg}
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="hidden" name="practices" value={JSON.stringify(selectedPractices)} />

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Farm Name
                  </label>
                  <input
                    name="farmName"
                    defaultValue={farmProfile.farmName}
                    required
                    className="w-full bg-white text-gray-900 text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-green-800 focus:ring-1 focus:ring-green-800 outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Farmer First Name
                    </label>
                    <input
                      name="firstName"
                      defaultValue={defaultFirstName}
                      required
                      className="w-full bg-white text-gray-900 text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-green-800 focus:ring-1 focus:ring-green-800 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Farmer Last Name
                    </label>
                    <input
                      name="lastName"
                      defaultValue={defaultLastName}
                      className="w-full bg-white text-gray-900 text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-green-800 focus:ring-1 focus:ring-green-800 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Contact Phone
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      defaultValue={farmProfile.user?.phone || ''}
                      placeholder="0917 123 4567"
                      className="w-full bg-white text-gray-900 text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-green-800 focus:ring-1 focus:ring-green-800 outline-none transition-colors tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Land Area (Hectares)
                    </label>
                    <input
                      name="landArea"
                      type="number"
                      step="0.01"
                      min="0.01"
                      defaultValue={farmProfile.landArea}
                      required
                      className="w-full bg-white text-gray-900 text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-green-800 focus:ring-1 focus:ring-green-800 outline-none transition-colors tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Barangay
                    </label>
                    <select
                      name="barangay"
                      defaultValue={normalizeBarangayName(farmProfile.barangay)}
                      required
                      className="w-full bg-white text-gray-900 text-xs px-3 py-2.5 rounded-lg border border-gray-300 focus:border-green-800 focus:ring-1 focus:ring-green-800 outline-none transition-colors cursor-pointer"
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
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Municipality
                    </label>
                    <input
                      name="municipality"
                      defaultValue={farmProfile.municipality || 'Agoo'}
                      required
                      className="w-full bg-gray-50 text-gray-700 text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-green-800 focus:ring-1 focus:ring-green-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Province
                    </label>
                    <input
                      name="province"
                      defaultValue={farmProfile.province || 'La Union'}
                      required
                      className="w-full bg-gray-50 text-gray-700 text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-green-800 focus:ring-1 focus:ring-green-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Farm Bio / Description
                  </label>
                  <textarea
                    ref={bioRef}
                    name="bio"
                    defaultValue={farmProfile.bio || ''}
                    placeholder="Tell buyers about your farm, harvest history, and quality standards..."
                    className="w-full bg-white text-gray-900 text-xs p-3 rounded-lg border border-gray-300 focus:border-green-800 focus:ring-1 focus:ring-green-800 outline-none transition-colors min-h-[96px] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Farming Practices
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FARMING_PRACTICE_OPTIONS.map((practice) => {
                      const active = selectedPractices.includes(practice);
                      return (
                        <button
                          key={practice}
                          type="button"
                          onClick={() => togglePractice(practice)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                            active
                              ? 'bg-green-800 text-white border-green-800'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {practice}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aligned Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isPending || isAnyUploading}
                    className="h-10 px-5 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || isAnyUploading}
                    className="h-10 px-5 inline-flex items-center justify-center rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
