export default function FarmerPortalLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] gap-6 w-full">
      <div className="relative flex items-center justify-center">
        {/* Pulsing glow background */}
        <div className="absolute w-28 h-28 bg-primary/20 rounded-full blur-2xl animate-pulse delay-75"></div>
        
        {/* Rotating dashed ring */}
        <div className="absolute w-20 h-20 rounded-full border-4 border-t-primary/80 border-r-primary/80 border-b-transparent border-l-transparent animate-[spin_1.5s_linear_infinite]"></div>
        
        {/* Secondary slower ring */}
        <div className="absolute w-24 h-24 rounded-full border-2 border-b-secondary/60 border-l-secondary/60 border-t-transparent border-r-transparent animate-[spin_2s_linear_infinite_reverse]"></div>

        {/* Inner icon container */}
        <div className="relative bg-surface w-14 h-14 rounded-full flex items-center justify-center shadow-level-2 border border-outline-variant/30 z-10 transition-transform hover:scale-105 duration-300">
          <span className="material-symbols-outlined text-primary text-3xl animate-pulse">eco</span>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2 mt-4">
        <h3 className="text-h3 font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse">
          Loading Portal
        </h3>
        <p className="text-label-md text-on-surface-variant/80 animate-pulse delay-150">
          Fetching your farm data...
        </p>
      </div>
    </div>
  );
}
