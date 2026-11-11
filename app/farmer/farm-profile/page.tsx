import { redirect } from 'next/navigation';
import FarmerHeader from '@/components/farmer/FarmerHeader';
import FarmerBottomNav from '@/components/farmer/FarmerBottomNav';
import DesktopSidebarNav from '@/components/farmer/DesktopSidebarNav';
import FarmProfileClient from '@/components/farmer/FarmProfileClient';
import { getFarmProfileAction, getFarmerDashboardStatsAction } from '@/app/actions/farm';
import { getActivitiesAction } from '@/app/actions/activities';

export const dynamic = 'force-dynamic';

export default async function FarmProfilePage() {
  const [farmProfile, stats, activities] = await Promise.all([
    getFarmProfileAction(),
    getFarmerDashboardStatsAction(),
    getActivitiesAction(),
  ]);

  if (!farmProfile) {
    redirect('/auth/login');
  }

  const userName = farmProfile.user?.name || 'Farmer';
  const avatarUrl = farmProfile.user?.avatarUrl;

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-24 md:pb-0 flex md:flex-row flex-col w-full max-w-full">
      {/* Mobile Header */}
      <FarmerHeader variant="default" userName={userName} avatarUrl={avatarUrl} />

      {/* Desktop Sidebar */}
      <DesktopSidebarNav activePage="profile" />

      {/* Main Content */}
      <main className="flex-1 min-w-0 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <FarmProfileClient
          farmProfile={farmProfile}
          products={farmProfile.products as any}
          crops={farmProfile.crops as any}
          activities={activities as any}
          stats={stats}
        />
      </main>

      {/* Mobile Bottom Nav */}
      <FarmerBottomNav activePage="profile" />
    </div>
  );
}
