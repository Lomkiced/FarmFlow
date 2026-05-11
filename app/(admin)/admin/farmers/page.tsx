'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Farmer } from '@/types';

const mockFarmers: Farmer[] = [
  {
    id: 'FAR-2023-0891',
    name: 'Juan Dela Cruz',
    avatar: 'https://i.pravatar.cc/150?img=57',
    location: 'San Julian',
    date: 'Oct 24, 2023',
    status: 'pending',
    farm: {
      area: '2.5 Hectares',
      location: 'San Julian',
      crops: ['Rice', 'Corn'],
    },
    contact: {
      phone: '+63 917 123 4567',
      address: 'Purok 4, Brgy. San Julian, Bantayan',
    },
  },
  {
    id: 'FAR-2023-0892',
    name: 'Maria Reyes',
    initials: 'MR',
    location: 'Mabini',
    date: 'Oct 23, 2023',
    status: 'verified',
  },
  {
    id: 'FAR-2023-0890',
    name: 'Pedro Santos',
    avatar: 'https://i.pravatar.cc/150?img=32',
    location: 'Rosario',
    date: 'Oct 21, 2023',
    status: 'suspended',
  },
  {
    id: 'FAR-2023-0889',
    name: 'Carlos Garcia',
    initials: 'CG',
    location: 'San Julian',
    date: 'Oct 20, 2023',
    status: 'pending',
  },
];

