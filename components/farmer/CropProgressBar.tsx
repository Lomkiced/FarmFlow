interface CropProgressBarProps {
  progress: number;
  stage: 'seedling' | 'growing' | 'ready' | 'harvested';
}

export default function CropProgressBar({ progress, stage }: CropProgressBarProps) {
  const isHarvested = stage === 'harvested';

  return (
    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-300 ${
          isHarvested ? 'bg-gray-400' : 'bg-green-800'
        }`}
        style={{ width: `${progress}%` }} 
      />
    </div>
  );
}
