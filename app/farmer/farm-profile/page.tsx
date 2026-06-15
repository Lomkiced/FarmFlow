import FarmerHeader from '@/components/farmer/FarmerHeader';
import FarmerBottomNav from '@/components/farmer/FarmerBottomNav';
import StatCard from '@/components/farmer/StatCard';
import FarmProfileClient from '@/components/farmer/FarmProfileClient';
import { getFarmProfileAction, getFarmerDashboardStatsAction } from '@/app/actions/farm';
import { getFarmerProductsAction } from '@/app/actions/products';
import { getActivitiesAction } from '@/app/actions/activities';
import { redirect } from 'next/navigation';

export default async function FarmProfilePage() {
  const [farmProfile, stats, products, activities] = await Promise.all([
    getFarmProfileAction(),
    getFarmerDashboardStatsAction(),
    getFarmerProductsAction(),
    getActivitiesAction(),
  ]);

  if (!farmProfile) {
    redirect('/auth/login');
  }

  const userName = farmProfile.user?.name || 'Farmer';
  const avatarUrl = farmProfile.user?.avatarUrl;
  
  // Calculate average rating from products if available, fallback to farm rating or 0
  const rating = farmProfile.rating ? farmProfile.rating.toFixed(1) : 'New';

  const chips = [
    { icon: 'landscape', label: `${farmProfile.landArea} Hectares` },
    { icon: 'history', label: `Farming since ${new Date(farmProfile.createdAt).getFullYear()}` },
  ];

  // Derive primary crops from active products
  const uniqueCropNames = Array.from(new Set(products.map(p => p.crop?.cropName).filter(Boolean)));
  const primaryCrops = uniqueCropNames.length > 0 ? uniqueCropNames.slice(0, 4) : ['No crops listed'];

  const profileStats = [
    { 
      icon: 'payments', 
      label: 'TOTAL SALES', 
      value: `₱${(stats.thisMonthEarnings || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}` 
    },
    { icon: 'inventory_2', label: 'PRODUCTS LISTED', value: products.length.toString() },
    { icon: 'star', label: 'RATING', value: rating, filled: true },
    { icon: 'local_shipping', label: 'TOTAL ORDERS', value: stats.pendingOrdersCount.toString() }, // Using pending for now as a placeholder, can be total lifetime orders
  ];

  return (
    <>
      <FarmerHeader variant="default" userName={userName} avatarUrl={avatarUrl} />
      <main className="pb-32">
        
        {/* Cover + Avatar */}
        <div className="relative bg-surface">
          <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80')` }} />
          <div className="px-[16px] relative -mt-12 flex items-end justify-between">
            <div className="relative">
              <img src={avatarUrl || "https://i.pravatar.cc/150?img=12"} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-surface object-cover shadow-sm bg-surface" />
              <div className="absolute bottom-1 right-1 bg-surface rounded-full p-0.5">
                <span className="material-symbols-outlined text-primary-fixed-dim text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {farmProfile.status === 'VERIFIED' ? 'verified' : 'pending_actions'}
                </span>
              </div>
            </div>
            <button className="mb-2 bg-secondary-container text-on-secondary-container text-[14px] font-medium px-4 py-2 rounded-lg hover:bg-secondary-fixed transition-colors border border-outline-variant">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="px-[16px] mt-4 space-y-[8px]">
          <h1 className="text-[32px] font-bold leading-[1.2] tracking-[-0.01em] text-on-background">{farmProfile.farmName}</h1>
          <div className="flex items-center gap-1 text-[16px] text-on-surface-variant mt-1">
            <span className="material-symbols-outlined text-outline text-[16px]">location_on</span>
            <span>{farmProfile.barangay}</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {chips.map((chip, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-high text-[12px] font-semibold tracking-[0.03em] text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">{chip.icon}</span>
                {chip.label}
              </span>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-surface-variant">
            <h3 className="text-[12px] font-semibold tracking-[0.05em] text-outline uppercase mb-2">PRIMARY CROPS</h3>
            <div className="flex flex-wrap gap-2">
               {primaryCrops.map((crop, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-[14px] font-medium border border-primary-fixed-dim">
                  {crop}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-[16px] mt-[32px] grid grid-cols-2 gap-[8px]">
          {profileStats.map((stat, idx) => (
            <StatCard key={idx} icon={stat.icon} iconBg="bg-surface-container-high" iconColor="text-primary-container" label={stat.label} value={stat.value} filled={stat.filled} />
          ))}
        </div>

        <FarmProfileClient products={products as any} activities={activities as any} />

      </main>
      <FarmerBottomNav activePage="profile" />
    </>
  );
}
