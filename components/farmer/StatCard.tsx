interface StatCardProps {
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  label: string;
  value: string;
  filled?: boolean;
  colSpan?: 1 | 2;
  className?: string;
}

export default function StatCard({ label, value, colSpan = 1, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white p-4 rounded-lg border border-gray-200 flex flex-col justify-between ${colSpan === 2 ? 'col-span-2' : ''} ${className}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
    </div>
  );
}
