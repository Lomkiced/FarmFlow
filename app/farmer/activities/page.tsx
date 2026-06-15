import FarmerHeader from '@/components/farmer/FarmerHeader';
import FarmerBottomNav from '@/components/farmer/FarmerBottomNav';
import ActivitiesClient from '@/components/farmer/ActivitiesClient';
import { getActivitiesAction } from '@/app/actions/activities';
import { getCropsAction } from '@/app/actions/crops';
import { getFarmProfileAction } from '@/app/actions/farm';

export default async function ActivitiesPage() {
  const [activities, crops, farmProfile] = await Promise.all([
    getActivitiesAction(),
    getCropsAction(),
    getFarmProfileAction(),
  ]);

  const userName = farmProfile?.user?.name || 'Farmer';
  const avatarUrl = farmProfile?.user?.avatarUrl;

  const cropOptions = crops.map(c => ({ id: c.id, cropName: c.cropName }));

  return (
    <>
      <FarmerHeader variant="default" userName={userName} avatarUrl={avatarUrl} />
      <main className="flex-1 overflow-y-auto px-[16px] pt-[16px] pb-32">
        <h1 className="text-[24px] font-semibold text-on-surface mb-[16px]">Farm Activity Log</h1>
        <ActivitiesClient activities={activities} crops={cropOptions} />
      </main>
      
      <FarmerBottomNav activePage="home" />
    </>
  );
}
