'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [notifications, setNotifications] = useState({
    newRegistrations: true,
    orderDisputes: true,
  });
  const [systemName, setSystemName] = useState('FarmFlow Agoo');
  const [email, setEmail] = useState('admin@agoo.gov.ph');

  return (
    <div className="flex-1 pb-32">
      
      <div className="max-w-6xl mx-auto p-[32px]">
        
        <h1 className="font-admin-h1 text-admin-h1 text-admin-on-surface mb-2">System Settings</h1>
        <p className="font-admin-body-base text-admin-on-surface-variant mb-[32px]">Configure global parameters and integrations.</p>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
          
          {/* LEFT NAV */}
          <div className="lg:col-span-3 space-y-2">
            {[
              { id: 'general', label: 'General' },
              { id: 'users', label: 'User Management' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'payment', label: 'Payment Integration' },
            ].map((sec) => (
              <button 
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id);
                  document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg font-admin-body-sm transition-colors cursor-pointer ${
                  activeSection === sec.id 
                    ? 'bg-admin-surface-container-highest border border-admin-outline-variant text-admin-on-surface font-medium' 
                    : 'bg-admin-surface-container-lowest border border-admin-outline-variant text-admin-on-surface-variant hover:bg-admin-surface-container-low'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-9 space-y-[24px]">
            
            {/* SECTION 1 — General Settings */}
            <div id="general" className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl p-[24px] scroll-mt-24">
              <h2 className="font-admin-h3 text-admin-h3 text-admin-on-surface border-b border-admin-outline-variant pb-4 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">tune</span>
                General
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                <div className="space-y-2">
                  <label className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant">System Name</label>
                  <input 
                    type="text" 
                    value={systemName} 
                    onChange={(e) => setSystemName(e.target.value)} 
                    className="w-full border border-admin-outline-variant rounded-lg px-4 py-2 font-admin-body-sm text-admin-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant">LGU Contact Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full border border-admin-outline-variant rounded-lg px-4 py-2 font-admin-body-sm text-admin-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2 — User Management */}
            <div id="users" className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl p-[24px] scroll-mt-24">
              <div className="border-b border-admin-outline-variant pb-4 mb-6 flex items-center justify-between">
                <h2 className="font-admin-h3 text-admin-h3 text-admin-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">manage_accounts</span>
                  Administrator Accounts
                </h2>
                <button className="bg-primary text-on-primary font-admin-body-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Admin
                </button>
              </div>

              <div className="border border-admin-outline-variant rounded-lg overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-admin-surface-container-low border-b border-admin-outline-variant">
                    <tr>
                      {['Name', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-[16px] py-[8px] font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-admin-table-data text-admin-on-surface divide-y divide-admin-outline-variant/50">
                    {[
                      { name: 'Maria Santos', email: 'm.santos@agoo.gov.ph', role: 'Super Admin', status: 'Active' },
                      { name: 'Juan Dela Cruz', email: 'j.cruz@agoo.gov.ph', role: 'Support Admin', status: 'Active' },
                    ].map((user, idx) => (
                      <tr key={idx}>
                        <td className="px-[16px] py-[12px]">{user.name}</td>
                        <td className="px-[16px] py-[12px]">{user.email}</td>
                        <td className="px-[16px] py-[12px]">{user.role}</td>
                        <td className="px-[16px] py-[12px]">
                          <span className="bg-primary-fixed text-on-primary-fixed-variant px-2 py-1 rounded-full text-xs font-semibold">{user.status}</span>
                        </td>
                        <td className="px-[16px] py-[12px]">
                          <button className="text-admin-outline hover:text-primary transition-colors flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 3 — Notifications */}
            <div id="notifications" className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl p-[24px] scroll-mt-24">
              <h2 className="font-admin-h3 text-admin-h3 text-admin-on-surface border-b border-admin-outline-variant pb-4 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">notifications_active</span>
                System Alerts
              </h2>

              <div className="space-y-4">
                {[
                  { id: 'newRegistrations', title: 'New Registrations', desc: 'Alert when a new farmer signs up.', checked: notifications.newRegistrations },
                  { id: 'orderDisputes', title: 'Order Disputes', desc: 'Alert when a buyer reports an issue.', checked: notifications.orderDisputes },
                ].map((toggle) => (
                  <div key={toggle.id} className="flex items-center justify-between p-4 border border-admin-outline-variant rounded-lg bg-admin-surface-bright">
                    <div>
                      <div className="font-admin-body-base font-medium text-admin-on-surface">{toggle.title}</div>
                      <div className="font-admin-body-sm text-admin-on-surface-variant">{toggle.desc}</div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={toggle.checked} 
                        onChange={() => setNotifications(prev => ({ ...prev, [toggle.id]: !prev[toggle.id as keyof typeof prev] }))} 
                      />
                      <div className="w-11 h-6 bg-admin-outline-variant rounded-full peer-checked:bg-primary transition-colors peer-focus:ring-2 peer-focus:ring-primary/20 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4 — Payment Integration */}
            <div id="payment" className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl p-[24px] relative overflow-hidden scroll-mt-24">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/30 rounded-bl-full -z-10"></div>
              
              <h2 className="font-admin-h3 text-admin-h3 text-admin-on-surface border-b border-admin-outline-variant pb-4 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                PayMongo Integration
              </h2>

              <div className="space-y-[16px]">
                <div>
                  <label className="font-admin-label-caps text-admin-on-surface-variant uppercase block mb-2">Public Key</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value="pk_live_xxxxxxxxxxxxxxxxxxxxx" 
                      readOnly 
                      className="w-full border border-admin-outline-variant rounded-lg pl-4 pr-10 py-2 font-mono text-sm bg-admin-surface text-admin-on-surface"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-outline hover:text-primary transition-colors flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-admin-label-caps text-admin-on-surface-variant uppercase block mb-2">Secret Key</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value="sk_live_xxxxxxxxxxxxxxxxxxxxx" 
                      readOnly 
                      className="w-full border border-admin-outline-variant rounded-lg pl-4 pr-10 py-2 font-mono text-sm bg-admin-surface text-admin-on-surface"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-outline hover:text-primary transition-colors flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-admin-outline-variant mt-6">
                  <label className="font-admin-label-caps text-admin-on-surface-variant uppercase block mb-2">Webhook URL</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value="https://api.farmflow.agoo.gov.ph/webhooks/paymongo" 
                      readOnly 
                      className="flex-1 border border-admin-outline-variant rounded-lg px-4 py-2 font-mono text-sm bg-admin-surface-container-low cursor-not-allowed text-admin-on-surface-variant outline-none"
                    />
                    <button 
                      onClick={() => navigator.clipboard.writeText('https://api.farmflow.agoo.gov.ph/webhooks/paymongo')}
                      className="bg-admin-surface-bright border border-admin-outline-variant p-2 rounded-lg hover:bg-admin-surface-container-low transition-colors flex items-center justify-center text-admin-on-surface"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                  </div>
                  <p className="font-admin-body-sm text-admin-on-surface-variant text-xs mt-1">Configure this URL in your PayMongo dashboard to receive real-time payment updates.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* STICKY SAVE FOOTER */}
      <div className="fixed bottom-0 left-[280px] right-0 z-30 bg-admin-surface-container-lowest/90 backdrop-blur-md border-t border-admin-outline-variant p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-end px-[32px]">
        <div className="flex items-center gap-4 max-w-6xl mx-auto w-full justify-end">
          <button 
            onClick={() => window.location.reload()}
            className="bg-admin-surface-bright border border-admin-outline-variant text-admin-on-surface font-admin-body-sm font-medium px-6 py-2.5 rounded-lg hover:bg-admin-surface-container-low transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={() => alert('Settings saved!')}
            className="bg-primary text-on-primary font-admin-body-sm font-medium px-6 py-2.5 rounded-lg hover:bg-primary-container shadow-sm flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Changes
          </button>
        </div>
      </div>

    </div>
  );
}
