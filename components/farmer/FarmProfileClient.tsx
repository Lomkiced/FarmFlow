'use client';

import { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { logoutAction } from '@/app/actions/auth';
import { updateFarmerMediaAction } from '@/app/actions/farm';
import { uploadAvatar, uploadFarmCoverPhoto } from '@/app/actions/upload';
import { sanitizeProfileImageUrl } from '@/lib/constants/farm-media';
import { getKycIdSpec } from '@/lib/kyc-utils';
import { resolveCropImage } from '@/lib/constants/crop-images';
import { BlankAvatarSilhouette, CoverPhotoPlaceholder } from '@/components/ui/ProfileMediaPlaceholders';
import CropStageBadge from '@/components/farmer/CropStageBadge';
import EditProfileModal from '@/components/farmer/EditProfileModal';

type ProfileTab = 'overview' | 'products' | 'crops' | 'credentials';

type FarmProduct = {
  id: string;
  name: string;
  category: string;
  pricePerKg: number;
  stockKg: number;
  minOrderQty?: number | null;
  photos: string[];
  status: string;
  createdAt: Date | string;
};

type FarmCrop = {
  id: string;
  cropName: string;
  variety: string | null;
  datePlanted: Date | string;
  expectedHarvest: Date | string;
  areaSqm: number;
  stage: string;
  createdAt: Date | string;
};

type FarmActivity = {
  id: string;
  activityType: string;
  activityDate: Date | string;
  description: string | null;
  crop: { cropName: string } | null;
};

interface FarmProfileClientProps {
  farmProfile: any;
  products: FarmProduct[];
  crops: FarmCrop[];
  activities: FarmActivity[];
  stats: {
    activeCropsCount: number;
    totalProducts: number;
    readyForPayout: number;
    lifetimeTotalOrders: number;
  };
}

export default function FarmProfileClient({
  farmProfile,
  products,
  crops,
  activities,
  stats,
}: FarmProfileClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFocusField, setEditFocusField] = useState<'bio' | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(() =>
    sanitizeProfileImageUrl(farmProfile.user?.avatarUrl)
  );
  const [coverUrl, setCoverUrl] = useState<string | null>(() =>
    sanitizeProfileImageUrl(farmProfile.coverPhoto)
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [isLoggingOut, startLogout] = useTransition();

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const practices: string[] = Array.isArray(farmProfile.practices) ? farmProfile.practices : [];
  const cleanIdDocUrl = sanitizeProfileImageUrl(
    farmProfile.idDocumentUrl || farmProfile.idPhotoUrl
  );
  const cleanCertUrl = sanitizeProfileImageUrl(farmProfile.farmDocUrl);
  const kycIdSpec = farmProfile.idType ? getKycIdSpec(farmProfile.idType) : null;

  const activeListingsCount = products.filter((p) => p.status === 'ACTIVE').length;
  const joinedFormatted = new Date(farmProfile.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const handleQuickCoverUpload = async (file: File) => {
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
      toast.success('Cover photo saved.');
      router.refresh();
    } catch {
      toast.error('Unexpected error uploading cover photo.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleQuickAvatarUpload = async (file: File) => {
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
      toast.success('Profile picture saved.');
      router.refresh();
    } catch {
      toast.error('Unexpected error uploading profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const openEditProfile = (focus: 'bio' | null = null) => {
    setEditFocusField(focus);
    setIsEditModalOpen(true);
  };

  const statusBadgeClass =
    farmProfile.status === 'VERIFIED'
      ? 'bg-green-50 text-green-800 border border-green-200'
      : farmProfile.status === 'SUSPENDED'
      ? 'bg-red-50 text-red-700 border border-red-200'
      : 'bg-gray-100 text-gray-700 border border-gray-300';

  const getProductBadge = (status: string, stockKg: number) => {
    if (status === 'REMOVED') {
      return { label: 'Removed', cls: 'bg-red-50 text-red-700 border border-red-200' };
    }
    if (status === 'PENDING_REVIEW') {
      return { label: 'Pending Review', cls: 'bg-gray-100 text-gray-700 border border-gray-300' };
    }
    if (stockKg < 10) {
      return { label: 'Low Stock', cls: 'bg-gray-100 text-gray-700 border border-gray-300' };
    }
    return { label: 'Active', cls: 'bg-green-50 text-green-800 border border-green-200' };
  };

  const renderProductsGrid = () => {
    if (products.length === 0) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <h3 className="text-sm font-bold text-gray-900 mb-1">No Marketplace Products Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
            Publish your fresh harvest listings so retail and wholesale buyers across La Union can place orders.
          </p>
          <Link
            href="/farmer/products/new"
            className="h-10 px-4 inline-flex items-center justify-center rounded-lg bg-green-800 hover:bg-green-900 text-white text-sm font-medium transition-colors"
          >
            Add Your First Product
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((product) => {
          const badge = getProductBadge(product.status, product.stockKg);
          return (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col hover:border-green-800 transition-colors"
            >
              <div className="relative h-40 w-full bg-gray-100 border-b border-gray-100">
                <Image
                  src={product.photos[0] || '/images/crops/generic.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 360px"
                />
                <span
                  className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${badge.cls}`}
                >
                  {badge.label}
                </span>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                  <span className="text-[11px] text-gray-400 uppercase shrink-0">
                    {product.category}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-1 mb-4">
                  <div className="text-base font-bold text-green-800 tabular-nums">
                    ₱{product.pricePerKg.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    <span className="text-xs font-normal text-gray-500"> / kg</span>
                  </div>
                  <div className="text-xs text-gray-500 tabular-nums">
                    Stock: <strong className="text-gray-800">{product.stockKg} kg</strong>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-2">
                  <Link
                    href={`/farmer/products/${product.id}/edit`}
                    className="h-9 px-3.5 inline-flex items-center justify-center flex-1 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                  >
                    Edit Listing
                  </Link>
                  <Link
                    href={`/products/${product.id}`}
                    className="h-9 px-3.5 inline-flex items-center justify-center flex-1 rounded-lg bg-green-800 hover:bg-green-900 text-white text-xs font-medium transition-colors"
                  >
                    View in Store
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCropsGrid = () => {
    if (crops.length === 0) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <h3 className="text-sm font-bold text-gray-900 mb-1">No Crops Tracked Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
            Register planted crop batches to monitor growth stages and forecast expected harvest dates.
          </p>
          <Link
            href="/farmer/crops"
            className="h-10 px-4 inline-flex items-center justify-center rounded-lg bg-green-800 hover:bg-green-900 text-white text-sm font-medium transition-colors"
          >
            Go to Crop Tracker
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {crops.map((crop) => {
          const planted = new Date(crop.datePlanted).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const expected = new Date(crop.expectedHarvest).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const estimatedYieldKg = Math.max(25, Math.round((crop.areaSqm || 50) * 2.5));
          const listHarvestUrl = `/farmer/products/new?cropId=${encodeURIComponent(
            crop.id
          )}&cropName=${encodeURIComponent(crop.cropName)}&variety=${encodeURIComponent(
            crop.variety || ''
          )}&qty=${estimatedYieldKg}`;

          return (
            <div
              key={crop.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col hover:border-green-800 transition-colors"
            >
              <div className="relative h-36 w-full bg-gray-100 border-b border-gray-100">
                <Image
                  src={resolveCropImage(crop.cropName, crop.variety)}
                  alt={crop.cropName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 360px"
                />
                <div className="absolute top-3 left-3">
                  <CropStageBadge stage={crop.stage.toLowerCase()} />
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-bold text-gray-900">{crop.cropName}</h3>
                <p className="text-xs text-gray-500 mb-3">{crop.variety || 'Standard Variety'}</p>

                <div className="space-y-1.5 text-xs border-t border-gray-100 pt-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Planted</span>
                    <span className="font-medium text-gray-900 tabular-nums">{planted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expected Harvest</span>
                    <span className="font-medium text-gray-900 tabular-nums">
                      {crop.stage === 'HARVESTED' ? 'Harvested' : expected}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plot Area</span>
                    <span className="font-medium text-gray-900 tabular-nums">{crop.areaSqm} sqm</span>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-2">
                  <Link
                    href={listHarvestUrl}
                    className="h-9 px-3.5 inline-flex items-center justify-center flex-1 rounded-lg bg-green-800 hover:bg-green-900 text-white text-xs font-medium transition-colors"
                  >
                    List Harvest
                  </Link>
                  <Link
                    href={`/farmer/crops/${crop.id}`}
                    className="h-9 px-3.5 inline-flex items-center justify-center flex-1 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                  >
                    Manage Crop
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCredentialsSection = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-gray-200 mb-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              RSBSA &amp; Government Identity Verification
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Registered KYC details validated by the Municipal Agriculture Office.
            </p>
          </div>
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded ${
              farmProfile.idVerifiedMatch
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            {farmProfile.idVerifiedMatch
              ? `KYC Match ${farmProfile.idMatchScore || 100}%`
              : 'Verification Pending'}
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
            <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              RSBSA Number
            </dt>
            <dd className="text-sm font-semibold text-gray-900 font-mono tabular-nums mt-1">
              {farmProfile.rsbsaNumber || 'Not specified'}
            </dd>
          </div>
          <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
            <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Submitted ID Type
            </dt>
            <dd className="text-sm font-semibold text-gray-900 mt-1">
              {kycIdSpec ? kycIdSpec.label : farmProfile.idType || 'Not specified'}
            </dd>
          </div>
          <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
            <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              ID Number
            </dt>
            <dd className="text-sm font-semibold text-gray-900 font-mono tabular-nums mt-1">
              {farmProfile.idNumber || 'Not specified'}
            </dd>
          </div>
          <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
            <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Name on ID Document
            </dt>
            <dd className="text-sm font-semibold text-gray-900 mt-1">
              {farmProfile.idNameOnDocument || farmProfile.user?.name || 'Not specified'}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Government / RSBSA ID Document
          </h4>
          {cleanIdDocUrl ? (
            <div className="relative h-48 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <Image
                src={cleanIdDocUrl}
                alt="Uploaded Government ID Document"
                fill
                className="object-contain"
                sizes="400px"
              />
            </div>
          ) : (
            <div className="h-48 w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
              No ID document image uploaded
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Farm Ownership / Barangay Certificate
          </h4>
          {cleanCertUrl ? (
            <div className="relative h-48 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <Image
                src={cleanCertUrl}
                alt="Farm Certificate Document"
                fill
                className="object-contain"
                sizes="400px"
              />
            </div>
          ) : (
            <div className="h-48 w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
              No certificate image uploaded
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Hidden quick media inputs */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleQuickCoverUpload(f);
          e.target.value = '';
        }}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleQuickAvatarUpload(f);
          e.target.value = '';
        }}
      />

      {/* TOP FACEBOOK-STYLE PROFILE HEADER CARD */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        {/* Zone A — Cover Photo Banner */}
        <div className="relative h-52 sm:h-68 w-full bg-gray-100 border-b border-gray-200">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={`${farmProfile.farmName} cover photo`}
              fill
              className="object-cover w-full h-full"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          ) : (
            <CoverPhotoPlaceholder label="No cover photo" />
          )}

          <button
            type="button"
            disabled={uploadingCover}
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-4 right-4 sm:right-6 z-10 h-9 px-3.5 inline-flex items-center justify-center rounded-lg bg-white/95 hover:bg-white text-gray-800 border border-gray-300 text-xs font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {uploadingCover ? 'Uploading...' : coverUrl ? 'Edit Cover Photo' : 'Add Cover Photo'}
          </button>
        </div>

        {/* Zone B — Overlapping Avatar, Identity Block & Aligned Action Buttons */}
        <div className="px-6 sm:px-8 pb-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            {/* Left Side: Avatar + Farm/Farmer Identity */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              {/* Avatar Wrapper */}
              <div className="relative -mt-16 sm:-mt-20 w-32 h-32 sm:w-36 sm:h-36 rounded-full ring-4 ring-white bg-gray-200 shrink-0 overflow-visible">
                <div className="w-full h-full rounded-full overflow-hidden border border-gray-200 bg-gray-200 relative">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={farmProfile.farmName}
                      fill
                      className="object-cover"
                      sizes="144px"
                    />
                  ) : (
                    <BlankAvatarSilhouette />
                  )}
                </div>
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-1 right-1 h-8 px-2.5 rounded-full bg-white border border-gray-300 text-[11px] font-medium text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {uploadingAvatar ? '...' : 'Photo'}
                </button>
              </div>

              {/* Identity Text Block */}
              <div className="pt-1 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    {farmProfile.farmName}
                  </h1>
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded ${statusBadgeClass}`}
                  >
                    {farmProfile.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-600 mt-1">
                  {farmProfile.user?.name || 'Farmer'} • Farm Owner
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 tabular-nums">
                  {farmProfile.barangay ? `Brgy. ${farmProfile.barangay}, ` : ''}
                  {farmProfile.municipality || 'Agoo'}, {farmProfile.province || 'La Union'} •{' '}
                  {farmProfile.landArea} Hectares
                </p>
              </div>
            </div>

            {/* Right Side — Action Buttons Toolbar (Pixel-Perfect Uniform Alignment) */}
            <div className="flex flex-wrap items-center gap-2.5 lg:pb-1 shrink-0">
              <button
                type="button"
                onClick={() => openEditProfile(null)}
                className="h-10 px-4 inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-900 transition-colors cursor-pointer"
              >
                Edit Profile
              </button>
              <Link
                href="/farmer/products/new"
                className="h-10 px-4 inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Add Product
              </Link>
              <Link
                href={`/farmers/${farmProfile.id}`}
                className="h-10 px-4 inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                View Public Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Zone C — Facebook-Style Profile Navigation Tabs */}
        <div className="border-t border-gray-200 px-6 sm:px-8 flex items-center gap-1 overflow-x-auto bg-white">
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'products', label: `Products (${products.length})` },
              { id: 'crops', label: `Crops (${crops.length})` },
              { id: 'credentials', label: 'Credentials & KYC' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`h-12 px-4 inline-flex items-center justify-center text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-green-800 text-green-800 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* BELOW-THE-FOLD 2-COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Facebook "Intro" Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Card 1: Intro / About Farm */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-gray-900">Intro</h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              {farmProfile.bio ? farmProfile.bio : <span className="text-gray-400">No farm bio added yet.</span>}
            </p>
            <button
              type="button"
              onClick={() => openEditProfile('bio')}
              className="h-9 mt-3 w-full inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Edit Bio
            </button>

            <dl className="divide-y divide-gray-100 mt-4 text-sm">
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-gray-500">Location</dt>
                <dd className="text-gray-900 font-medium text-right">
                  {farmProfile.barangay ? `${farmProfile.barangay}, ` : ''}
                  {farmProfile.municipality || 'Agoo'}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-gray-500">Land Area</dt>
                <dd className="text-gray-900 font-medium tabular-nums">{farmProfile.landArea} ha</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-gray-900 font-medium tabular-nums">
                  {farmProfile.user?.phone || 'Not specified'}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900 font-medium truncate max-w-[190px]">
                  {farmProfile.user?.email || 'Not specified'}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-gray-500">Joined</dt>
                <dd className="text-gray-900 font-medium tabular-nums">{joinedFormatted}</dd>
              </div>
            </dl>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Farming Practices
              </p>
              {practices.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {practices.map((practice) => (
                    <span
                      key={practice}
                      className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded border border-gray-200"
                    >
                      {practice}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No farming practices specified.</p>
              )}
            </div>
          </div>

          {/* Card 2: RSBSA & KYC Verification Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">RSBSA &amp; KYC</h2>
              <button
                type="button"
                onClick={() => setActiveTab('credentials')}
                className="text-xs font-medium text-green-800 hover:underline cursor-pointer"
              >
                Full Details
              </button>
            </div>
            <dl className="divide-y divide-gray-100 text-xs">
              <div className="py-2.5 flex justify-between gap-3">
                <dt className="text-gray-500">RSBSA Number</dt>
                <dd className="font-mono font-semibold text-gray-900 tabular-nums">
                  {farmProfile.rsbsaNumber || 'Not registered'}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-3">
                <dt className="text-gray-500">ID Type</dt>
                <dd className="font-medium text-gray-900 text-right">
                  {kycIdSpec ? kycIdSpec.shortLabel : farmProfile.idType || 'Not provided'}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-3">
                <dt className="text-gray-500">Status</dt>
                <dd className="font-semibold text-green-800">{farmProfile.status}</dd>
              </div>
            </dl>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Farm Certificate
              </p>
              {cleanCertUrl ? (
                <div className="relative h-28 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <Image
                    src={cleanCertUrl}
                    alt="Farm Certificate"
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                </div>
              ) : (
                <p className="text-xs text-gray-400">No certificate image uploaded.</p>
              )}
            </div>
          </div>

          {/* Mobile Sign Out Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => startLogout(async () => logoutAction())}
              disabled={isLoggingOut}
              className="w-full h-10 rounded-lg border border-red-300 bg-white text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </aside>

        {/* Right Column: Main Profile Feed */}
        <div className="lg:col-span-8 space-y-6">
          {/* KPI Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Active Listings
              </p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums mt-1">
                {activeListingsCount}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Crops Tracked
              </p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums mt-1">
                {crops.length}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Land Area (ha)
              </p>
              <p className="text-2xl font-bold text-green-800 tabular-nums mt-1">
                {farmProfile.landArea}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Account Status
              </p>
              <p className="text-sm font-bold text-green-800 uppercase tracking-wider mt-2.5">
                {farmProfile.status}
              </p>
            </div>
          </div>

          {/* Tab Content Area */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  Marketplace Harvests ({products.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="text-xs font-semibold text-green-800 hover:underline cursor-pointer"
                >
                  View All Listings →
                </button>
              </div>
              {renderProductsGrid()}

              {activities.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Recent Farm Activity
                    </h3>
                    <Link
                      href="/farmer/activities"
                      className="text-xs font-semibold text-green-800 hover:underline"
                    >
                      Activity Log →
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {activities.slice(0, 5).map((act) => (
                      <div key={act.id} className="py-3 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-900 capitalize">
                            {act.activityType.toLowerCase().replace(/_/g, ' ')}
                          </p>
                          {act.crop && (
                            <p className="text-[11px] text-green-800 font-medium mt-0.5">
                              {act.crop.cropName}
                            </p>
                          )}
                          {act.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{act.description}</p>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400 tabular-nums shrink-0">
                          {new Date(act.activityDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && renderProductsGrid()}
          {activeTab === 'crops' && renderCropsGrid()}
          {activeTab === 'credentials' && renderCredentialsSection()}
        </div>
      </div>

      {/* Controlled Edit Profile Modal */}
      <EditProfileModal
        farmProfile={farmProfile}
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        focusField={editFocusField}
        hideTrigger
      />
    </div>
  );
}
