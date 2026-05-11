interface CropProgressBarProps {
  progress: number
  stage: 'seedling' | 'growing' | 'ready' | 'harvested'
}

export default function CropProgressBar({ progress, stage }: CropProgressBarProps) {
  const stageColors = {
    seedling: '#2196F3',
    growing: '#4CAF50', 
    ready: '#FFB300',
    harvested: '#9E9E9E',
  }

  return (
    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-500"
        style={{ 
          width: `${progress}%`, 
          backgroundColor: stageColors[stage] 
        }} 
      />
    </div>
  )
}
