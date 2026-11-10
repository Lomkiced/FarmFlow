'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { addAdminAction, deleteAdminAction } from '@/app/actions/admin';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
};

type Props = {
  adminUsers: AdminUser[];
  currentUserId: string;
};

const SECTIONS = [
  { id: 'general', label: 'General' },
  { id: 'users', label: 'Administrators' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'payment', label: 'Payment Integration' },
];

export default function AdminSettingsClient({ adminUsers, currentUserId }: Props) {
  const [activeSection, setActiveSection] = useState('general');
  const [notifications, setNotifications] = useState({
    newRegistrations: true,
    orderDisputes: true,
    pendingListings: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Add Admin State
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail) return;

    setIsAddingAdmin(true);
    const res = await addAdminAction(newAdminName, newAdminEmail);
    setIsAddingAdmin(false);

    if (res.success) {
      toast.success(res.message || 'Admin added successfully!');
      setNewAdminName('');
      setNewAdminEmail('');
      setIsAddAdminOpen(false);
    } else {
      toast.error(res.error || 'Failed to add admin.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    toast.success('Settings saved successfully!');
  };

  const handleDeleteAdmin = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete administrator ${name}?`)) {
      const loadingToast = toast.loading('Deleting administrator...');
      const res = await deleteAdminAction(id);
      if (res.success) {
        toast.success(res.message || 'Administrator deleted.', { id: loadingToast });
      } else {
        toast.error(res.error || 'Failed to delete administrator.', { id: loadingToast });
      }
    }
  };

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://farmflow.vercel.app'}/api/webhooks/paymongo`;

  return (
    <div className="flex-1 pb-32 bg-[#F9FAFB] min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">System Settings</h1>
        <p className="text-sm text-gray-500 mb-8">
          Configure global parameters, integrations, and administrator access.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT NAV */}
          <div className="lg:col-span-3 space-y-1">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => scrollTo(sec.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeSection === sec.id
                    ? 'bg-green-50 text-green-900 border-l-2 border-green-800'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-9 space-y-6">

            {/* SECTION 1 — General */}
            <div id="general" className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-24">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-3 mb-5">
                General
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    System Name
                  </label>
                  <input
                    type="text"
                    defaultValue="FarmFlow Agoo"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 focus:border-green-800 focus:ring-1 focus:ring-green-800 outline-none bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    LGU Contact Email
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@agoo.gov.ph"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-xs text-gray-900 focus:border-green-800 focus:ring-1 focus:ring-green-800 outline-none bg-white"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Municipality
                  </label>
                  <input
                    type="text"
                    defaultValue="Agoo, La Union, Philippines"
                    readOnly
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-xs text-gray-500 bg-gray-50 outline-none cursor-not-allowed"
                  />
                  <p className="text-[11px] text-gray-400">Target municipality for provincial jurisdiction.</p>
                </div>
              </div>
            </div>

            {/* SECTION 2 — Administrator Accounts */}
            <div id="users" className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-24">
              <div className="border-b border-gray-200 pb-3 mb-5 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  Administrator Accounts
                </h2>
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded border border-gray-200">
                    {adminUsers.length} admin{adminUsers.length !== 1 ? 's' : ''}
                  </span>
                  <button 
                    onClick={() => setIsAddAdminOpen(true)}
                    className="bg-green-800 hover:bg-green-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Add Admin
                  </button>
                </div>
              </div>

              {isAddAdminOpen && (
                <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Invite New Administrator
                    </h3>
                    <button 
                      onClick={() => setIsAddAdminOpen(false)}
                      className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                  <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="Juan Dela Cruz"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:border-green-800 outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="juan@agoo.gov.ph"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:border-green-800 outline-none bg-white"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddAdminOpen(false)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isAddingAdmin}
                        className="px-3 py-1.5 text-xs font-semibold bg-green-800 text-white rounded hover:bg-green-900 transition-colors disabled:opacity-50"
                      >
                        {isAddingAdmin ? 'Inviting...' : 'Send Invite'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {adminUsers.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs">
                  No admin accounts found.
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Name', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {adminUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2.5">
                            <span className="font-semibold text-gray-900">
                              {user.name} {user.id === currentUserId && <span className="text-[10px] text-gray-400 ml-1">(You)</span>}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-600">{user.email}</td>
                          <td className="px-4 py-2.5">
                            <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                              Admin
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-500 tabular-nums">
                            {new Date(user.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="inline-block text-green-800 bg-green-50 border border-green-200 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                              Active
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <button
                              onClick={() => handleDeleteAdmin(user.id, user.name)}
                              disabled={user.id === currentUserId || adminUsers.length <= 1}
                              title={user.id === currentUserId ? 'You cannot delete yourself' : (adminUsers.length <= 1 ? 'Cannot delete the last admin' : 'Delete Administrator')}
                              className="text-red-700 hover:text-red-900 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* SECTION 3 — Notifications */}
            <div id="notifications" className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-24">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-3 mb-5">
                System Alerts
              </h2>

              <div className="space-y-3">
                {[
                  { id: 'newRegistrations', title: 'New Farmer Registrations', desc: 'Create a system alert when a new farmer signs up and needs KYC verification.' },
                  { id: 'orderDisputes', title: 'Order Disputes', desc: 'Create an alert when a buyer reports an issue or refund request.' },
                  { id: 'pendingListings', title: 'Pending Listings', desc: 'Create an alert when a farmer submits a new product listing for review.' },
                ].map((toggle) => (
                  <div key={toggle.id} className="flex items-center justify-between p-3.5 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                      <div className="text-xs font-semibold text-gray-900">{toggle.title}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{toggle.desc}</div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center shrink-0 ml-4">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications[toggle.id as keyof typeof notifications]}
                        onChange={() =>
                          setNotifications((prev) => ({ ...prev, [toggle.id]: !prev[toggle.id as keyof typeof prev] }))
                        }
                      />
                      <div className="w-9 h-5 bg-gray-300 rounded-full peer-checked:bg-green-800 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4 — Payment Integration */}
            <div id="payment" className="bg-white border border-gray-200 rounded-lg p-6 scroll-mt-24">
              <h2 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-3 mb-5">
                PayMongo Integration
              </h2>

              <div className="space-y-4">
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                  <p className="font-semibold text-gray-900">Keys are managed via Server Environment Variables</p>
                  <p className="mt-0.5">
                    Live secret keys are stored securely in production and are never exposed in client bundles.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Public Key</label>
                  <input
                    type="text"
                    value="pk_live_••••••••••••••••••"
                    readOnly
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 font-mono text-xs bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Secret Key</label>
                  <input
                    type="text"
                    value="sk_live_••••••••••••••••••"
                    readOnly
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 font-mono text-xs bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Webhook URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={webhookUrl}
                      readOnly
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 font-mono text-xs bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(webhookUrl);
                        toast.success('Webhook URL copied');
                      }}
                      className="bg-white border border-gray-300 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Configure this URL in PayMongo dashboard for real-time payment webhooks.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* STICKY SAVE FOOTER */}
      <div className="fixed bottom-0 left-[280px] right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 flex justify-end px-8">
        <div className="flex items-center gap-3 max-w-6xl mx-auto w-full justify-end">
          <p className="text-[11px] text-gray-500 mr-auto hidden sm:block">
            Preferences saved to local state. Environment configuration requires deployment update.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="border border-gray-300 text-gray-700 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-800 hover:bg-green-900 text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
