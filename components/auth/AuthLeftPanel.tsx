import Image from 'next/image';

interface AuthLeftPanelProps {
  variant: 'buyer' | 'farmer' | 'login'
  widthClass?: string
}

export default function AuthLeftPanel({ variant, widthClass = 'w-1/2' }: AuthLeftPanelProps) {
  const isFarmer = variant === 'farmer';
  const isLogin = variant === 'login';
  const isBuyer = variant === 'buyer';

  return (
    <div className={`hidden lg:flex flex-col ${widthClass} relative bg-primary-container overflow-hidden p-[40px] ${isLogin ? 'items-start justify-between' : 'justify-between'}`}>
      <div className="absolute inset-0 z-0">
        <Image
          src={isFarmer ? "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80" : "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1600&q=80"}
          alt="Background"
          fill
          className={`object-cover ${isFarmer ? 'opacity-30' : 'mix-blend-overlay opacity-40'}`}
          priority
        />
        {isFarmer && <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/50 to-primary z-10" />}
      </div>

      {isLogin && (
        <div className="relative z-10 w-full max-w-xl h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 mb-[32px]">
              <span className="material-symbols-outlined text-[30px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              <span className="text-[24px] font-semibold text-on-primary tracking-tight">FarmFlow</span>
            </div>
            <h1 className="text-[30px] font-semibold leading-[38px] text-on-primary mt-[40px] mb-[16px]">Fresh from Agoo Farms</h1>
            <p className="text-[16px] text-inverse-primary max-w-md">Connect with verified local farmers and get premium produce delivered fresh.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-xl p-[16px]">
            <p className="text-[16px] text-on-primary mb-[8px]">"FarmFlow helped me reach more buyers in Agoo."</p>
            <p className="text-[12px] tracking-widest font-semibold text-inverse-primary">- Farmer Ramon</p>
          </div>
        </div>
      )}

      {isBuyer && (
        <div className="relative z-10 flex flex-col h-full justify-between w-full">
          <div>
            <div className="flex items-center gap-1 mb-[32px]">
              <span className="material-symbols-outlined text-[30px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>agriculture</span>
              <span className="text-[24px] font-semibold text-on-primary tracking-tight">FarmFlow</span>
            </div>
            <h1 className="text-[48px] leading-[1.1] font-bold tracking-tight text-on-primary font-['Manrope'] mt-[80px] mb-[16px]">Shop fresh.<br/>Support local.</h1>
            <p className="text-[20px] font-semibold text-on-primary-container max-w-md">Over 50 verified farmers in Agoo, La Union ready to deliver to your door.</p>
          </div>
          <div className="flex gap-[20px] border-t border-on-primary-container/30 pt-[24px]">
            <div className="flex-1">
              <div className="text-[20px] font-semibold text-on-primary">50+</div>
              <div className="text-[14px] text-on-primary-container">Farmers</div>
            </div>
            <div className="flex-1">
              <div className="text-[20px] font-semibold text-on-primary">200+</div>
              <div className="text-[14px] text-on-primary-container">Products</div>
            </div>
            <div className="flex-1">
              <div className="text-[20px] font-semibold text-on-primary">Same-day</div>
              <div className="text-[14px] text-on-primary-container">Harvest</div>
            </div>
          </div>
        </div>
      )}

      {isFarmer && (
        <div className="relative z-20 flex flex-col h-full justify-between w-full">
          <div>
            <div className="flex items-center gap-1 mb-[24px]">
              <span className="material-symbols-outlined text-[30px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              <span className="text-[24px] font-semibold text-on-primary tracking-tight">FarmFlow</span>
            </div>
            <p className="text-[16px] text-primary-fixed-dim max-w-sm mt-[16px]">Empowering local agriculture through structured, reliable marketplace connections.</p>
          </div>
          <div>
            <h2 className="text-[24px] font-semibold text-on-primary mb-[16px] max-w-xs">Grow your market. Reach more buyers.</h2>
            <div className="bg-primary-container/40 border border-on-primary/10 rounded-xl p-[16px] mt-[24px] backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                <span className="text-[20px] font-semibold text-on-primary">50+</span>
              </div>
              <p className="text-[14px] text-primary-fixed-dim mt-1">Farmers already selling on FarmFlow</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
