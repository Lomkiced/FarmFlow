import Image from 'next/image';
import { AUTH_FARM_HERO_IMAGE } from '@/lib/constants/farm-media';

interface AuthLeftPanelProps {
  variant: 'buyer' | 'farmer' | 'login';
  widthClass?: string;
}

export default function AuthLeftPanel({ variant, widthClass = 'w-1/2' }: AuthLeftPanelProps) {
  const isFarmer = variant === 'farmer';
  const isLogin = variant === 'login';
  const isBuyer = variant === 'buyer';

  return (
    <div
      className={`hidden lg:flex flex-col ${widthClass} relative bg-green-950 overflow-hidden p-10 justify-between`}
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={AUTH_FARM_HERO_IMAGE}
          alt="Lush green agricultural fields in Agoo, La Union"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-green-950/75" />
      </div>

      {isLogin && (
        <div className="relative z-10 w-full max-w-xl h-full flex flex-col justify-between">
          <div>
            <div className="mb-8">
              <span className="text-2xl font-bold text-white tracking-tight">FarmFlow</span>
              <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-green-200 border border-green-700/60 bg-green-900/60 px-2 py-0.5 rounded">
                La Union
              </span>
            </div>
            <h1 className="text-3xl font-bold leading-snug text-white mt-10 mb-3">
              Fresh from Agoo Farms
            </h1>
            <p className="text-base text-green-100 max-w-md leading-relaxed">
              Connect directly with RSBSA-verified farmers in La Union and receive farm-gate produce with live logistics tracking.
            </p>
          </div>
          <div className="bg-green-950/70 border border-white/20 rounded-xl p-5">
            <p className="text-sm text-white leading-relaxed mb-2">
              &ldquo;FarmFlow helped me connect directly with local market buyers across Agoo without middlemen.&rdquo;
            </p>
            <p className="text-xs uppercase tracking-wider font-semibold text-green-200">
              Farmer Ramon — San Vicente Norte
            </p>
          </div>
        </div>
      )}

      {isBuyer && (
        <div className="relative z-10 flex flex-col h-full justify-between w-full">
          <div>
            <div className="mb-8">
              <span className="text-2xl font-bold text-white tracking-tight">FarmFlow</span>
              <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-green-200 border border-green-700/60 bg-green-900/60 px-2 py-0.5 rounded">
                Marketplace
              </span>
            </div>
            <h1 className="text-4xl xl:text-5xl leading-tight font-bold tracking-tight text-white mt-16 mb-4">
              Shop fresh.
              <br />
              Support local.
            </h1>
            <p className="text-base text-green-100 max-w-md leading-relaxed">
              Verified farmers in Agoo, La Union ready to deliver fresh produce and fulfill wholesale contracts directly to your door.
            </p>
          </div>
          <div className="flex gap-6 border-t border-white/20 pt-6">
            <div className="flex-1">
              <div className="text-xl font-bold text-white tabular-nums">50+</div>
              <div className="text-xs text-green-200 mt-0.5">Verified Farmers</div>
            </div>
            <div className="flex-1">
              <div className="text-xl font-bold text-white tabular-nums">200+</div>
              <div className="text-xs text-green-200 mt-0.5">Fresh Listings</div>
            </div>
            <div className="flex-1">
              <div className="text-xl font-bold text-white tabular-nums">Same-Day</div>
              <div className="text-xs text-green-200 mt-0.5">Farm Dispatch</div>
            </div>
          </div>
        </div>
      )}

      {isFarmer && (
        <div className="relative z-10 flex flex-col h-full justify-between w-full">
          <div>
            <div className="mb-6">
              <span className="text-2xl font-bold text-white tracking-tight">FarmFlow</span>
              <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-green-200 border border-green-700/60 bg-green-900/60 px-2 py-0.5 rounded">
                Farmer ERP
              </span>
            </div>
            <p className="text-base text-green-100 max-w-sm mt-4 leading-relaxed">
              Empowering local agriculture in La Union through structured crop cycles, KYC verification, and direct marketplace access.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 max-w-xs leading-snug">
              Grow your market. Reach wholesale & retail buyers.
            </h2>
            <div className="bg-green-950/70 border border-white/20 rounded-xl p-5">
              <div className="text-2xl font-bold text-white tabular-nums">50+ Farms</div>
              <p className="text-xs text-green-200 mt-1">
                Verified agricultural producers actively selling across La Union
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
