'use client';

import { useState } from 'react';
import { format } from 'date-fns';

export default function AnalyticsHeader() {
  const [period, setPeriod] = useState('This Month');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/admin/analytics/export?period=${encodeURIComponent(period)}`, {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error('Failed to export CSV. Please try again.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `farmflow-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // We could add a toast here if a toast system exists
    } catch (error) {
      console.error(error);
      alert('Failed to generate export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-[24px] gap-4">
      <div>
        <h2 className="font-admin-h1 text-admin-h1 text-admin-on-background">Analytics</h2>
        <p className="font-admin-body-sm text-admin-on-surface-variant mt-1">Deep dive into marketplace performance and trends.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-admin-outline-variant">calendar_today</span>
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-admin-outline-variant rounded-lg pl-9 pr-8 py-2 font-admin-body-sm bg-admin-surface-container-lowest text-admin-on-surface outline-none appearance-none"
          >
            <option value="This Month">This Month</option>
            <option value="Last Month">Last Month</option>
            <option value="This Quarter">This Quarter</option>
            <option value="Year to Date">Year to Date</option>
          </select>
        </div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="bg-primary-container text-white flex items-center gap-2 font-admin-body-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-container/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">download</span>
          )}
          {isExporting ? 'Exporting...' : 'Export to CSV'}
        </button>
      </div>
    </div>
  );
}
