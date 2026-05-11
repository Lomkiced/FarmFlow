'use client';

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 p-[40px] flex flex-col gap-[24px]">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-admin-h1 text-admin-h1 text-admin-on-surface">Admin Dashboard</h2>
          <p className="font-admin-body-base text-admin-body-base text-secondary mt-1">Overview of marketplace activity and system health.</p>
        </div>
        <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-admin-body-sm flex items-center gap-2" onClick={() => alert('Export coming soon!')}>
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Report
        </button>
      </div>

      {/* KPI BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-[16px]">
        
        {/* Total Farmers */}
        <div className="bg-admin-surface-container-lowest border border-admin-outline-variant p-[16px] rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-admin-label-caps text-admin-label-caps text-secondary uppercase">Total Farmers</span>
            <div className="bg-admin-surface-container p-1.5 rounded-lg text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">agriculture</span>
            </div>
          </div>
          <div>
            <div className="font-admin-h2 text-admin-h2 text-admin-on-surface">1,240</div>
            <div className="flex items-center gap-1 mt-1 font-admin-body-sm text-admin-body-sm text-primary">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              +12% this month
            </div>
          </div>
        </div>

        {/* Active Listings */}
        <div className="bg-admin-surface-container-lowest border border-admin-outline-variant p-[16px] rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-admin-label-caps text-admin-label-caps text-secondary uppercase">Active Listings</span>
            <div className="bg-admin-surface-container p-1.5 rounded-lg text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
          </div>
          <div>
            <div className="font-admin-h2 text-admin-h2 text-admin-on-surface">850</div>
            <div className="flex items-center gap-1 mt-1 font-admin-body-sm text-admin-body-sm text-secondary">
              Across 45 categories
            </div>
          </div>
        </div>

        {/* Monthly Orders */}
        <div className="bg-admin-surface-container-lowest border border-admin-outline-variant p-[16px] rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-admin-label-caps text-admin-label-caps text-secondary uppercase">Monthly Orders</span>
            <div className="bg-admin-surface-container p-1.5 rounded-lg text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
          </div>
          <div>
            <div className="font-admin-h2 text-admin-h2 text-admin-on-surface">425</div>
            <div className="flex items-center gap-1 mt-1 font-admin-body-sm text-admin-body-sm text-primary">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              +5% vs last month
            </div>
          </div>
        </div>

        {/* Total Sales Vol */}
        <div className="bg-admin-surface-container-lowest border border-admin-outline-variant p-[16px] rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-admin-label-caps text-admin-label-caps text-secondary uppercase">Total Sales Vol</span>
            <div className="bg-admin-surface-container p-1.5 rounded-lg text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div>
            <div className="font-admin-h2 text-admin-h2 text-admin-on-surface">₱1.2M</div>
            <div className="flex items-center gap-1 mt-1 font-admin-body-sm text-admin-body-sm text-primary">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              Strong quarter
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] p-[16px] rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FDE68A] rounded-bl-full opacity-20"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-[#92400E] uppercase font-admin-label-caps text-admin-label-caps">Pending Approvals</span>
            <div className="bg-[#FEF3C7] text-[#D97706] p-1.5 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            </div>
          </div>
          <div className="relative z-10">
            <div className="font-admin-h2 text-admin-h2 text-[#92400E]">12</div>
            <div className="flex items-center gap-1 mt-1 font-admin-body-sm text-admin-body-sm text-[#D97706] font-medium">
              Requires attention
            </div>
          </div>
        </div>

      </div>

      {/* CHARTS & ACTIVITY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
        
        {/* SALES TREND CHART */}
        <div className="lg:col-span-2 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl h-[400px] flex flex-col">
          <div className="p-[16px] border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-bright/50">
            <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Sales Trend (6 Months)</h3>
            <button className="text-secondary"><span className="material-symbols-outlined">more_horiz</span></button>
          </div>
          
          <div className="p-[16px] flex-1 flex items-end relative">
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-[16px] bottom-[32px] flex flex-col justify-between text-right pr-2 border-r border-admin-outline-variant font-admin-label-caps text-admin-label-caps text-secondary w-12">
              <span>₱400k</span>
              <span>₱300k</span>
              <span>₱200k</span>
              <span>₱100k</span>
              <span>0</span>
            </div>

            {/* Grid lines */}
            <div className="absolute left-12 right-[16px] top-[16px] bottom-[32px] flex flex-col justify-between pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-[1px] bg-admin-outline-variant/30"></div>
              ))}
            </div>

            {/* Bars */}
            <div className="flex-1 flex justify-around items-end h-full pl-12 z-10 pt-[16px] pb-[24px]">
              {[
                { label: 'Jul', height: '40%', opacity: '20' },
                { label: 'Aug', height: '55%', opacity: '30' },
                { label: 'Sep', height: '45%', opacity: '40' },
                { label: 'Oct', height: '70%', opacity: '60' },
                { label: 'Nov', height: '60%', opacity: '80' },
                { label: 'Dec', height: '90%', opacity: '100', active: true },
              ].map((month) => (
                <div key={month.label} className="flex flex-col items-center gap-2 group w-full px-2 h-full justify-end relative">
                  <div 
                    className="w-full rounded-t-sm transition-all" 
                    style={{ 
                      height: month.height,
                      backgroundColor: `color-mix(in srgb, var(--color-primary) ${month.opacity}%, transparent)` 
                    }}
                  ></div>
                  <span className={`font-admin-label-caps text-admin-label-caps absolute bottom-[-8px] ${month.active ? 'text-admin-on-surface font-bold' : 'text-secondary'}`}>
                    {month.label}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-[24px] h-[400px]">
          
          {/* TOP CROPS */}
          <div className="flex-1 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl overflow-hidden flex flex-col">
            <div className="p-[8px] px-[16px] border-b border-admin-outline-variant bg-admin-surface-bright/50 font-admin-body-base font-semibold text-admin-on-surface">
              Top Crops by Volume
            </div>
            <div className="p-[16px] flex-1 flex flex-col justify-center gap-3">
              {[
                { name: 'Rice', val: '85%', op: '100' },
                { name: 'Tomatoes', val: '60%', op: '80' },
                { name: 'Carrots', val: '45%', op: '60' },
                { name: 'Onions', val: '30%', op: '40' },
                { name: 'Eggplant', val: '15%', op: '20' },
              ].map(crop => (
                <div key={crop.name} className="flex items-center gap-3">
                  <span className="w-16 font-admin-label-caps text-admin-label-caps text-secondary text-right">{crop.name}</span>
                  <div className="flex-1 h-2 bg-admin-surface-container rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: crop.val, backgroundColor: `color-mix(in srgb, var(--color-primary) ${crop.op}%, transparent)` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ORDERS BY STATUS */}
          <div className="flex-1 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl overflow-hidden flex flex-col">
            <div className="p-[8px] px-[16px] border-b border-admin-outline-variant bg-admin-surface-bright/50 font-admin-body-base font-semibold text-admin-on-surface">
              Orders by Status
            </div>
            <div className="p-[16px] flex-1 flex items-center justify-between px-8">
              <div className="w-20 h-20 rounded-full shadow-inner bg-[conic-gradient(#012d1d_0%_65%,#a5d0b9_65%_90%,#e1e3e4_90%_100%)]"></div>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Completed (65%)', color: 'bg-primary' },
                  { label: 'In Transit (25%)', color: 'bg-[#a5d0b9]' },
                  { label: 'Pending (10%)', color: 'bg-[#e1e3e4]' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${l.color}`}></div>
                    <span className="font-admin-label-caps text-admin-label-caps text-secondary">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div className="bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl overflow-hidden mt-4 flex flex-col">
        <div className="p-[16px] border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-bright/50">
          <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Recent Activity</h3>
          <button className="font-admin-body-sm text-admin-body-sm text-primary hover:underline font-medium">View All</button>
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-admin-surface-container-low border-b border-admin-outline-variant">
              <tr>
                {['Event Type', 'Details', 'User/Entity', 'Time'].map(h => (
                  <th key={h} className="font-admin-label-caps text-admin-label-caps text-secondary font-semibold tracking-wider p-[8px] pl-[16px]">{h}</th>
                ))}
                <th className="font-admin-label-caps text-admin-label-caps text-secondary font-semibold tracking-wider p-[8px] pr-[16px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="font-admin-table-data text-admin-table-data text-admin-on-surface">
              
              <tr className="border-b border-admin-outline-variant/50 hover:bg-admin-surface-bright transition-colors">
                <td className="p-[16px]">
                  <div className="inline-flex items-center gap-2 bg-admin-surface-container text-primary px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    New Registration
                  </div>
                </td>
                <td className="p-[16px]">Farmer Profile Created</td>
                <td className="p-[16px]">Juan Dela Cruz (Benguet)</td>
                <td className="p-[16px] text-secondary">10 mins ago</td>
                <td className="p-[16px] text-right">
                  <button className="font-admin-body-sm text-admin-body-sm text-primary border border-admin-outline-variant px-3 py-1 rounded hover:bg-admin-surface-container-low transition-colors">Review</button>
                </td>
              </tr>

              <tr className="border-b border-admin-outline-variant/50 hover:bg-admin-surface-bright transition-colors">
                <td className="p-[16px]">
                  <div className="inline-flex items-center gap-2 bg-[#E0F2FE] text-[#0369A1] px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                    New Listing
                  </div>
                </td>
                <td className="p-[16px]">Premium Jasmine Rice (50kg)</td>
                <td className="p-[16px]">Central Luzon Co-op</td>
                <td className="p-[16px] text-secondary">45 mins ago</td>
                <td className="p-[16px] text-right">
                  <button className="font-admin-body-sm text-admin-body-sm text-primary border border-admin-outline-variant px-3 py-1 rounded hover:bg-admin-surface-container-low transition-colors">View</button>
                </td>
              </tr>

              <tr className="border-b border-admin-outline-variant/50 hover:bg-admin-surface-bright transition-colors">
                <td className="p-[16px]">
                  <div className="inline-flex items-center gap-2 bg-[#DCFCE7] text-[#15803D] px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Order Completed
                  </div>
                </td>
                <td className="p-[16px]">ORD-2023-8921 (₱45,000)</td>
                <td className="p-[16px]">Metro Manila Retailers</td>
                <td className="p-[16px] text-secondary">2 hours ago</td>
                <td className="p-[16px] text-right">
                  <button className="font-admin-body-sm text-admin-body-sm text-primary border border-admin-outline-variant px-3 py-1 rounded hover:bg-admin-surface-container-low transition-colors">View</button>
                </td>
              </tr>

              <tr className="hover:bg-admin-surface-bright transition-colors">
                <td className="p-[16px]">
                  <div className="inline-flex items-center gap-2 bg-[#FEF3C7] text-[#D97706] px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    Approval Pending
                  </div>
                </td>
                <td className="p-[16px]">Land Title Verification needed</td>
                <td className="p-[16px]">Maria Santos (Davao)</td>
                <td className="p-[16px] text-secondary">3 hours ago</td>
                <td className="p-[16px] text-right">
                  <button className="font-admin-body-sm text-admin-body-sm text-primary border border-admin-outline-variant px-3 py-1 rounded hover:bg-admin-surface-container-low transition-colors">Review</button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
