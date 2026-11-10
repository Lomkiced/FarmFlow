interface CropStageBadgeProps {
  stage: string;
}

export default function CropStageBadge({ stage }: CropStageBadgeProps) {
  if (!stage) return null;
  const normalizedStage = stage.toLowerCase().replace('_to_harvest', '');

  const badges: Record<string, { bg: string; text: string; border: string; label: string }> = {
    seedling: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      label: 'Seedling',
    },
    growing: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-200',
      label: 'Growing',
    },
    ready: {
      bg: 'bg-green-100/70',
      text: 'text-green-900',
      border: 'border-green-300',
      label: 'Ready to Harvest',
    },
    harvested: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200',
      label: 'Harvested',
    },
  };

  const badge = badges[normalizedStage] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    label: stage,
  };

  return (
    <span
      className={`${badge.bg} ${badge.text} ${badge.border} border px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider inline-block w-fit`}
    >
      {badge.label}
    </span>
  );
}
