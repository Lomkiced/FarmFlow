'use client';

export default function PrintReceiptButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => window.print()}
      type="button"
      className={
        className ||
        'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-on-surface font-semibold text-xs sm:text-sm transition-colors shadow-sm'
      }
    >
      <span className="material-symbols-outlined text-[18px]">print</span>
      Print Receipt
    </button>
  );
}
