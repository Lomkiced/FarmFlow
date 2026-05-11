interface ProgressStepperProps {
  currentStep: 1 | 2 | 3
  variant: 'inline' | 'full'
}

export default function ProgressStepper({ currentStep, variant }: ProgressStepperProps) {
  const steps = ['Account', 'Profile', 'Done'];

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-auth-body-sm">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum <= currentStep;
          return (
            <div key={stepNum} className="flex items-center">
              <div className={`flex items-center ${isActive ? 'text-primary font-medium' : 'text-auth-secondary'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] mr-2 ${isActive ? 'bg-primary text-on-primary' : 'border border-auth-secondary text-auth-secondary'}`}>
                  {stepNum}
                </div>
                {step}
              </div>
              {idx < steps.length - 1 && (
                <span className="material-symbols-outlined text-auth-secondary-fixed-dim text-[16px] mx-2">chevron_right</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-between mb-[32px]">
      <div className="absolute left-0 top-[16px] w-full h-px bg-auth-secondary-fixed z-0" />
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum <= currentStep;
        return (
          <div key={stepNum} className="relative z-10 flex flex-col items-center bg-auth-surface px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] mb-1 ring-4 ring-auth-surface font-auth-label-caps ${isActive ? 'bg-primary text-on-primary' : 'bg-auth-surface-container-high text-auth-on-surface-variant border border-outline-variant'}`}>
              {stepNum}
            </div>
            <div className={`text-[12px] tracking-wider ${isActive ? 'font-semibold text-primary' : 'text-auth-on-surface-variant'}`}>
              {step}
            </div>
          </div>
        );
      })}
    </div>
  );
}