export default function FarmersDirectoryPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified' | 'suspended'>('pending');
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(mockFarmers[0]);

  const filteredFarmers = mockFarmers.filter((f) => activeTab === 'all' || f.status === activeTab);

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-admin-background p-[40px] flex gap-[20px]">
      
      {/* LEFT CANVAS */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* PAGE HEADER */}
        <div className="mb-[24px] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-admin-h1 text-admin-h1 text-admin-on-background mb-2">Farmer Directory</h2>
            <p className="font-admin-body-base text-admin-on-surface-variant">Manage and review farmer registrations.</p>
          </div>

          <div className="flex items-center gap-3">
            <select className="border border-admin-outline-variant rounded bg-admin-surface-container-lowest text-admin-on-surface focus:ring-2 focus:ring-primary/20 font-admin-body-sm py-2 pl-3 pr-8 outline-none appearance-none">
              <option>All Barangays</option>
              <option>San Julian</option>
              <option>Mabini</option>
              <option>Rosario</option>
            </select>
            <select className="border border-admin-outline-variant rounded bg-admin-surface-container-lowest text-admin-on-surface focus:ring-2 focus:ring-primary/20 font-admin-body-sm py-2 pl-3 pr-8 outline-none appearance-none">
              <option>Any Status</option>
              <option>Verified</option>
              <option>Pending</option>
              <option>Suspended</option>
            </select>
            <button className="bg-admin-surface-container-lowest border border-admin-outline-variant text-admin-on-surface font-admin-label-caps px-4 py-2 rounded flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Filter
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="border-b border-admin-outline-variant mb-[16px] flex gap-6">
          {(['all', 'pending', 'verified', 'suspended'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-admin-label-caps pb-3 transition-colors uppercase tracking-wider flex items-center gap-2 ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-admin-on-surface-variant hover:text-admin-on-background hover:border-admin-outline-variant'}`}
            >
              {tab === 'all' ? 'All Farmers' : tab === 'pending' ? 'Pending Approval' : tab}
              {tab === 'pending' && (
                <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full text-[10px]">12</span>
              )}
            </button>
          ))}
        </div>

        {/* DATA TABLE CARD */}
        <div className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-lg overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-admin-surface border-b border-admin-outline-variant">
                <tr>
                  <th className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant py-3 px-[16px] w-12 text-center">
                    <input type="checkbox" className="rounded border-admin-outline-variant text-primary" />
                  </th>
                  <th className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant py-3 px-[16px]">Farmer Name</th>
                  <th className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant py-3 px-[16px]">Farm Location</th>
                  <th className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant py-3 px-[16px]">Date Registered</th>
                  <th className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant py-3 px-[16px]">Status</th>
                  <th className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant py-3 px-[16px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-admin-table-data text-admin-table-data text-admin-on-surface divide-y divide-admin-outline-variant/50">
                {filteredFarmers.map((farmer) => (
                  <tr 
                    key={farmer.id} 
                    className={`hover:bg-admin-surface-container-low transition-colors cursor-pointer ${selectedFarmer?.id === farmer.id ? 'bg-admin-surface-container' : ''}`}
                    onClick={() => setSelectedFarmer(farmer)}
                  >
                    <td className="py-3 px-[16px] text-center">
                      <input type="checkbox" className="rounded border-admin-outline-variant text-primary" onClick={(e) => e.stopPropagation()} />
                    </td>
                    <td className="py-3 px-[16px]">
                      <div className="flex items-center gap-3">
                        {farmer.avatar ? (
                          <img src={farmer.avatar} alt={farmer.name} className="w-8 h-8 rounded-full border border-admin-outline-variant object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-admin-surface-variant text-admin-on-surface border border-admin-outline-variant flex items-center justify-center font-medium text-xs">
                            {farmer.initials}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-admin-on-background">{farmer.name}</div>
                          <div className="text-admin-on-surface-variant text-xs">{farmer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-[16px]">{farmer.location}</td>
                    <td className="py-3 px-[16px] text-admin-on-surface-variant">{farmer.date}</td>
                    <td className="py-3 px-[16px]">
                      <span className={`inline-flex items-center px-2 py-1 rounded font-admin-label-caps text-[10px] uppercase tracking-wider ${
                        farmer.status === 'pending' ? 'bg-[#FFF8E1] text-[#F57F17]' :
                        farmer.status === 'verified' ? 'bg-primary-fixed text-on-primary-fixed-variant' :
                        'bg-error-container text-on-error-container'
                      }`}>
                        {farmer.status}
                      </span>
                    </td>
                    <td className="py-3 px-[16px] text-right">
                      {selectedFarmer?.id === farmer.id ? (
                        <span className="material-symbols-outlined text-primary">visibility</span>
                      ) : (
                        <span className="material-symbols-outlined text-admin-on-surface-variant hover:text-primary">more_vert</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-admin-surface border-t border-admin-outline-variant px-[16px] py-3 flex items-center justify-between font-admin-table-data text-admin-table-data text-admin-on-surface-variant mt-auto">
            <div>Showing 1 to {filteredFarmers.length} of 12 pending entries</div>
            <div className="flex gap-1">
              <button className="px-2 py-1 rounded border border-admin-outline-variant bg-admin-surface-container-lowest font-admin-table-data cursor-not-allowed text-admin-outline-variant">Prev</button>
              <button className="px-2 py-1 rounded border border-admin-outline-variant bg-primary text-on-primary font-admin-table-data">1</button>
              <button className="px-2 py-1 rounded border border-admin-outline-variant bg-admin-surface-container-lowest font-admin-table-data hover:bg-admin-surface-container">2</button>
              <button className="px-2 py-1 rounded border border-admin-outline-variant bg-admin-surface-container-lowest font-admin-table-data hover:bg-admin-surface-container">3</button>
              <button className="px-2 py-1 rounded border border-admin-outline-variant bg-admin-surface-container-lowest font-admin-table-data hover:bg-admin-surface-container">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT CANVAS — DETAIL PANEL */}
      {selectedFarmer && (
        <div className="w-[400px] flex-shrink-0 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] flex flex-col h-[calc(100vh-144px)] overflow-hidden self-start sticky top-[40px]">
          
          <div className="p-[24px] border-b border-admin-outline-variant bg-admin-surface flex justify-between items-start">
            <div className="flex items-center gap-4">
              {selectedFarmer.avatar ? (
                <img src={selectedFarmer.avatar} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-admin-surface object-cover shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-admin-surface shadow-sm bg-admin-surface-variant text-admin-on-surface flex items-center justify-center font-bold text-lg">
                  {selectedFarmer.initials}
                </div>
              )}
              <div>
                <h3 className="font-admin-h3 text-admin-h3 text-admin-on-background flex items-center gap-2">
                  {selectedFarmer.name}
                  <span className={`inline-flex items-center px-2 py-1 rounded font-admin-label-caps text-[10px] uppercase tracking-wider ${
                        selectedFarmer.status === 'pending' ? 'bg-[#FFF8E1] text-[#F57F17]' :
                        selectedFarmer.status === 'verified' ? 'bg-primary-fixed text-on-primary-fixed-variant' :
                        'bg-error-container text-on-error-container'
                      }`}>
                    {selectedFarmer.status}
                  </span>
                </h3>
                <div className="text-admin-on-surface-variant font-admin-body-sm text-admin-body-sm ml-1 mt-1">{selectedFarmer.id}</div>
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
                  <div className="text-admin-on-surface-variant text-xs mb-1">Total Area</div>
                  <div className="font-medium text-admin-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">straighten</span>
                    {selectedFarmer.farm?.area || '—'}
                  </div>
                </div>
                <div className="bg-admin-surface rounded p-3 border border-admin-outline-variant/50">
                  <div className="text-admin-on-surface-variant text-xs mb-1">Primary Location</div>
                  <div className="font-medium text-admin-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                    {selectedFarmer.location}
                  </div>
                </div>
                <div className="col-span-2 bg-admin-surface rounded p-3 border border-admin-outline-variant/50">
                  <div className="text-admin-on-surface-variant text-xs mb-1">Primary Crops</div>
                  <div className="flex gap-2 mt-1">
                    {(selectedFarmer.farm?.crops || ['—']).map(c => (
                      <span key={c} className="bg-admin-surface-container text-admin-on-surface px-2 py-1 rounded font-admin-body-sm text-xs">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant mb-3 border-b border-admin-outline-variant/50 pb-1">Contact Details</h4>
              <div className="space-y-3 font-admin-body-sm text-admin-body-sm">
                <div className="flex justify-between">
                  <span className="text-admin-on-surface-variant">Phone Number</span>
                  <span className="font-medium text-admin-on-surface">{selectedFarmer.contact?.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-admin-on-surface-variant">Address</span>
                  <span className="font-medium text-admin-on-surface text-right w-48">{selectedFarmer.contact?.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant mb-3 border-b border-admin-outline-variant/50 pb-1">Identity Verification</h4>
              <div className="border border-admin-outline-variant rounded overflow-hidden bg-admin-surface">
                <div className="p-3 border-b border-admin-outline-variant flex justify-between items-center">
                  <span className="font-medium text-admin-on-surface text-sm">National ID (Front)</span>
                  <button className="text-primary hover:underline text-xs">View Full</button>
                </div>
                <div className="aspect-video bg-admin-surface-container-high relative group cursor-pointer overflow-hidden">
                  <Image fill className="blur-[2px] opacity-80 object-cover" src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80" alt="ID Document" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                    <div className="bg-admin-surface-container-lowest p-2 rounded-full shadow-sm text-admin-on-surface flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">zoom_in</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="p-[16px] border-t border-admin-outline-variant bg-admin-surface-container-lowest flex gap-3">
            <button 
              onClick={() => alert('Rejected: ' + selectedFarmer.name)}
              className="flex-1 bg-admin-surface-container-lowest border border-error text-error font-admin-body-sm font-medium py-2 rounded hover:bg-error-container/20 transition-colors"
            >
              Reject
            </button>
            <button 
              onClick={() => alert('Approved: ' + selectedFarmer.name)}
              className="flex-1 bg-primary text-on-primary font-admin-body-sm font-medium py-2 rounded hover:bg-primary-container transition-colors shadow-sm"
            >
              Approve
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
