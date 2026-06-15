interface CropStageBadgeProps {
  stage: string
}

export default function CropStageBadge({ stage }: CropStageBadgeProps) {
  if (!stage) return null;
  // Normalize the stage string to match our keys
  const normalizedStage = stage.toLowerCase().replace('_to_harvest', '');
  
  const badges: Record<string, { bg: string, text: string, icon: string, label: string }> = {
    seedling: {
      bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]',
      icon: 'grass', label: 'Seedling'
    },
    growing: {
      bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]',
      icon: 'eco', label: 'Growing'
    },
    ready: {
      bg: 'bg-[#FFF8E1]', text: 'text-[#F57F17]',
      icon: 'stars', label: 'Ready to Harvest'
    },
    harvested: {
      bg: 'bg-surface-container-high', text: 'text-on-surface-variant',
      icon: 'inventory', label: 'Harvested'
    },
  }

  const badge = badges[normalizedStage] || {
    bg: 'bg-surface-variant', text: 'text-on-surface-variant',
    icon: 'help', label: stage
  };

  return (
    <span className={`${badge.bg} ${badge.text} px-2.5 py-1 rounded-full text-[12px] font-semibold tracking-[0.03em] flex items-center gap-1 shadow-sm w-fit`}>
      <span className="material-symbols-outlined text-[14px]">
        {badge.icon}
      </span>
      {badge.label}
    </span>
  )
}
