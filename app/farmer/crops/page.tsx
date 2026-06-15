import Image from 'next/image';
import Link from 'next/link';
import FarmerHeader from '@/components/farmer/FarmerHeader';
import FarmerBottomNav from '@/components/farmer/FarmerBottomNav';
import DesktopSidebarNav from '@/components/farmer/DesktopSidebarNav';
import CropStageBadge from '@/components/farmer/CropStageBadge';
import CropProgressBar from '@/components/farmer/CropProgressBar';
import AddCropButton from '@/components/farmer/AddCropButton';
import { getCropsAction } from '@/app/actions/crops';
import { getFarmProfileAction } from '@/app/actions/farm';

export default async function CropsPage() {
  const [crops, farmProfile] = await Promise.all([
    getCropsAction(),
    getFarmProfileAction(),
  ]);

  const userName = farmProfile?.user?.name || 'Farmer';
  const avatarUrl = farmProfile?.user?.avatarUrl;

  return (
    <div className="bg-background min-h-screen pb-24 md:pb-0 flex md:flex-row flex-col font-body-md text-body-md w-full max-w-full">
      {/* Mobile header */}
      <FarmerHeader variant="default" userName={userName} avatarUrl={avatarUrl} />
      
      {/* Desktop sidebar */}
      <DesktopSidebarNav activePage="crops" />
      
      {/* Main content */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-[16px] md:px-[48px] py-8">
        
        <div className="flex justify-between items-end mb-[32px]">
          <div>
            <h1 className="text-[32px] font-bold text-primary">My Crops</h1>
            <p className="text-[16px] text-on-surface-variant mt-1">Manage your current active harvest.</p>
          </div>
          <AddCropButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {crops.map((crop) => {
            const planted = new Date(crop.datePlanted).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const expected = new Date(crop.expectedHarvest).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const totalDays = new Date(crop.expectedHarvest).getTime() - new Date(crop.datePlanted).getTime();
            const passedDays = Date.now() - new Date(crop.datePlanted).getTime();
            let progress = Math.min(100, Math.max(0, Math.round((passedDays / totalDays) * 100)));
            
            // Override progress based on stage
            if (crop.stage === 'HARVESTED') progress = 100;
            
            const harvestDue = crop.stage !== 'HARVESTED' && Date.now() > new Date(crop.expectedHarvest).getTime();

            // Dummy image for crops without specific images in this version
            const image = 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80';
            
            return (
              <Link href={`/farmer/crops/${crop.id}`} key={crop.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(27,67,50,0.04)] hover:shadow-[0_12px_32px_rgba(27,67,50,0.08)] transition-shadow duration-300 flex flex-col group relative">
                <div className="h-48 w-full relative overflow-hidden">
                  <Image src={image} alt={crop.cropName} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4">
                    <CropStageBadge stage={crop.stage.toLowerCase() as any} />
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-[20px] font-semibold text-primary mb-1">{crop.cropName}</h3>
                  <p className="text-sm text-on-surface-variant mb-4">{crop.variety || 'Standard Variety'}</p>
                  
                  <div className="flex flex-col gap-3 mt-auto">
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Planted</span>
                      <span className="font-medium text-on-background">{planted}</span>
                    </div>
                    
                    {harvestDue ? (
                      <div className="flex justify-between text-sm text-[#F57F17] font-medium bg-[#FFF8E1] -mx-2 px-2 py-1 rounded-md">
                        <span>Harvest Due</span>
                        <span>{expected}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-sm">
                        <span className="text-on-surface-variant">Harvest</span>
                        <span className="font-medium text-on-background">{crop.stage === 'HARVESTED' ? 'Harvested' : expected}</span>
                      </div>
                    )}

                    <div className="mt-2 pt-4 border-t border-surface-variant">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[12px] font-semibold tracking-wider text-on-surface-variant uppercase">PROGRESS</span>
                        <span className={`text-[12px] font-semibold ${crop.stage === 'SEEDLING' ? 'text-[#1565C0]' : crop.stage === 'GROWING' ? 'text-primary' : crop.stage === 'READY_TO_HARVEST' ? 'text-[#F57F17]' : 'text-on-surface-variant'}`}>
                          {progress}%
                        </span>
                      </div>
                      <CropProgressBar progress={progress} stage={crop.stage.toLowerCase() as any} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* ADD NEW CROP placeholder card */}
          <div className="bg-surface-variant/30 rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-8 text-center hover:bg-surface-variant/50 transition-colors min-h-[350px]">
            <AddCropButton />
            <p className="text-sm text-on-surface-variant max-w-[200px] mt-4">Expand your inventory by registering a new crop cycle.</p>
          </div>

        </div>

      </main>
      
      {/* Mobile bottom nav */}
      <FarmerBottomNav activePage="crops" />
    </div>
  );
}

