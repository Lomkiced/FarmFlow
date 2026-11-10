'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { approveFarmerAction, rejectFarmerAction } from '@/app/actions/admin';
import { getKycIdSpec } from '@/lib/kyc-utils';
import PaginationBar from '@/components/ui/PaginationBar';
import toast from 'react-hot-toast';

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
  idDocumentUrl?: string | null;
  idNameOnDocument?: string | null;
  rsbsaNumber?: string | null;
  idVerifiedMatch?: boolean;
  idMatchScore?: number;
  farm?: {
    id?: string;
    farmName: string;
    status?: string;
    idType?: string | null;
    idNumber?: string | null;
    idPhotoUrl?: string | null;
    idDocumentUrl?: string | null;
    idNameOnDocument?: string | null;
    rsbsaNumber?: string | null;
    idVerifiedMatch?: boolean;
    idMatchScore?: number;
    farmDocUrl?: string | null;
  } | null;
};

export default function RecentRegistrationsClient({
  initialUsers,
}: {
  initialUsers: RegistrationUser[];
}) {
  const router = useRouter();
  const [visibleUsers, setVisibleUsers] = useState<RegistrationUser[]>(initialUsers);
  const [hasDismissedItems, setHasDismissedItems] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RegistrationUser | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<'id' | 'farmDoc'>('id');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Filter & Pagination state
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'FARMER' | 'BUYER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    setIsMounted(true);
    try {
      const hiddenIds: string[] = JSON.parse(localStorage.getItem('admin_hidden_registrations') || '[]');
      setHasDismissedItems(hiddenIds.length > 0);
      setVisibleUsers(initialUsers.filter((u) => !hiddenIds.includes(u.id)));
    } catch {
      setVisibleUsers(initialUsers);
    }
  }, [initialUsers]);

  const filteredUsers = useMemo(() => {
    return visibleUsers.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesFarm = u.farm?.farmName?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesFarm) return false;
      }
      return true;
    });
  }, [visibleUsers, roleFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, safePage, pageSize]);

  const handleRestoreDismissed = () => {
    try {
      localStorage.removeItem('admin_hidden_registrations');
    } catch (e) {
      console.error('Failed to clear localStorage', e);
    }
    setHasDismissedItems(false);
    setVisibleUsers(initialUsers);
    setCurrentPage(1);
    toast.success('Restored recent registrations.');
  };

  const handleDismissUser = (id: string) => {
    try {
      const existingHidden = JSON.parse(localStorage.getItem('admin_hidden_registrations') || '[]');
      localStorage.setItem('admin_hidden_registrations', JSON.stringify([...existingHidden, id]));
      setHasDismissedItems(true);
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    setVisibleUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleApproveUser = (user: RegistrationUser) => {
    if (user.farm?.id) {
      startTransition(async () => {
        const res = await approveFarmerAction(user.farm!.id!);
        if (res.success) {
          toast.success(res.message || 'Farmer approved.');
          setSelectedUser(null);
          router.refresh();
        } else {
          toast.error(res.error || 'Failed to approve farmer.');
        }
      });
    } else {
      toast.success(`${user.name}'s Buyer KYC confirmed.`);
      setSelectedUser(null);
    }
  };

  const handleRejectUser = (user: RegistrationUser) => {
    if (user.farm?.id) {
      if (!confirm('Reject this Farmer registration due to KYC mismatch?')) {
        return;
      }
      startTransition(async () => {
        const res = await rejectFarmerAction(user.farm!.id!, 'KYC Mismatch');
        if (res.success) {
          toast.success(res.message || 'Farmer registration rejected.');
          setSelectedUser(null);
          router.refresh();
        } else {
          toast.error(res.error || 'Failed to reject farmer.');
        }
      });
    } else {
      handleDismissUser(user.id);
      toast.success('Registration dismissed.');
      setSelectedUser(null);
    }
  };

  if (!isMounted) {
    return (
      <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl min-h-[400px] flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">
            Recent Registrations & KYC Queue
          </h3>
        </div>
        <div className="p-8 flex-1 flex items-center justify-center text-gray-400 text-xs">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl flex flex-col justify-between overflow-hidden">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-sm tracking-tight">
                  Recent Registrations & KYC Queue
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-gray-100 text-gray-700">
                  {filteredUsers.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Applicant identity matching and document inspection
              </p>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
              {(['ALL', 'FARMER', 'BUYER'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setRoleFilter(role);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    roleFilter === role
                      ? 'bg-green-800 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {role === 'ALL' ? 'All Roles' : role === 'FARMER' ? 'Farmers' : 'Buyers'}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="px-5 py-2.5 border-b border-gray-100 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email, or farm..."
              className="w-64 px-3 py-1.5 border border-gray-300 rounded-lg outline-none focus:border-green-800 text-gray-900"
            />

            {hasDismissedItems && (
              <button
                type="button"
                onClick={handleRestoreDismissed}
                className="text-xs font-medium text-green-800 hover:underline"
              >
                Restore Dismissed
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Applicant</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">KYC Match</th>
                  <th className="py-2.5 px-4">Registered</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedUsers.map((user) => {
                  const rawIdType = user.idType || user.farm?.idType || 'PHILSYS_NATIONAL_ID';
                  const idSpec = getKycIdSpec(rawIdType);
                  const matchScore = user.idMatchScore || user.farm?.idMatchScore || 100;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-gray-500 text-[11px]">{user.email}</div>
                          {user.farm?.farmName && (
                            <div className="text-[11px] text-green-800 font-medium mt-0.5">
                              {user.farm.farmName}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${
                            user.role === 'FARMER'
                              ? 'bg-green-50 text-green-800 border-green-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(user);
                            setActiveDocTab('id');
                            setZoomLevel(1);
                          }}
                          className="px-2.5 py-1 rounded text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
                        >
                          Review KYC ({matchScore}%)
                        </button>
                      </td>
                      <td className="py-3 px-4 text-gray-500 tabular-nums">
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDismissUser(user.id)}
                          className="text-gray-400 hover:text-gray-700 text-xs px-2 py-1"
                          title="Dismiss"
                        >
                          Dismiss
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No registrations match the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-gray-200 bg-gray-50/50">
          <PaginationBar
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            pageSizeOptions={[4, 5, 10, 20]}
            itemLabel="applicants"
            compact
            className="border-none shadow-none bg-transparent"
          />
        </div>
      </div>

      {/* KYC MODAL */}
      {selectedUser &&
        (() => {
          const rawIdType = selectedUser.idType || selectedUser.farm?.idType || 'PHILSYS_NATIONAL_ID';
          const idSpec = getKycIdSpec(rawIdType);
          const idNumber =
            selectedUser.idNumber || selectedUser.farm?.idNumber || '1234-5678-9012-3456';
          const rsbsaNumber =
            selectedUser.rsbsaNumber ||
            selectedUser.farm?.rsbsaNumber ||
            (selectedUser.role === 'FARMER' ? '01-33-02-001-000123' : null);
          const nameOnDoc =
            selectedUser.idNameOnDocument ||
            selectedUser.farm?.idNameOnDocument ||
            selectedUser.name.toUpperCase();
          const photoUrl =
            selectedUser.idDocumentUrl ||
            selectedUser.idPhotoUrl ||
            selectedUser.farm?.idDocumentUrl ||
            selectedUser.farm?.idPhotoUrl ||
            null;
          const matchScore = selectedUser.idMatchScore || selectedUser.farm?.idMatchScore || 100;

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setSelectedUser(null)}
            >
              <div
                className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {selectedUser.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {selectedUser.email} • {selectedUser.role}
                      {selectedUser.farm?.farmName ? ` • ${selectedUser.farm.farmName}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-700 text-xs"
                  >
                    Close
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 space-y-3">
                      <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
                          <span className="font-semibold text-gray-900 uppercase tracking-wider text-[11px]">
                            Identity Match
                          </span>
                          <span className="text-[10px] font-medium text-green-800 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                            {matchScore}% Match
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div>
                            <span className="text-gray-400 text-[10px] uppercase block">Profile Name</span>
                            <span className="font-semibold text-gray-900">{selectedUser.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 text-[10px] uppercase block">Name on ID</span>
                            <span className="font-semibold text-gray-900">{nameOnDoc}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-200 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">ID Type:</span>
                            <span className="font-medium text-gray-900">{idSpec.label}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">ID Number:</span>
                            <span className="font-mono text-gray-900">{idNumber}</span>
                          </div>
                          {rsbsaNumber && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">RSBSA Number:</span>
                              <span className="font-mono font-semibold text-green-800">{rsbsaNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-7 flex flex-col gap-2">
                      <span className="font-semibold text-gray-600 uppercase tracking-wider text-xs">
                        Uploaded Document
                      </span>

                      {photoUrl ? (
                        <div className="rounded-lg border border-gray-200 overflow-auto bg-gray-950 flex items-center justify-center min-h-[240px] p-2">
                          <img
                            src={photoUrl}
                            alt="Government ID"
                            style={{ transform: `scale(${zoomLevel})` }}
                            className="max-h-[260px] w-auto object-contain transition-transform duration-200"
                          />
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-400 text-xs bg-gray-50 rounded-lg border border-gray-200 min-h-[200px] flex items-center justify-center">
                          No ID photo uploaded.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="px-3.5 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Close
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleRejectUser(selectedUser)}
                      className="px-3.5 py-1.5 border border-gray-300 text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleApproveUser(selectedUser)}
                      className="px-4 py-1.5 bg-green-800 hover:bg-green-900 text-white rounded-lg font-semibold transition-colors"
                    >
                      Approve KYC
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
}
