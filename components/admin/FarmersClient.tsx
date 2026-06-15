'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { approveFarmerAction, rejectFarmerAction } from '@/app/actions/admin';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

type FarmerData = {
  id: string;
  status: string;
  createdAt: Date;
  location: string | null;
  farmName: string;
  user: {
    name: string | null;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
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
        toast.success(res.message || 'Farmer suspended');
        setSelectedFarmer(null);
      } else {
        toast.error(res.error || 'Failed to suspend farmer');
      }
    });
  };

  return (
    <div className="flex-1 bg-admin-background p-[40px] flex gap-[20px]">
      
      {/* LEFT CANVAS */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* PAGE HEADER */}
        <div className="mb-[24px] flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-[100]">
          <div>
            <h2 className="font-admin-h1 text-admin-h1 text-admin-on-background mb-2">Farmer Directory</h2>
            <p className="font-admin-body-base text-admin-on-surface-variant">Manage and review farmer registrations.</p>
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
        <div className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-lg overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-admin-surface border-b border-admin-outline-variant">
                <tr>
                  <th className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant py-3 px-[16px]">Farmer / Farm Name</th>
                  <th className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant py-3 px-[16px]">Location</th>
                  <th className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant py-3 px-[16px]">Joined</th>
                  <th className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant py-3 px-[16px]">Status</th>
                </tr>
              </thead>
              <tbody className="font-admin-table-data text-admin-table-data text-admin-on-surface divide-y divide-admin-outline-variant/50">
                {filteredFarmers.map((farmer) => (
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
                ))}
                {filteredFarmers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-admin-on-surface-variant">No farmers found in this category.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT CANVAS — DETAIL PANEL */}
      {selectedFarmer && (
        <div className="w-[400px] flex-shrink-0 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] flex flex-col h-[calc(100vh-144px)] overflow-hidden self-start sticky top-[40px]">
          
          <div className="p-[24px] border-b border-admin-outline-variant bg-admin-surface flex justify-between items-start">
            <div className="flex items-center gap-4">
              {selectedFarmer.user.avatarUrl ? (
                <img src={selectedFarmer.user.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-admin-surface object-cover shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-admin-surface shadow-sm bg-admin-surface-variant text-admin-on-surface flex items-center justify-center font-bold text-lg">
                  {selectedFarmer.user.name?.substring(0,2).toUpperCase() || 'FA'}
                </div>
              )}
              <div>
                <h3 className="font-admin-h3 text-admin-h3 text-admin-on-background flex items-center gap-2">
                  {selectedFarmer.user.name}
                  <span className={`inline-flex items-center px-2 py-1 rounded font-admin-label-caps text-[10px] uppercase tracking-wider ${
                        selectedFarmer.status === 'PENDING' ? 'bg-[#FFF8E1] text-[#F57F17]' :
                        selectedFarmer.status === 'VERIFIED' ? 'bg-primary-fixed text-on-primary-fixed-variant' :
                        'bg-error-container text-on-error-container'
                      }`}>
                    {selectedFarmer.status}
                  </span>
                </h3>
                <div className="text-admin-on-surface-variant font-admin-body-sm text-admin-body-sm ml-1 mt-1">{selectedFarmer.farmName}</div>
              </div>
            </div>
            <button onClick={() => setSelectedFarmer(null)} className="text-admin-on-surface-variant hover:bg-admin-surface-container p-1.5 rounded-full transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-[24px] space-y-6">
            
            <div>
              <h4 className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant mb-3 border-b border-admin-outline-variant/50 pb-1">Farm Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-admin-surface rounded p-3 border border-admin-outline-variant/50">
                  <div className="text-admin-on-surface-variant text-xs mb-1">Products</div>
                  <div className="font-medium text-admin-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">inventory_2</span>
                    {selectedFarmer._count.products} Listings
                  </div>
                </div>
                <div className="bg-admin-surface rounded p-3 border border-admin-outline-variant/50">
                  <div className="text-admin-on-surface-variant text-xs mb-1">Location</div>
                  <div className="font-medium text-admin-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                    {selectedFarmer.location || '—'}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant mb-3 border-b border-admin-outline-variant/50 pb-1">Contact Details</h4>
              <div className="space-y-3 font-admin-body-sm text-admin-body-sm">
                <div className="flex justify-between">
                  <span className="text-admin-on-surface-variant">Email</span>
                  <span className="font-medium text-admin-on-surface">{selectedFarmer.user.email || 'N/A'}</span>
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
                onClick={() => handleReject(selectedFarmer.id)}
                className="flex-1 bg-admin-surface-container-lowest border border-error text-error font-admin-body-sm font-medium py-2 rounded hover:bg-error-container/20 transition-colors disabled:opacity-50"
              >
                Suspend
              </button>
            )}
            {selectedFarmer.status !== 'VERIFIED' && (
              <button 
                disabled={isPending}
                onClick={() => handleApprove(selectedFarmer.id)}
                className="flex-1 bg-primary text-on-primary font-admin-body-sm font-medium py-2 rounded hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50"
              >
                Approve
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
