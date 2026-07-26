'use client';

import { useState, useTransition, useRef, useCallback } from 'react';
import { updateFarmProfileAction, updateAvatarUrlAction, updateCoverPhotoUrlAction } from '@/app/actions/farm';
import { uploadAvatar, uploadFarmCoverPhoto } from '@/app/actions/upload';

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadState = {
  uploading: boolean;
  error: string | null;
  success: boolean;
};

const DEFAULT_UPLOAD_STATE: UploadState = { uploading: false, error: null, success: false };

// ─── Sub-component: Upload Button ─────────────────────────────────────────────

function UploadButton({
  id,
  accept,
  onChange,
  disabled,
  children,
  className,
}: {
  id: string;
  accept: string;
  onChange: (file: File) => void;
  disabled: boolean;
  children: React.ReactNode;
  className: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
          // Reset so same file can be re-selected
          e.target.value = '';
        }}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={disabled}
        className={className}
      >
        {children}
      </button>
    </>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function EditProfileModal({ farmProfile }: { farmProfile: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUpload, setAvatarUpload] = useState<UploadState>(DEFAULT_UPLOAD_STATE);

  // Cover photo state
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUpload, setCoverUpload] = useState<UploadState>(DEFAULT_UPLOAD_STATE);

  const isAnyUploading = avatarUpload.uploading || coverUpload.uploading;

  // ─── Avatar Upload ───────────────────────────────────────────────────────────

  const handleAvatarChange = useCallback(async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setAvatarUpload({ uploading: true, error: null, success: false });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResult = await uploadAvatar(formData);
      if (!uploadResult.success) {
        setAvatarUpload({ uploading: false, error: uploadResult.error, success: false });
        return;
      }

      const saveResult = await updateAvatarUrlAction(uploadResult.url);
      if (!saveResult.success) {
        setAvatarUpload({ uploading: false, error: saveResult.error || 'Failed to save avatar.', success: false });
        return;
      }

      setAvatarUpload({ uploading: false, error: null, success: true });
    } catch {
      setAvatarUpload({ uploading: false, error: 'Unexpected error. Please try again.', success: false });
    }
  }, []);

  // ─── Cover Photo Upload ──────────────────────────────────────────────────────

  const handleCoverChange = useCallback(async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
    setCoverUpload({ uploading: true, error: null, success: false });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResult = await uploadFarmCoverPhoto(formData);
      if (!uploadResult.success) {
        setCoverUpload({ uploading: false, error: uploadResult.error, success: false });
        return;
      }

      const saveResult = await updateCoverPhotoUrlAction(uploadResult.url);
      if (!saveResult.success) {
        setCoverUpload({ uploading: false, error: saveResult.error || 'Failed to save cover photo.', success: false });
        return;
      }

      setCoverUpload({ uploading: false, error: null, success: true });
    } catch {
      setCoverUpload({ uploading: false, error: 'Unexpected error. Please try again.', success: false });
    }
  }, []);

  // ─── Profile Form Submit ─────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateFarmProfileAction(undefined as any, formData);
      if (result.success) {
        setSuccessMsg(result.message || 'Profile updated successfully!');
        setTimeout(() => {
          setIsOpen(false);
          // Reset local previews
          setAvatarPreview(null);
          setCoverPreview(null);
          setAvatarUpload(DEFAULT_UPLOAD_STATE);
          setCoverUpload(DEFAULT_UPLOAD_STATE);
        }, 1500);
      } else {
        setErrorMsg(result.error || 'Failed to update profile.');
      }
    });
  };

  const handleClose = () => {
    if (isPending || isAnyUploading) return;
    setIsOpen(false);
    setAvatarPreview(null);
    setCoverPreview(null);
    setAvatarUpload(DEFAULT_UPLOAD_STATE);
    setCoverUpload(DEFAULT_UPLOAD_STATE);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const currentAvatarUrl = farmProfile.user?.avatarUrl;
  const currentCoverUrl = farmProfile.coverPhoto;
  const defaultCoverUrl = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80';
  const defaultAvatarUrl = 'https://i.pravatar.cc/150?img=12';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mb-2 bg-secondary-container text-on-secondary-container text-[14px] font-medium px-4 py-2 rounded-lg hover:bg-secondary-fixed transition-colors border border-outline-variant"
      >
        Edit Profile
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="bg-surface rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto relative shadow-level-2">
            
            {/* ── Image Upload Section ── */}
            <div className="relative">
              {/* Cover Photo */}
              <div
                className="h-36 w-full bg-cover bg-center relative group overflow-hidden rounded-t-3xl sm:rounded-t-2xl"
                style={{ backgroundImage: `url('${coverPreview || currentCoverUrl || defaultCoverUrl}')` }}
              >
                {/* Dark overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <UploadButton
                    id="cover-photo-upload"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverChange}
                    disabled={isAnyUploading}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 bg-black/70 text-white text-[13px] font-semibold px-4 py-2.5 rounded-full border border-white/30 hover:bg-black/90 disabled:cursor-not-allowed"
                  >
                    {coverUpload.uploading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                        Uploading...
                      </>
                    ) : coverUpload.success ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] text-green-400">check_circle</span>
                        Cover Saved!
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                        Change Cover Photo
                      </>
                    )}
                  </UploadButton>
                </div>

                {/* Always-visible pill for mobile */}
                <div className="absolute bottom-2 right-2 sm:hidden">
                  <UploadButton
                    id="cover-photo-upload-mobile"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverChange}
                    disabled={isAnyUploading}
                    className="flex items-center gap-1 bg-black/70 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-full border border-white/30"
                  >
                    {coverUpload.uploading ? (
                      <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
                    ) : coverUpload.success ? (
                      <span className="material-symbols-outlined text-[14px] text-green-400">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-[14px]">add_photo_alternate</span>
                    )}
                    {coverUpload.uploading ? 'Uploading...' : coverUpload.success ? 'Saved' : 'Cover'}
                  </UploadButton>
                </div>
              </div>

              {/* Avatar */}
              <div className="px-5 -mt-10 flex items-end justify-between">
                <div className="relative group">
                  <img
                    src={avatarPreview || currentAvatarUrl || defaultAvatarUrl}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full border-4 border-surface object-cover shadow-level-1 bg-surface-container"
                  />
                  {/* Avatar upload overlay */}
                  <UploadButton
                    id="avatar-upload"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    disabled={isAnyUploading}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/50 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed border-4 border-surface"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-0.5">
                      {avatarUpload.uploading ? (
                        <span className="material-symbols-outlined animate-spin text-white text-[22px]">progress_activity</span>
                      ) : avatarUpload.success ? (
                        <span className="material-symbols-outlined text-green-400 text-[22px]">check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-white text-[22px]">photo_camera</span>
                      )}
                    </div>
                  </UploadButton>

                  {/* Camera badge always visible */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-surface pointer-events-none">
                    <span className="material-symbols-outlined text-on-primary text-[13px]">photo_camera</span>
                  </div>
                </div>

                {/* Upload status pills */}
                <div className="mb-1 flex flex-col items-end gap-1">
                  {avatarUpload.error && (
                    <p className="text-[11px] text-error bg-error/10 px-2 py-0.5 rounded-full font-medium max-w-[160px] truncate">
                      {avatarUpload.error}
                    </p>
                  )}
                  {coverUpload.error && (
                    <p className="text-[11px] text-error bg-error/10 px-2 py-0.5 rounded-full font-medium max-w-[160px] truncate">
                      {coverUpload.error}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Form Section ── */}
            <div className="px-6 pb-6 pt-4">
              <h2 className="text-[22px] font-bold text-on-surface mb-1">Edit Farm Profile</h2>
              <p className="text-[13px] text-on-surface-variant mb-5">
                Tap the avatar or cover photo to change them.
              </p>

              {errorMsg && (
                <div className="text-error bg-error/10 border border-error/20 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="text-primary bg-primary/10 border border-primary/20 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Farm Name</label>
                  <input
                    name="farmName"
                    defaultValue={farmProfile.farmName}
                    required
                    className="w-full bg-surface-container text-on-surface p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Barangay</label>
                  <input
                    name="barangay"
                    defaultValue={farmProfile.barangay}
                    required
                    className="w-full bg-surface-container text-on-surface p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1.5">Municipality</label>
                    <input
                      name="municipality"
                      defaultValue={farmProfile.municipality}
                      required
                      className="w-full bg-surface-container text-on-surface p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-1.5">Province</label>
                    <input
                      name="province"
                      defaultValue={farmProfile.province}
                      required
                      className="w-full bg-surface-container text-on-surface p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Land Area (Hectares)</label>
                  <input
                    name="landArea"
                    type="number"
                    step="0.01"
                    min="0.01"
                    defaultValue={farmProfile.landArea}
                    required
                    className="w-full bg-surface-container text-on-surface p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Bio / Description</label>
                  <textarea
                    name="bio"
                    defaultValue={farmProfile.bio || ''}
                    placeholder="Tell buyers about your farm..."
                    className="w-full bg-surface-container text-on-surface p-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-surface-variant">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isPending || isAnyUploading}
                    className="px-5 py-2.5 text-on-surface-variant font-medium hover:bg-surface-variant rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || isAnyUploading}
                    className="px-5 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isPending && (
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    )}
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
