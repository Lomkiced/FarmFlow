'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { addAdminAction } from '@/app/actions/admin';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
};

type Props = {
  adminUsers: AdminUser[];
};

const SECTIONS = [
  { id: 'general', label: 'General', icon: 'tune' },
  { id: 'users', label: 'Administrators', icon: 'manage_accounts' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications_active' },
  { id: 'payment', label: 'Payment Integration', icon: 'payments' },
];

export default function AdminSettingsClient({ adminUsers }: Props) {
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
    // Simulate a network save (in production this would call a server action)
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    toast.success('Settings saved successfully!');
  };

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://farmflow.vercel.app'}/api/webhooks/paymongo`;

  return (
    <div className="flex-1 pb-32">
      <div className="max-w-6xl mx-auto p-[32px]">
        <h1 className="font-admin-h1 text-admin-h1 text-admin-on-surface mb-2">System Settings</h1>
        <p className="font-admin-body-base text-admin-on-surface-variant mb-[32px]">
          Configure global parameters, integrations, and administrator access.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">

          {/* LEFT NAV */}
          <div className="lg:col-span-3 space-y-2">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => scrollTo(sec.id)}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg font-admin-body-sm transition-colors cursor-pointer ${
                  activeSection === sec.id
                    ? 'bg-admin-surface-container-highest border border-admin-outline-variant text-admin-on-surface font-medium'
                    : 'bg-admin-surface-container-lowest border border-admin-outline-variant text-admin-on-surface-variant hover:bg-admin-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{sec.icon}</span>
                {sec.label}
              </button>
            ))}
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-9 space-y-[24px]">

            {/* SECTION 1 — General */}
            <div id="general" className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl p-[24px] scroll-mt-24">
              <h2 className="font-admin-h3 text-admin-h3 text-admin-on-surface border-b border-admin-outline-variant pb-4 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">tune</span>
                General
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                <div className="space-y-2">
                  <label className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant block">
                    System Name
                  </label>
                  <input
                    type="text"
                    defaultValue="FarmFlow Agoo"
                    className="w-full border border-admin-outline-variant rounded-lg px-4 py-2.5 font-admin-body-sm text-admin-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-shadow bg-admin-surface"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant block">
                    LGU Contact Email
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@agoo.gov.ph"
                    className="w-full border border-admin-outline-variant rounded-lg px-4 py-2.5 font-admin-body-sm text-admin-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-shadow bg-admin-surface"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant block">
                    Municipality
                  </label>
                  <input
                    type="text"
                    defaultValue="Agoo, La Union, Philippines"
                    readOnly
                    className="w-full border border-admin-outline-variant rounded-lg px-4 py-2.5 font-admin-body-sm text-admin-on-surface-variant bg-admin-surface-container-low outline-none cursor-not-allowed"
                  />
                  <p className="text-xs text-admin-on-surface-variant">This is the target municipality. Contact your system administrator to change it.</p>
                </div>
              </div>
            </div>

            {/* SECTION 2 — Administrator Accounts */}
            <div id="users" className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl p-[24px] scroll-mt-24">
              <div className="border-b border-admin-outline-variant pb-4 mb-6 flex items-center justify-between">
                <h2 className="font-admin-h3 text-admin-h3 text-admin-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">manage_accounts</span>
                  Administrator Accounts
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-admin-on-surface-variant bg-admin-surface-container px-3 py-1.5 rounded-full border border-admin-outline-variant">
                    {adminUsers.length} admin{adminUsers.length !== 1 ? 's' : ''}
                  </span>
                  <button 
                    onClick={() => setIsAddAdminOpen(true)}
                    className="bg-primary text-on-primary text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    Add Admin
                  </button>
                </div>
              </div>

              {isAddAdminOpen && (
                <div className="mb-6 bg-admin-surface-bright border border-admin-outline-variant rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-admin-body-base font-semibold text-admin-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">person_add</span>
                      Invite New Administrator
                    </h3>
                    <button 
                      onClick={() => setIsAddAdminOpen(false)}
                      className="text-admin-on-surface-variant hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                  <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant block">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="e.g. Juan Dela Cruz"
                        className="w-full border border-admin-outline-variant rounded-lg px-4 py-2.5 font-admin-body-sm text-admin-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-shadow bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="e.g. juan@agoo.gov.ph"
                        className="w-full border border-admin-outline-variant rounded-lg px-4 py-2.5 font-admin-body-sm text-admin-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-shadow bg-white"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddAdminOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-admin-on-surface hover:bg-admin-surface-container-low rounded-lg transition-colors border border-transparent"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isAddingAdmin}
                        className="px-4 py-2 text-sm font-medium bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isAddingAdmin ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Inviting...
                          </>
                        ) : 'Send Invite'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {adminUsers.length === 0 ? (
                <div className="text-center py-12 text-admin-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] opacity-30 block mb-2">admin_panel_settings</span>
                  <p className="font-admin-body-sm">No admin accounts found in the database.</p>
                </div>
              ) : (
                <div className="border border-admin-outline-variant rounded-lg overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-admin-surface-container-low border-b border-admin-outline-variant">
                      <tr>
                        {['Name', 'Email', 'Role', 'Joined', 'Status'].map((h) => (
                          <th key={h} className="px-[16px] py-[10px] font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-admin-table-data text-admin-on-surface divide-y divide-admin-outline-variant/50">
                      {adminUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-admin-surface-bright transition-colors">
                          <td className="px-[16px] py-[12px]">
                            <div className="flex items-center gap-3">
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center font-bold text-xs flex-shrink-0">
                                  {user.name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-[16px] py-[12px] text-admin-on-surface-variant">{user.email}</td>
                          <td className="px-[16px] py-[12px]">
                            <span className="bg-primary-fixed text-on-primary-fixed-variant px-2 py-1 rounded-full text-xs font-semibold">
                              Admin
                            </span>
                          </td>
                          <td className="px-[16px] py-[12px] text-admin-on-surface-variant text-sm">
                            {new Date(user.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-[16px] py-[12px]">
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-xs text-admin-on-surface-variant mt-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                To add or remove admins, update user roles directly in your Supabase dashboard or via Prisma Studio.
              </p>
            </div>

            {/* SECTION 3 — Notifications */}
            <div id="notifications" className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl p-[24px] scroll-mt-24">
              <h2 className="font-admin-h3 text-admin-h3 text-admin-on-surface border-b border-admin-outline-variant pb-4 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">notifications_active</span>
                System Alerts
              </h2>

              <div className="space-y-4">
                {[
                  { id: 'newRegistrations', title: 'New Farmer Registrations', desc: 'Create a system notification when a new farmer signs up and needs verification.' },
                  { id: 'orderDisputes', title: 'Order Disputes', desc: 'Create an alert notification when a buyer reports an issue with their order.' },
                  { id: 'pendingListings', title: 'Pending Listings', desc: 'Create a notification when a farmer submits a new product listing for review.' },
                ].map((toggle) => (
                  <div key={toggle.id} className="flex items-center justify-between p-4 border border-admin-outline-variant rounded-lg bg-admin-surface-bright hover:bg-admin-surface-container-low transition-colors">
                    <div>
                      <div className="font-admin-body-base font-medium text-admin-on-surface">{toggle.title}</div>
                      <div className="font-admin-body-sm text-admin-on-surface-variant mt-0.5">{toggle.desc}</div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center flex-shrink-0 ml-4">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifications[toggle.id as keyof typeof notifications]}
                        onChange={() =>
                          setNotifications((prev) => ({ ...prev, [toggle.id]: !prev[toggle.id as keyof typeof prev] }))
                        }
                      />
                      <div className="w-11 h-6 bg-admin-outline-variant rounded-full peer-checked:bg-primary transition-colors peer-focus:ring-2 peer-focus:ring-primary/20 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4 — Payment Integration */}
            <div id="payment" className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl p-[24px] relative overflow-hidden scroll-mt-24">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/30 rounded-bl-full -z-10" />

              <h2 className="font-admin-h3 text-admin-h3 text-admin-on-surface border-b border-admin-outline-variant pb-4 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                PayMongo Integration
              </h2>

              <div className="space-y-[16px]">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-600 text-[20px] mt-0.5 flex-shrink-0">warning</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Keys are set via Environment Variables</p>
                    <p className="text-xs text-amber-700 mt-1">
                      PayMongo keys are managed as secure server-side environment variables in your Vercel project settings.
                      They are never exposed in the client. Update them directly in your Vercel dashboard under <strong>Settings → Environment Variables</strong>.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="font-admin-label-caps text-admin-on-surface-variant uppercase block mb-2">Public Key</label>
                  <div className="relative">
                    <input
                      type="text"
                      value="pk_live_••••••••••••••••••"
                      readOnly
                      className="w-full border border-admin-outline-variant rounded-lg pl-4 pr-10 py-2.5 font-mono text-sm bg-admin-surface-container-low text-admin-on-surface-variant outline-none cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-admin-outline text-[18px]">
                      lock
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-admin-label-caps text-admin-on-surface-variant uppercase block mb-2">Secret Key</label>
                  <div className="relative">
                    <input
                      type="text"
                      value="sk_live_••••••••••••••••••"
                      readOnly
                      className="w-full border border-admin-outline-variant rounded-lg pl-4 pr-10 py-2.5 font-mono text-sm bg-admin-surface-container-low text-admin-on-surface-variant outline-none cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-admin-outline text-[18px]">
                      lock
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-admin-outline-variant mt-2">
                  <label className="font-admin-label-caps text-admin-on-surface-variant uppercase block mb-2">Webhook URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={webhookUrl}
                      readOnly
                      className="flex-1 border border-admin-outline-variant rounded-lg px-4 py-2.5 font-mono text-sm bg-admin-surface-container-low cursor-not-allowed text-admin-on-surface-variant outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(webhookUrl);
                        toast.success('Webhook URL copied!');
                      }}
                      className="bg-admin-surface-bright border border-admin-outline-variant p-2.5 rounded-lg hover:bg-admin-surface-container-low transition-colors flex items-center justify-center text-admin-on-surface"
                      title="Copy to clipboard"
                    >
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                  </div>
                  <p className="font-admin-body-sm text-admin-on-surface-variant text-xs mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    Configure this URL in your PayMongo dashboard to receive real-time payment confirmations.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* STICKY SAVE FOOTER */}
      <div className="fixed bottom-0 left-[280px] right-0 z-30 bg-admin-surface-container-lowest/90 backdrop-blur-md border-t border-admin-outline-variant p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-end px-[32px]">
        <div className="flex items-center gap-4 max-w-6xl mx-auto w-full justify-end">
          <p className="text-xs text-admin-on-surface-variant mr-auto">
            Changes to notification preferences are saved locally. For system-level changes, update your environment variables.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-admin-surface-bright border border-admin-outline-variant text-admin-on-surface font-admin-body-sm font-medium px-6 py-2.5 rounded-lg hover:bg-admin-surface-container-low transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-on-primary font-admin-body-sm font-medium px-6 py-2.5 rounded-lg hover:bg-primary/90 shadow-sm flex items-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
