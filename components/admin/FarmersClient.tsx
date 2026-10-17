'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { approveFarmerAction, rejectFarmerAction } from '@/app/actions/admin';
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
  farmDocUrl?: string | null;
  user: {
    name: string | null;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
    idType?: string | null;
    idNumber?: string | null;
    idPhotoUrl?: string | null;
  };
  _count: {
    crops: number;
    products: number;
  };
};

export default function FarmersClient({ initialFarmers }: { initialFarmers: FarmerData[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = (searchParams.get('status') || 'ALL') as 'ALL' | 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  const locationParam = searchParams.get('location') || '';
  const dateFromParam = searchParams.get('dateFrom') || '';
  const dateToParam = searchParams.get('dateTo') || '';

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterLocation, setFilterLocation] = useState(locationParam);
  const [filterDateFrom, setFilterDateFrom] = useState(dateFromParam);
  const [filterDateTo, setFilterDateTo] = useState(dateToParam);

  const [selectedFarmer, setSelectedFarmer] = useState<FarmerData | null>(null);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab: string) => {
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

  const filteredFarmers = initialFarmers.filter((f) => activeTab === 'ALL' || f.status === activeTab);
  const pendingCount = initialFarmers.filter((f) => f.status === 'PENDING').length;

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const res = await approveFarmerAction(id);
      if (res.success) {
        toast.success(res.message || 'Farmer approved');
        setSelectedFarmer(null);
      } else {
        toast.error(res.error || 'Failed to approve farmer');
      }
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      const res = await rejectFarmerAction(id);
      if (res.success) {
        toast.success(res.message || 'Farmer permanently deleted');
        setSelectedFarmer(null);
      } else {
        toast.error(res.error || 'Failed to delete farmer');
      }
    });
  };

  return (
    <>
      <div className="flex-1 bg-admin-background p-4 md:p-[40px] flex flex-col xl:flex-row gap-[20px]">
        
        {/* LEFT CANVAS */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* PAGE HEADER */}
          <div className="mb-[24px] flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-[100]">
            <div>
              <h2 className="font-admin-h1 text-admin-h1 text-admin-on-background mb-2">Farmer Directory</h2>
              <p className="font-admin-body-base text-admin-on-surface-variant">Review registrations and inspect mandatory Government IDs before verification.</p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`border border-admin-outline-variant font-admin-label-caps px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                  (locationParam || dateFromParam || dateToParam) 
                    ? 'bg-primary text-on-primary border-primary hover:bg-primary-container hover:text-on-primary-container' 
                    : 'bg-admin-surface-container-lowest text-admin-on-surface hover:bg-admin-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                Filter
                {(locationParam || dateFromParam || dateToParam) && (
                  <span className="w-2 h-2 rounded-full bg-error absolute -top-1 -right-1"></span>
                )}
              </button>
            </div>
          </div>

          {/* TABS */}
          <div className="border-b border-admin-outline-variant mb-[16px] flex gap-6">
            {(['ALL', 'PENDING', 'VERIFIED', 'SUSPENDED'] as const).map((tab) => (
              <button 
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`font-admin-label-caps pb-3 transition-colors uppercase tracking-wider flex items-center gap-2 ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-admin-on-surface-variant hover:text-admin-on-background hover:border-admin-outline-variant'}`}
              >
                {tab === 'ALL' ? 'All Farmers' : tab === 'PENDING' ? 'Pending Approval' : tab}
                {tab === 'PENDING' && pendingCount > 0 && (
                  <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full text-[10px]">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* INLINE FILTER PANEL */}
          {isFilterOpen && (
            <div className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-lg p-4 mb-[16px] flex flex-wrap items-end gap-4 shadow-sm transition-all duration-300">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-admin-label-caps text-admin-on-surface-variant mb-1">Location (Municipality/Barangay)</label>
                <input 
                  type="text" 
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  placeholder="e.g. Agoo"
                  className="w-full bg-admin-surface border border-admin-outline-variant rounded p-2 text-sm text-admin-on-surface focus:border-primary outline-none"
                />
              </div>
              
              <div className="w-[150px]">
                <label className="block text-xs font-admin-label-caps text-admin-on-surface-variant mb-1">Date From</label>
                <input 
                  type="date" 
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full bg-admin-surface border border-admin-outline-variant rounded p-2 text-sm text-admin-on-surface focus:border-primary outline-none"
                />
              </div>
              
              <div className="w-[150px]">
                <label className="block text-xs font-admin-label-caps text-admin-on-surface-variant mb-1">Date To</label>
                <input 
                  type="date" 
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full bg-admin-surface border border-admin-outline-variant rounded p-2 text-sm text-admin-on-surface focus:border-primary outline-none"
                />
              </div>

              <div className="flex gap-2 ml-auto">
                <button 
                  onClick={clearFilters}
                  className="px-6 py-2 border border-admin-outline-variant text-admin-on-surface-variant rounded text-sm font-medium hover:bg-admin-surface-container-low transition-colors"
                >
                  Clear
                </button>
                <button 
                  onClick={applyFilters}
                  className="px-6 py-2 bg-primary text-on-primary rounded text-sm font-medium hover:bg-primary-container transition-colors shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* DATA TABLE CARD */}
          <div className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-lg overflow-hidden flex-1 flex flex-col w-full max-w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead className="bg-admin-surface border-b border-admin-outline-variant">
                  <tr>
                    <th className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant py-3 px-[16px]">Farmer / Farm Name</th>
                    <th className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant py-3 px-[16px]">Location</th>
                    <th className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant py-3 px-[16px]">Gov ID</th>
                    <th className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant py-3 px-[16px]">Joined</th>
                    <th className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant py-3 px-[16px]">Status</th>
                  </tr>
                </thead>
                <tbody className="font-admin-table-data text-admin-table-data text-admin-on-surface divide-y divide-admin-outline-variant/50">
                  {filteredFarmers.map((farmer) => {
                    const effectiveIdUrl = farmer.idPhotoUrl || farmer.user.idPhotoUrl;
                    const effectiveIdType = farmer.idType || farmer.user.idType;
                    return (
                      <tr 
                        key={farmer.id} 
                        className={`hover:bg-admin-surface-container-low transition-colors cursor-pointer ${selectedFarmer?.id === farmer.id ? 'bg-admin-surface-container' : ''}`}
                        onClick={() => setSelectedFarmer(farmer)}
                      >
                        <td className="py-3 px-[16px]">
                          <div className="flex items-center gap-3">
                            {farmer.user.avatarUrl ? (
                              <img src={farmer.user.avatarUrl} alt={farmer.user.name || 'User'} className="w-8 h-8 rounded-full border border-admin-outline-variant object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-admin-surface-variant text-admin-on-surface border border-admin-outline-variant flex items-center justify-center font-medium text-xs">
                                {farmer.user.name?.substring(0,2).toUpperCase() || 'FA'}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-admin-on-background">{farmer.user.name}</div>
                              <div className="text-admin-on-surface-variant text-xs">{farmer.farmName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-[16px]">{farmer.location || 'Not set'}</td>
                        <td className="py-3 px-[16px]">
                          {effectiveIdUrl ? (
                            <span className="inline-flex items-center gap-1 text-xs text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded">
                              <span className="material-symbols-outlined text-[14px]">badge</span>
                              {effectiveIdType || 'ID Attached'}
                            </span>
                          ) : (
                            <span className="text-xs text-on-surface-variant">None</span>
                          )}
                        </td>
                        <td className="py-3 px-[16px] text-admin-on-surface-variant">{new Date(farmer.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-[16px]">
                          <span className={`inline-flex items-center px-2 py-1 rounded font-admin-label-caps text-[10px] uppercase tracking-wider ${
                            farmer.status === 'PENDING' ? 'bg-[#FFF8E1] text-[#F57F17]' :
                            farmer.status === 'VERIFIED' ? 'bg-primary-fixed text-on-primary-fixed-variant' :
                            'bg-error-container text-on-error-container'
                          }`}>
                            {farmer.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredFarmers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-admin-on-surface-variant">No farmers found in this category.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT CANVAS — DETAIL PANEL */}
        {selectedFarmer && (
          <div className="w-full xl:w-[420px] flex-shrink-0 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] flex flex-col h-auto xl:h-[calc(100vh-144px)] xl:max-h-[calc(100vh-144px)] overflow-hidden self-start xl:sticky top-[40px]">
            
            <div className="p-[20px] border-b border-admin-outline-variant bg-admin-surface flex justify-between items-start">
              <div className="flex items-center gap-3">
                {selectedFarmer.user.avatarUrl ? (
                  <img src={selectedFarmer.user.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full border-2 border-admin-surface object-cover shadow-sm" />
                ) : (
                  <div className="w-14 h-14 rounded-full border-2 border-admin-surface shadow-sm bg-admin-surface-variant text-admin-on-surface flex items-center justify-center font-bold text-lg">
                    {selectedFarmer.user.name?.substring(0,2).toUpperCase() || 'FA'}
                  </div>
                )}
                <div>
                  <h3 className="font-admin-h3 text-admin-h3 text-admin-on-background flex items-center gap-2 text-base">
                    {selectedFarmer.user.name}
                  </h3>
                  <div className="text-admin-on-surface-variant font-admin-body-sm text-xs mt-0.5">{selectedFarmer.farmName}</div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded font-admin-label-caps text-[9px] uppercase tracking-wider mt-1 ${
                    selectedFarmer.status === 'PENDING' ? 'bg-[#FFF8E1] text-[#F57F17]' :
                    selectedFarmer.status === 'VERIFIED' ? 'bg-primary-fixed text-on-primary-fixed-variant' :
                    'bg-error-container text-on-error-container'
                  }`}>
                    {selectedFarmer.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedFarmer(null)} className="text-admin-on-surface-variant hover:bg-admin-surface-container p-1.5 rounded-full transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-[20px] space-y-5">
              
              {/* MANDATORY VALID GOVERNMENT ID REVIEW SECTION */}
              <div className="bg-surface-container p-3.5 rounded-xl border border-outline-variant/60">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-admin-label-caps text-admin-label-caps text-primary font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    Government ID Verification
                  </h4>
                  {(selectedFarmer.idPhotoUrl || selectedFarmer.user.idPhotoUrl) && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Attached
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-on-surface mb-3">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">ID Type:</span>
                    <span className="font-bold">{selectedFarmer.idType || selectedFarmer.user.idType || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">ID Number:</span>
                    <span className="font-mono font-medium">{selectedFarmer.idNumber || selectedFarmer.user.idNumber || 'N/A'}</span>
                  </div>
                </div>

                {/* ID Photo / Doc Preview */}
                {(selectedFarmer.idPhotoUrl || selectedFarmer.user.idPhotoUrl) ? (
                  <div className="space-y-2">
                    <div 
                      onClick={() => setPreviewDocUrl(selectedFarmer.idPhotoUrl || selectedFarmer.user.idPhotoUrl || null)}
                      className="relative w-full h-44 rounded-lg overflow-hidden border border-outline-variant bg-surface-container-lowest cursor-pointer group shadow-sm hover:border-primary transition-all"
                    >
                      {(selectedFarmer.idPhotoUrl || selectedFarmer.user.idPhotoUrl)?.endsWith('.pdf') ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                          <span className="material-symbols-outlined text-4xl text-error">picture_as_pdf</span>
                          <span className="text-xs font-semibold text-primary">Click to View PDF Document</span>
                        </div>
                      ) : (
                        <>
                          <Image 
                            src={selectedFarmer.idPhotoUrl || selectedFarmer.user.idPhotoUrl || ''} 
                            alt="Government ID" 
                            fill 
                            className="object-contain group-hover:scale-105 transition-transform duration-300" 
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                            <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                            Click to Enlarge
                          </div>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] text-center text-on-surface-variant italic">
                      Verify name & photo match farmer registration details.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-center text-xs text-amber-800 flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-amber-600 text-[20px]">warning</span>
                    No Government ID on file. Contact farmer before verifying.
                  </div>
                )}

                {/* Farm Ownership Document if attached */}
                {selectedFarmer.farmDocUrl && (
                  <div className="mt-3 pt-3 border-t border-outline-variant/50">
                    <span className="text-xs font-bold text-on-surface block mb-1.5">Proof of Farm / RSBSA:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewDocUrl(selectedFarmer.farmDocUrl || null)}
                      className="w-full py-2 px-3 rounded-lg bg-surface-container-highest hover:bg-primary/10 text-primary font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">description</span>
                      View Attached Certificate / Title
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant mb-2 border-b border-admin-outline-variant/50 pb-1">Farm Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-admin-surface rounded p-2.5 border border-admin-outline-variant/50">
                    <div className="text-admin-on-surface-variant text-[11px] mb-0.5">Listings</div>
                    <div className="font-medium text-admin-on-surface flex items-center gap-1 text-sm">
                      <span className="material-symbols-outlined text-xs text-primary">inventory_2</span>
                      {selectedFarmer._count.products} Products
                    </div>
                  </div>
                  <div className="bg-admin-surface rounded p-2.5 border border-admin-outline-variant/50">
                    <div className="text-admin-on-surface-variant text-[11px] mb-0.5">Location</div>
                    <div className="font-medium text-admin-on-surface flex items-center gap-1 text-xs truncate" title={selectedFarmer.location || ''}>
                      <span className="material-symbols-outlined text-xs text-primary">location_on</span>
                      {selectedFarmer.location || '—'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant mb-2 border-b border-admin-outline-variant/50 pb-1">Contact Details</h4>
                <div className="space-y-2 font-admin-body-sm text-xs">
                  <div className="flex justify-between">
                    <span className="text-admin-on-surface-variant">Email</span>
                    <span className="font-medium text-admin-on-surface truncate max-w-[200px]">{selectedFarmer.user.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-admin-on-surface-variant">Phone</span>
                    <span className="font-medium text-admin-on-surface">{selectedFarmer.user.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-admin-on-surface-variant">Joined</span>
                    <span className="font-medium text-admin-on-surface">{formatDistanceToNow(new Date(selectedFarmer.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-[16px] border-t border-admin-outline-variant bg-admin-surface-container-lowest flex gap-3">
              {selectedFarmer.status !== 'SUSPENDED' && (
                <button 
                  disabled={isPending}
                  onClick={() => {
                    if (confirm('Are you sure you want to permanently reject and delete this farmer? This action cannot be undone.')) {
                      handleReject(selectedFarmer.id);
                    }
                  }}
                  className="flex-1 bg-admin-surface-container-lowest border border-error text-error font-admin-body-sm font-medium py-2 rounded hover:bg-error-container/20 transition-colors disabled:opacity-50 text-xs"
                >
                  Reject & Delete
                </button>
              )}
              {selectedFarmer.status !== 'VERIFIED' && (
                <button 
                  disabled={isPending}
                  onClick={() => handleApprove(selectedFarmer.id)}
                  className="flex-1 bg-primary text-on-primary font-admin-body-sm font-medium py-2 rounded hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50 text-xs"
                >
                  Verify & Approve
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL ZOOM PREVIEW FOR GOVERNMENT ID / DOCUMENTS */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8" onClick={() => setPreviewDocUrl(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl p-4 flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant">
              <span className="font-bold text-on-surface text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">badge</span>
                Verification Document Inspection
              </span>
              <div className="flex items-center gap-2">
                <a 
                  href={previewDocUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3 py-1.5 rounded-lg bg-surface-variant hover:bg-surface-container-high text-xs font-bold text-on-surface flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  Open in New Tab
                </a>
                <button onClick={() => setPreviewDocUrl(null)} className="p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[300px]">
              {previewDocUrl.endsWith('.pdf') ? (
                <iframe src={previewDocUrl} className="w-full h-[70vh] rounded-lg border border-outline-variant" />
              ) : (
                <img src={previewDocUrl} alt="Document Full Inspection" className="max-h-[75vh] w-auto object-contain rounded-lg shadow-md" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
