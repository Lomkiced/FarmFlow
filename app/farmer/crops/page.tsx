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
import { resolveCropImage } from '@/lib/constants/crop-images';
import PaginationBar from '@/components/ui/PaginationBar';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function CropsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? Math.max(1, parseInt(searchParams.page) || 1) : 1;
  const pageSize = typeof searchParams.pageSize === 'string' ? Math.min(36, Math.max(3, parseInt(searchParams.pageSize) || 6)) : 6;

  const [crops, farmProfile] = await Promise.all([
    getCropsAction(),
    getFarmProfileAction(),
  ]);

  const totalCrops = crops.length;
  const totalPages = Math.max(1, Math.ceil(totalCrops / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedCrops = crops.slice((safePage - 1) * pageSize, safePage * pageSize);

  const userName = farmProfile?.user?.name || 'Farmer';
  const avatarUrl = farmProfile?.user?.avatarUrl;

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-24 md:pb-0 flex md:flex-row flex-col w-full max-w-full">
      {/* Mobile header */}
      <FarmerHeader variant="default" userName={userName} avatarUrl={avatarUrl} />
      
      {/* Desktop sidebar */}
      <DesktopSidebarNav activePage="crops" />
      
      {/* Main content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
        
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Crop Cycles</h1>
            <p className="text-xs text-gray-500 mt-1">Manage active plantings, stage progressions, and harvest readiness.</p>
          </div>
          <AddCropButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedCrops.map((crop) => {
            const planted = new Date(crop.datePlanted).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const expected = new Date(crop.expectedHarvest).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const totalDays = new Date(crop.expectedHarvest).getTime() - new Date(crop.datePlanted).getTime();
            const passedDays = Date.now() - new Date(crop.datePlanted).getTime();
            let progress = Math.min(100, Math.max(0, Math.round((passedDays / totalDays) * 100)));
            
            // Override progress based on stage
            if (crop.stage === 'HARVESTED') progress = 100;
            
            const harvestDue = crop.stage !== 'HARVESTED' && Date.now() > new Date(crop.expectedHarvest).getTime();

            const image = resolveCropImage(crop.cropName, crop.variety);
            const estimatedYieldKg = Math.max(25, Math.round(((crop as any).areaSqm || 50) * 2.5));
            const isHarvestReady = crop.stage === 'READY_TO_HARVEST' || crop.stage === 'HARVESTED' || harvestDue;
            const listHarvestUrl = `/farmer/products/new?cropId=${encodeURIComponent(crop.id)}&cropName=${encodeURIComponent(crop.cropName)}&variety=${encodeURIComponent(crop.variety || '')}&qty=${estimatedYieldKg}`;

            return (
              <div
                key={crop.id}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-green-800 transition-colors flex flex-col group relative"
              >
                <Link href={`/farmer/crops/${crop.id}`} className="flex flex-col flex-1">
                  <div className="h-44 w-full relative overflow-hidden bg-gray-100">
                    <Image src={image} alt={crop.cropName} fill className="object-cover" sizes="(max-width: 768px) 100vw, 320px" />
                    <div className="absolute top-3 left-3">
                      <CropStageBadge stage={crop.stage.toLowerCase() as any} />
                    </div>
                    {isHarvestReady && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-green-800 text-white text-[10px] font-bold uppercase tracking-wider">
                        Ready to List
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 pb-2 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-0.5">{crop.cropName}</h3>
                    <p className="text-xs text-gray-500 mb-3">{crop.variety || 'Standard Variety'}</p>
                    
                    <div className="flex flex-col gap-2 mt-auto">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Planted</span>
                        <span className="font-semibold text-gray-900 tabular-nums">{planted}</span>
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Expected Harvest</span>
                        <span className="font-semibold text-gray-900 tabular-nums">
                          {crop.stage === 'HARVESTED' ? 'Harvested' : expected}
                        </span>
                      </div>

                      <div className="mt-2 pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">PROGRESS</span>
                          <span className="text-xs font-bold text-green-800 tabular-nums">
                            {progress}%
                          </span>
                        </div>
                        <CropProgressBar progress={progress} stage={crop.stage.toLowerCase() as any} />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* ERP Crops-to-Marketplace Pipeline Actions */}
                <div className="p-4 pt-3 flex items-center gap-2">
                  <Link
                    href={listHarvestUrl}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-center bg-green-800 hover:bg-green-900 text-white transition-colors"
                  >
                    List on Marketplace
                  </Link>
                  <Link
                    href={`/farmer/crops/${crop.id}`}
                    className="py-2 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            );
          })}

          {/* ADD NEW CROP placeholder card */}
          <div className="bg-white rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center p-8 text-center hover:bg-gray-50 transition-colors min-h-[300px]">
            <AddCropButton />
            <p className="text-xs text-gray-500 max-w-[200px] mt-3">Register a new crop cycle to begin tracking development.</p>
          </div>

        </div>

        <div className="mt-8">
          <PaginationBar
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={totalCrops}
            pageSize={pageSize}
            pageSizeOptions={[3, 6, 9, 18]}
            itemLabel="active crops"
          />
        </div>

      </main>
      
      {/* Mobile bottom nav */}
      <FarmerBottomNav activePage="crops" />
    </div>
  );
}
