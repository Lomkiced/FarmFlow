import AnalyticsHeader from '@/components/admin/AnalyticsHeader';

export default function AnalyticsPage() {
  return (
    <div className="flex-1 p-[32px] overflow-x-hidden">
      
      {/* PAGE HEADER */}
      <AnalyticsHeader />

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
        
        {/* KPI ROW */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-[16px]">
          
          <div className="bg-admin-surface-container-lowest border border-admin-outline-variant p-[16px] rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase">Total Sales</span>
              <span className="material-symbols-outlined text-primary-container bg-admin-surface-container p-1 rounded">payments</span>
            </div>
            <div className="font-admin-h2 text-admin-h2 text-admin-on-surface mb-1">₱4,250,000</div>
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              +12.5% from last month
            </div>
          </div>

          <div className="bg-admin-surface-container-lowest border border-admin-outline-variant p-[16px] rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase">Active Farmers</span>
              <span className="material-symbols-outlined text-primary-container bg-admin-surface-container p-1 rounded">group</span>
            </div>
            <div className="font-admin-h2 text-admin-h2 text-admin-on-surface mb-1">1,245</div>
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              +48 new registrations
            </div>
          </div>

          <div className="bg-admin-surface-container-lowest border border-admin-outline-variant p-[16px] rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase">Total Harvest Vol</span>
              <span className="material-symbols-outlined text-primary-container bg-admin-surface-container p-1 rounded">local_shipping</span>
            </div>
            <div className="font-admin-h2 text-admin-h2 text-admin-on-surface mb-1">8,500 MT</div>
            <div className="flex items-center gap-1 text-sm font-medium text-rose-600">
              <span className="material-symbols-outlined text-[16px]">trending_down</span>
              -2.1% from last month
            </div>
          </div>

          <div className="bg-admin-surface-container-lowest border border-admin-outline-variant p-[16px] rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase">Avg Order Value</span>
              <span className="material-symbols-outlined text-primary-container bg-admin-surface-container p-1 rounded">receipt</span>
            </div>
            <div className="font-admin-h2 text-admin-h2 text-admin-on-surface mb-1">₱15,200</div>
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              +5.4% from last month
            </div>
          </div>

        </div>

        {/* HARVEST TRENDS CHART */}
        <div className="lg:col-span-2 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl flex flex-col overflow-hidden h-[400px]">
          <div className="p-[24px] border-b border-admin-outline-variant bg-admin-surface-bright flex justify-between items-center">
            <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Harvest Trends</h3>
          </div>
          <div className="flex-1 bg-admin-surface-container-low relative p-[24px] flex items-end">
            <div className="absolute inset-0 bg-gradient-to-t from-primary-fixed/20 to-transparent pointer-events-none"></div>
            
            <div className="flex-1 flex justify-around items-end h-full z-10 gap-2">
              {[40, 45, 30, 60, 75, 65, 90, 85].map((val, idx) => (
                <div key={idx} className="w-full flex justify-center items-end h-full group relative">
                  <div 
                    className="w-full max-w-[40px] rounded-t-md transition-all group-hover:bg-primary-container"
                    style={{ 
                      height: `${val}%`, 
                      backgroundColor: `color-mix(in srgb, var(--color-primary-container) ${val}%, transparent)` 
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOP 5 CROPS */}
        <div className="lg:col-span-1 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl flex flex-col h-[400px]">
          <div className="p-[24px] border-b border-admin-outline-variant bg-admin-surface-bright">
            <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Top 5 Crops</h3>
          </div>
          <div className="p-[24px] flex-1 flex flex-col justify-center gap-6">
            {[
              { name: 'Rice (Palay)', vol: '3,200 MT', val: '85%' },
              { name: 'Corn', vol: '2,100 MT', val: '65%' },
              { name: 'Coconut', vol: '1,500 MT', val: '45%' },
              { name: 'Sugarcane', vol: '900 MT', val: '30%' },
              { name: 'Banana', vol: '600 MT', val: '20%' },
            ].map((crop, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-admin-body-sm text-admin-on-surface font-medium">{crop.name}</span>
                  <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant">{crop.vol}</span>
                </div>
                <div className="w-full h-2 bg-admin-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full" style={{ width: crop.val }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MOST ACTIVE FARMERS TABLE */}
        <div className="lg:col-span-2 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="p-[24px] border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-bright">
            <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Most Active Farmers</h3>
            <button className="text-primary hover:underline font-admin-body-sm font-medium">View All</button>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-admin-surface-container-low border-b border-admin-outline-variant">
                <tr>
                  <th className="py-[12px] px-[24px] font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase tracking-wider">Farmer Name</th>
                  <th className="py-[12px] px-[24px] font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase tracking-wider">Cooperative</th>
                  <th className="py-[12px] px-[24px] font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase tracking-wider">Transactions</th>
                  <th className="py-[12px] px-[24px] font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant uppercase tracking-wider text-right">Sales Volume</th>
                </tr>
              </thead>
              <tbody className="font-admin-table-data text-admin-table-data text-admin-on-surface divide-y divide-admin-outline-variant/50">
                {[
                  { name: 'Juan Dela Cruz', initials: 'JC', coop: 'San Isidro Agri Coop', txn: '42', sales: '₱450,000', color: 'bg-primary-fixed text-on-primary-fixed-variant' },
                  { name: 'Maria Tolentino', initials: 'MT', coop: 'Northern Farmers Union', txn: '38', sales: '₱380,500', color: 'bg-secondary-fixed text-on-secondary-fixed-variant' },
                  { name: 'Ricardo Bautista', initials: 'RB', coop: 'Central Valley Growers', txn: '31', sales: '₱320,000', color: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' },
                  { name: 'Elena Santos', initials: 'ES', coop: 'San Isidro Agri Coop', txn: '28', sales: '₱295,000', color: 'bg-primary-fixed text-on-primary-fixed-variant' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-admin-surface-bright transition-colors">
                    <td className="py-[16px] px-[24px]">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${row.color}`}>
                          {row.initials}
                        </div>
                        <span className="font-medium">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-[16px] px-[24px]">{row.coop}</td>
                    <td className="py-[16px] px-[24px]">{row.txn}</td>
                    <td className="py-[16px] px-[24px] text-right font-medium text-primary-container">{row.sales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SALES BY BARANGAY */}
        <div className="lg:col-span-1 bg-admin-surface-container-lowest border border-admin-outline-variant rounded-xl p-[24px] flex flex-col">
          <div className="flex items-center gap-2 mb-[24px]">
            <span className="material-symbols-outlined text-admin-outline">map</span>
            <h3 className="font-admin-h3 text-admin-h3 text-admin-on-surface">Sales by Barangay</h3>
          </div>

          <div className="bg-admin-surface-container-low rounded-lg p-4 flex flex-col gap-5 flex-1">
            {[
              { name: 'San Isidro', val: '75%', op: '90' },
              { name: 'Poblacion', val: '60%', op: '70' },
              { name: 'Mabini', val: '45%', op: '50' },
              { name: 'Rosario', val: '25%', op: '30' },
            ].map((brgy, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="font-admin-label-caps text-admin-label-caps text-admin-on-surface w-20 truncate">{brgy.name}</span>
                <div className="flex-1 h-8 bg-admin-surface-container rounded overflow-hidden">
                  <div className="h-full rounded" style={{ width: brgy.val, backgroundColor: `color-mix(in srgb, var(--color-primary-container) ${brgy.op}%, transparent)` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between font-admin-label-caps text-admin-label-caps text-admin-on-surface-variant">
            <span>Low Volume</span>
            <span>High Volume</span>
          </div>

        </div>

      </div>

    </div>
  );
}
