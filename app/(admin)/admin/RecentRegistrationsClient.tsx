'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

type RegistrationUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date | string;
  avatarUrl: string | null;
  idType?: string | null;
  idNumber?: string | null;
  idPhotoUrl?: string | null;
  farm?: {
    farmName: string;
    idType?: string | null;
    idNumber?: string | null;
    idPhotoUrl?: string | null;
    farmDocUrl?: string | null;
  } | null;
};

export default function RecentRegistrationsClient({ initialUsers }: { initialUsers: RegistrationUser[] }) {
  const [visibleUsers, setVisibleUsers] = useState<RegistrationUser[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RegistrationUser | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<'id' | 'farmDoc'>('id');

  useEffect(() => {
    setIsMounted(true);
    try {
      const hiddenIds = JSON.parse(localStorage.getItem('admin_hidden_registrations') || '[]');
      setVisibleUsers(initialUsers.filter(u => !hiddenIds.includes(u.id)));
    } catch {
      setVisibleUsers(initialUsers);
    }
  }, [initialUsers]);

  const handleClearAll = () => {
    try {
      const existingHidden = JSON.parse(localStorage.getItem('admin_hidden_registrations') || '[]');
      const newHidden = [...existingHidden, ...visibleUsers.map(u => u.id)];
      localStorage.setItem('admin_hidden_registrations', JSON.stringify(newHidden));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    setVisibleUsers([]);
  };

  const handleDismissUser = (id: string) => {
    try {
      const existingHidden = JSON.parse(localStorage.getItem('admin_hidden_registrations') || '[]');
      localStorage.setItem('admin_hidden_registrations', JSON.stringify([...existingHidden, id]));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    setVisibleUsers(prev => prev.filter(u => u.id !== id));
  };

  if (!isMounted) {
    return (
      <div className="lg:col-span-2 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl h-[420px] flex flex-col shadow-sm">
        <div className="p-4 border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-bright/50">
          <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Recent Registrations</h3>
        </div>
        <div className="p-4 flex-1 flex items-center justify-center text-secondary">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="lg:col-span-2 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl h-[420px] flex flex-col shadow-sm">
        <div className="p-4 border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-bright/50">
          <div className="flex items-center gap-2">
            <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Recent Registrations</h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
              {visibleUsers.length}
            </span>
          </div>
          {visibleUsers.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="text-xs font-medium text-error hover:bg-error/10 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">clear_all</span>
              Clear All
            </button>
          )}
        </div>
        
        <div className="p-4 flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-admin-surface-container-low border-b border-admin-outline-variant">
              <tr>
                <th className="font-admin-label-caps text-admin-label-caps text-secondary font-semibold tracking-wider p-2">User</th>
                <th className="font-admin-label-caps text-admin-label-caps text-secondary font-semibold tracking-wider p-2">Role</th>
                <th className="font-admin-label-caps text-admin-label-caps text-secondary font-semibold tracking-wider p-2">Gov ID</th>
                <th className="font-admin-label-caps text-admin-label-caps text-secondary font-semibold tracking-wider p-2">Joined</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody className="font-admin-table-data text-admin-table-data text-admin-on-surface">
              {visibleUsers.map(user => {
                const effectiveIdType = user.idType || user.farm?.idType;
                const effectiveIdNumber = user.idNumber || user.farm?.idNumber;
                const effectivePhotoUrl = user.idPhotoUrl || user.farm?.idPhotoUrl;
                const hasFarmDoc = !!user.farm?.farmDocUrl;

                return (
                  <tr key={user.id} className="border-b border-admin-outline-variant/50 hover:bg-admin-surface-bright transition-colors group">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs uppercase overflow-hidden flex-shrink-0">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-admin-on-surface text-sm truncate">{user.name}</div>
                          <div className="text-secondary text-xs truncate">{user.email}</div>
                          {user.farm?.farmName && (
                            <div className="text-[11px] text-primary/80 font-medium truncate">🌱 {user.farm.farmName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                        user.role === 'FARMER' ? 'bg-primary/10 text-primary border border-primary/20' : 
                        user.role === 'BUYER' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : 'bg-gray-500/10 text-gray-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">
                      {effectivePhotoUrl ? (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setActiveDocTab('id');
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">badge</span>
                          <span className="max-w-[100px] truncate">{effectiveIdType || 'Verified ID'}</span>
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                          <span className="material-symbols-outlined text-[15px]">pending</span>
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-secondary text-xs whitespace-nowrap">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => handleDismissUser(user.id)}
                        className="opacity-0 group-hover:opacity-100 text-secondary hover:text-error transition-all p-1 rounded-full hover:bg-error/10"
                        title="Dismiss"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {visibleUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center text-secondary gap-2">
                      <span className="material-symbols-outlined text-[32px] opacity-50">task_alt</span>
                      <p className="text-sm">All caught up! No recent registrations to show.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ID INSPECTION MODAL */}
      {selectedUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedUser(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{selectedUser.name}</h3>
                  <p className="text-xs text-gray-500">{selectedUser.email} • <span className="font-semibold text-primary">{selectedUser.role}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Document Tabs */}
            {selectedUser.farm?.farmDocUrl && (
              <div className="flex border-b border-gray-200 bg-gray-50/40 px-5 pt-3 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveDocTab('id')}
                  className={`pb-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                    activeDocTab === 'id' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">badge</span>
                  Government ID
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDocTab('farmDoc')}
                  className={`pb-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                    activeDocTab === 'farmDoc' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  Farm Document / RSBSA
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {activeDocTab === 'id' ? (
                <>
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl text-xs">
                    <div>
                      <span className="text-gray-500 block mb-0.5">ID Type</span>
                      <span className="font-semibold text-gray-900">{selectedUser.idType || selectedUser.farm?.idType || 'Government ID'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-0.5">ID Number</span>
                      <span className="font-mono font-semibold text-gray-900">{selectedUser.idNumber || selectedUser.farm?.idNumber || 'N/A'}</span>
                    </div>
                  </div>

                  {(selectedUser.idPhotoUrl || selectedUser.farm?.idPhotoUrl) ? (
                    <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-950 flex flex-col items-center justify-center min-h-[300px]">
                      <img 
                        src={selectedUser.idPhotoUrl || selectedUser.farm?.idPhotoUrl || ''} 
                        alt="Government ID" 
                        className="max-h-[380px] w-auto object-contain"
                      />
                      <a 
                        href={selectedUser.idPhotoUrl || selectedUser.farm?.idPhotoUrl || '#'} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="absolute bottom-3 right-3 bg-black/75 hover:bg-black text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-sm transition-all"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        Open Full Image
                      </a>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400 text-sm">No ID photo uploaded.</div>
                  )}
                </>
              ) : (
                <>
                  <div className="bg-gray-50 p-3.5 rounded-xl text-xs">
                    <span className="text-gray-500 block mb-0.5">Farm Certificate / Ownership Document</span>
                    <span className="font-semibold text-gray-900">{selectedUser.farm?.farmName || 'Farm Document'}</span>
                  </div>

                  {selectedUser.farm?.farmDocUrl ? (
                    <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-950 flex flex-col items-center justify-center min-h-[300px]">
                      {selectedUser.farm.farmDocUrl.endsWith('.pdf') ? (
                        <div className="p-8 text-center flex flex-col items-center gap-3">
                          <span className="material-symbols-outlined text-[48px] text-white/70">picture_as_pdf</span>
                          <span className="text-xs text-white/80">PDF Document</span>
                        </div>
                      ) : (
                        <img 
                          src={selectedUser.farm.farmDocUrl} 
                          alt="Farm Document" 
                          className="max-h-[380px] w-auto object-contain"
                        />
                      )}
                      <a 
                        href={selectedUser.farm.farmDocUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="absolute bottom-3 right-3 bg-black/75 hover:bg-black text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-sm transition-all"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        Open Document
                      </a>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400 text-sm">No farm document uploaded.</div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
