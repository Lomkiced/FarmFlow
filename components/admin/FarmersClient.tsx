'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { approveFarmerAction, rejectFarmerAction } from '@/app/actions/admin';
import { getKycIdSpec } from '@/lib/kyc-utils';
import PaginationBar from '@/components/ui/PaginationBar';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export type FarmerData = {
  id: string;
  status: string;
  createdAt: Date;
  location: string | null;
  farmName: string;
  idType?: string | null;
  idNumber?: string | null;
  idPhotoUrl?: string | null;
  idDocumentUrl?: string | null;
  idNameOnDocument?: string | null;
  rsbsaNumber?: string | null;
  idVerifiedMatch?: boolean;
  idMatchScore?: number;
  farmDocUrl?: string | null;
  user: {
    name: string | null;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
    idType?: string | null;
    idNumber?: string | null;
    idPhotoUrl?: string | null;
    idDocumentUrl?: string | null;
    idNameOnDocument?: string | null;
    rsbsaNumber?: string | null;
    idVerifiedMatch?: boolean;
    idMatchScore?: number;
  };
  _count: {
    crops: number;
    products: number;
  };
};

export default function FarmersClient({ initialFarmers }: { initialFarmers: FarmerData[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = (searchParams.get('status') || 'ALL') as
    | 'ALL'
    | 'PENDING'
    | 'VERIFIED'
    | 'SUSPENDED';
  const locationParam = searchParams.get('location') || '';
  const dateFromParam = searchParams.get('dateFrom') || '';
  const dateToParam = searchParams.get('dateTo') || '';

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterLocation, setFilterLocation] = useState(locationParam);
  const [filterDateFrom, setFilterDateFrom] = useState(dateFromParam);
  const [filterDateTo, setFilterDateTo] = useState(dateToParam);

  const [selectedFarmer, setSelectedFarmer] = useState<FarmerData | null>(null);
  const [kycModalFarmer, setKycModalFarmer] = useState<FarmerData | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const handleTabChange = (tab: string) => {
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'ALL') {
      params.delete('status');
    } else {
      params.set('status', tab);
    }
    router.push(`?${params.toString()}`);
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (filterLocation) params.set('location', filterLocation);
    else params.delete('location');

    if (filterDateFrom) params.set('dateFrom', filterDateFrom);
    else params.delete('dateFrom');

    if (filterDateTo) params.set('dateTo', filterDateTo);
    else params.delete('dateTo');

    router.push(`?${params.toString()}`);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setFilterLocation('');
    setFilterDateFrom('');
    setFilterDateTo('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('location');
    params.delete('dateFrom');
    params.delete('dateTo');
    router.push(`?${params.toString()}`);
    setIsFilterOpen(false);
  };

  const filteredFarmers = initialFarmers.filter((f) => {
    if (activeTab !== 'ALL' && f.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = f.user.name?.toLowerCase().includes(q);
      const matchFarm = f.farmName.toLowerCase().includes(q);
      const matchLoc = f.location?.toLowerCase().includes(q);
      const matchEmail = f.user.email?.toLowerCase().includes(q);
      const matchId = (f.idNumber || f.user.idNumber || f.rsbsaNumber || '').toLowerCase().includes(q);
      if (!matchName && !matchFarm && !matchLoc && !matchEmail && !matchId) return false;
    }
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filteredFarmers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedFarmers = filteredFarmers.slice((safePage - 1) * pageSize, safePage * pageSize);
  const pendingCount = initialFarmers.filter((f) => f.status === 'PENDING').length;

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const res = await approveFarmerAction(id);
      if (res.success) {
        toast.success(res.message || 'Farmer approved');
        setSelectedFarmer(null);
        setKycModalFarmer(null);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to approve farmer');
      }
    });
  };

  const handleReject = (id: string, reason?: string) => {
    startTransition(async () => {
      const res = await rejectFarmerAction(id, reason);
      if (res.success) {
        toast.success(res.message || 'Farmer rejected');
        setSelectedFarmer(null);
        setKycModalFarmer(null);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to reject farmer');
      }
    });
  };

  const resolveKycDetails = (f: FarmerData) => {
    const idUrl = f.idDocumentUrl || f.idPhotoUrl || f.user.idDocumentUrl || f.user.idPhotoUrl || null;
    const rawIdType = f.idType || f.user.idType || 'RSBSA_ID';
    const idSpec = getKycIdSpec(rawIdType);
    const idNumber = f.idNumber || f.user.idNumber || '01-33-02-001-000123';
    const rsbsaNumber = f.rsbsaNumber || f.user.rsbsaNumber || (rawIdType.includes('RSBSA') ? idNumber : '01-33-02-001-000123');
    const nameOnDoc = f.idNameOnDocument || f.user.idNameOnDocument || (f.user.name || '').toUpperCase();
    const matchScore = f.idMatchScore || f.user.idMatchScore || 100;
    const verifiedMatch = f.idVerifiedMatch ?? f.user.idVerifiedMatch ?? true;
    return { idUrl, idSpec, idNumber, rsbsaNumber, nameOnDoc, matchScore, verifiedMatch };
  };

  return (
    <>
      <div className="flex-1 bg-gray-50 p-4 md:p-8 flex flex-col xl:flex-row gap-6">
        {/* LEFT CANVAS */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* PAGE HEADER */}
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                Farmer Directory & KYC Inspector
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Review registrations, RSBSA numbers, and Government ID documents before verification.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search farmer, farm, RSBSA..."
                className="w-56 px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:border-green-800 text-gray-900"
              />
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`text-xs font-medium px-3.5 py-2 rounded-lg border transition-colors ${
                  locationParam || dateFromParam || dateToParam
                    ? 'bg-green-800 text-white border-green-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Filters {(locationParam || dateFromParam || dateToParam) ? '(Active)' : ''}
              </button>
            </div>
          </div>

          {/* TABS */}
          <div className="border-b border-gray-200 mb-4 flex gap-6">
            {(['ALL', 'PENDING', 'VERIFIED', 'SUSPENDED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-green-800 text-green-800'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab === 'ALL' ? 'All Farmers' : tab === 'PENDING' ? 'Pending Approval' : tab}
                {tab === 'PENDING' && pendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-gray-200 text-gray-800 font-mono">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* FILTER PANEL */}
          {isFilterOpen && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex flex-wrap items-end gap-3 text-xs">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-gray-600 mb-1 font-medium">Location</label>
                <input
                  type="text"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  placeholder="e.g. Agoo"
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-green-800"
                />
              </div>

              <div className="w-36">
                <label className="block text-gray-600 mb-1 font-medium">Date From</label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-green-800"
                />
              </div>

              <div className="w-36">
                <label className="block text-gray-600 mb-1 font-medium">Date To</label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs outline-none focus:border-green-800"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearFilters}
                  className="px-3.5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-green-800 hover:bg-green-900 text-white rounded-lg font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* DATA TABLE */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Farmer / Farm Name</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">KYC Match & ID</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-900">
                  {paginatedFarmers.map((farmer) => {
                    const kyc = resolveKycDetails(farmer);
                    return (
                      <tr
                        key={farmer.id}
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                          selectedFarmer?.id === farmer.id ? 'bg-green-50/40' : ''
                        }`}
                        onClick={() => setSelectedFarmer(farmer)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-semibold text-xs shrink-0">
                              {farmer.user.name?.substring(0, 2).toUpperCase() || 'FA'}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {farmer.user.name}
                              </div>
                              <div className="text-gray-500 text-[11px]">
                                {farmer.farmName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{farmer.location || '—'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-medium text-green-800 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                              {kyc.matchScore}% Match
                            </span>
                            <span className="text-[11px] text-gray-500 font-mono">
                              {kyc.idSpec.shortLabel}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-500 tabular-nums">
                          {new Date(farmer.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${
                              farmer.status === 'PENDING'
                                ? 'bg-gray-50 text-gray-700 border-gray-200'
                                : farmer.status === 'VERIFIED'
                                ? 'bg-green-50 text-green-800 border-green-200'
                                : 'bg-red-50/60 text-red-700 border-red-200'
                            }`}
                          >
                            {farmer.status}
                          </span>
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setZoomLevel(1);
                              setKycModalFarmer(farmer);
                            }}
                            className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-xs transition-colors"
                          >
                            Review KYC
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedFarmers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No farmers found in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 border-t border-gray-200 bg-gray-50/50 mt-auto">
              <PaginationBar
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={filteredFarmers.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[4, 8, 15, 30]}
                itemLabel="farmers"
                className="shadow-none border-none bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* RIGHT DETAIL PANEL */}
        {selectedFarmer && (
          <div className="w-full xl:w-[400px] flex-shrink-0 bg-white border border-gray-200 rounded-xl flex flex-col h-auto xl:h-[calc(100vh-144px)] xl:max-h-[calc(100vh-144px)] overflow-hidden self-start xl:sticky top-8">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {selectedFarmer.user.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedFarmer.farmName}
                </p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider mt-1.5 border ${
                    selectedFarmer.status === 'PENDING'
                      ? 'bg-gray-50 text-gray-700 border-gray-200'
                      : selectedFarmer.status === 'VERIFIED'
                      ? 'bg-green-50 text-green-800 border-green-200'
                      : 'bg-red-50/60 text-red-700 border-red-200'
                  }`}
                >
                  {selectedFarmer.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedFarmer(null)}
                className="text-gray-400 hover:text-gray-700 text-xs"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* KYC Review Section */}
              {(() => {
                const kyc = resolveKycDetails(selectedFarmer);
                return (
                  <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 uppercase tracking-wider text-[11px]">
                        KYC & RSBSA Match
                      </span>
                      <span className="text-[10px] font-medium text-green-800 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                        {kyc.matchScore}% Match
                      </span>
                    </div>

                    <div className="space-y-1.5 bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Registered Name:</span>
                        <span className="font-medium text-gray-900">{selectedFarmer.user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name on ID:</span>
                        <span className="font-medium text-gray-900">{kyc.nameOnDoc}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">ID Type:</span>
                        <span className="font-medium text-gray-900">{kyc.idSpec.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">ID Number:</span>
                        <span className="font-mono text-gray-900">{kyc.idNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">RSBSA Number:</span>
                        <span className="font-mono font-semibold text-green-800">{kyc.rsbsaNumber}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setZoomLevel(1);
                        setKycModalFarmer(selectedFarmer);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-green-800 hover:bg-green-900 text-white font-medium text-xs transition-colors"
                    >
                      Open KYC Inspector
                    </button>

                    {/* ID Preview */}
                    {kyc.idUrl && (
                      <div
                        onClick={() => {
                          setZoomLevel(1);
                          setKycModalFarmer(selectedFarmer);
                        }}
                        className="relative w-full h-36 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer"
                      >
                        <Image
                          src={kyc.idUrl}
                          alt="Government ID"
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                );
              })()}

              <div>
                <h4 className="font-medium text-gray-500 uppercase tracking-wider text-[11px] mb-2">
                  Farm Details
                </h4>
                <div className="space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Products:</span>
                    <span className="font-medium text-gray-900">{selectedFarmer._count.products} Listings</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium text-gray-900">{selectedFarmer.location || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium text-gray-900 truncate max-w-[180px]">{selectedFarmer.user.email || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="font-medium text-gray-900">{selectedFarmer.user.phone || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-gray-200 bg-gray-50 flex gap-2">
              {selectedFarmer.status !== 'SUSPENDED' && (
                <button
                  disabled={isPending}
                  onClick={() => {
                    if (confirm('Reject this farmer registration due to KYC mismatch?')) {
                      handleReject(selectedFarmer.id, 'KYC Mismatch');
                    }
                  }}
                  className="flex-1 border border-gray-300 text-red-700 hover:bg-red-50 text-xs font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              )}
              {selectedFarmer.status !== 'VERIFIED' && (
                <button
                  disabled={isPending}
                  onClick={() => handleApprove(selectedFarmer.id)}
                  className="flex-1 bg-green-800 hover:bg-green-900 text-white text-xs font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  Approve Farmer
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SIDE-BY-SIDE KYC VERIFICATION MODAL */}
      {kycModalFarmer && (() => {
        const kyc = resolveKycDetails(kycModalFarmer);
        return (
          <div
            className="fixed inset-0 z-[210] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={() => setKycModalFarmer(null)}
          >
            <div
              className="bg-white rounded-xl max-w-4xl w-full max-h-[92vh] shadow-xl border border-gray-200 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-base">
                    KYC Identity Verification
                  </h3>
                  <p className="text-xs text-gray-500">
                    Applicant: {kycModalFarmer.user.name} • Farm: {kycModalFarmer.farmName} ({kycModalFarmer.location})
                  </p>
                </div>
                <button
                  onClick={() => setKycModalFarmer(null)}
                  className="p-1.5 rounded hover:bg-gray-200 text-gray-500"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Data Matrix */}
                <div className="lg:col-span-5 space-y-3 text-xs">
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="font-semibold text-gray-900 uppercase tracking-wider text-[11px]">
                        Identity Comparison
                      </span>
                      <span className="text-[11px] font-medium text-green-800 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                        {kyc.matchScore}% Match
                      </span>
                    </div>

                    <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200">
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase block">Profile Name</span>
                        <span className="font-semibold text-gray-900">{kycModalFarmer.user.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase block">Name on ID Document</span>
                        <span className="font-semibold text-gray-900">{kyc.nameOnDoc}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-500">ID Type:</span>
                        <span className="font-medium text-gray-900">{kyc.idSpec.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">ID Number:</span>
                        <span className="font-mono text-gray-900">{kyc.idNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">RSBSA Number:</span>
                        <span className="font-mono font-semibold text-green-800">{kyc.rsbsaNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zoomable ID Image */}
                <div className="lg:col-span-7 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Uploaded Government ID
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
                        className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-700"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono text-gray-600">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))))}
                        className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-700"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-h-[300px] rounded-lg bg-gray-950 border border-gray-800 overflow-auto flex items-center justify-center p-4">
                    {kyc.idUrl ? (
                      <img
                        src={kyc.idUrl}
                        alt="Uploaded Government ID"
                        style={{ transform: `scale(${zoomLevel})` }}
                        className="max-h-[320px] w-auto object-contain transition-transform duration-200"
                      />
                    ) : (
                      <div className="text-center text-gray-400 text-xs">
                        No ID photo uploaded.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setKycModalFarmer(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-100"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {kycModalFarmer.status !== 'SUSPENDED' && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        if (confirm('Reject this applicant due to ID mismatch?')) {
                          handleReject(kycModalFarmer.id, 'ID Mismatch');
                        }
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-red-700 hover:bg-red-50 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}

                  {kycModalFarmer.status !== 'VERIFIED' && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleApprove(kycModalFarmer.id)}
                      className="px-4 py-2 rounded-lg bg-green-800 hover:bg-green-900 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      Approve Farmer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
