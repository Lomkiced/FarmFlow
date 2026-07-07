'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  avatarUrl: string | null;
};

export default function RecentRegistrationsClient({ initialUsers }: { initialUsers: User[] }) {
  const [visibleUsers, setVisibleUsers] = useState<User[]>([]);
  const [isMounted, setIsMounted] = useState(false);

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

  // Prevent hydration mismatch by showing empty or skeleton state initially
  if (!isMounted) {
    return (
      <div className="lg:col-span-2 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl h-[400px] flex flex-col">
        <div className="p-[16px] border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-bright/50">
          <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Recent Registrations</h3>
        </div>
        <div className="p-[16px] flex-1 flex items-center justify-center text-secondary">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl h-[400px] flex flex-col">
      <div className="p-[16px] border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-bright/50">
        <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Recent Registrations</h3>
        {visibleUsers.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="text-sm font-medium text-error hover:bg-error/10 px-3 py-1 rounded-md transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">clear_all</span>
            Clear All
          </button>
        )}
      </div>
      
      <div className="p-[16px] flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-admin-surface-container-low border-b border-admin-outline-variant">
            <tr>
              <th className="font-admin-label-caps text-admin-label-caps text-secondary font-semibold tracking-wider p-[8px]">User</th>
              <th className="font-admin-label-caps text-admin-label-caps text-secondary font-semibold tracking-wider p-[8px]">Role</th>
              <th className="font-admin-label-caps text-admin-label-caps text-secondary font-semibold tracking-wider p-[8px]">Joined</th>
              <th className="p-[8px]"></th>
            </tr>
          </thead>
          <tbody className="font-admin-table-data text-admin-table-data text-admin-on-surface">
            {visibleUsers.map(user => (
              <tr key={user.id} className="border-b border-admin-outline-variant/50 hover:bg-admin-surface-bright transition-colors group">
                <td className="p-[12px]">
                  <div className="font-medium text-admin-on-surface">{user.name}</div>
                  <div className="text-secondary text-sm">{user.email}</div>
                </td>
                <td className="p-[12px] capitalize">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'FARMER' ? 'bg-primary/10 text-primary' : 
                    user.role === 'BUYER' ? 'bg-blue-500/10 text-blue-600' : 'bg-gray-500/10 text-gray-600'
                  }`}>
                    {user.role.toLowerCase()}
                  </span>
                </td>
                <td className="p-[12px] text-secondary">
                  {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </td>
                <td className="p-[12px] text-right">
                  <button 
                    onClick={() => handleDismissUser(user.id)}
                    className="opacity-0 group-hover:opacity-100 text-secondary hover:text-error transition-all p-1 rounded-full hover:bg-error/10"
                    title="Dismiss"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </td>
              </tr>
            ))}
            {visibleUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-[32px] text-center">
                  <div className="flex flex-col items-center justify-center text-secondary gap-2">
                    <span className="material-symbols-outlined text-[32px] opacity-50">task_alt</span>
                    <p>All caught up! No recent registrations to show.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
