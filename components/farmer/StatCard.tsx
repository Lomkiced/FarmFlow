interface StatCardProps {
  icon: string
  iconBg: string
  iconColor: string
  label: string
  value: string
  filled?: boolean
  colSpan?: 1 | 2
  className?: string
}

export default function StatCard({ icon, iconBg, iconColor, label, value, filled = false, colSpan = 1, className = '' }: StatCardProps) {
  return (
    <div className={`bg-surface-container-lowest p-[16px] rounded-[16px] shadow-[0_4px_20px_rgba(27,67,50,0.04)] flex flex-col gap-2 ${colSpan === 2 ? 'col-span-2' : ''} ${className}`}>
      <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center`}>
        <span className={`material-symbols-outlined text-[18px] ${iconColor}`} style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-[12px] font-semibold tracking-[0.03em] text-on-surface-variant mb-1">{label}</p>
        <p className="text-[24px] font-semibold leading-[1.3] text-on-background">{value}</p>
      </div>
    </div>
  );
}