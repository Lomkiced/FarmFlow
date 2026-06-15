export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4 p-6 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <div className="font-label-caps text-on-surface tracking-widest uppercase">Loading FarmFlow...</div>
      </div>
    </div>
  );
}
