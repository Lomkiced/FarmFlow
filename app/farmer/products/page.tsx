import FarmerHeader from '@/components/farmer/FarmerHeader';
import FarmerBottomNav from '@/components/farmer/FarmerBottomNav';
import ProductsClient from '@/components/farmer/ProductsClient';
import { getFarmerProductsAction } from '@/app/actions/products';
import { getFarmProfileAction } from '@/app/actions/farm';

export default async function FarmerProductsPage() {
  const [products, farmProfile] = await Promise.all([
    getFarmerProductsAction(),
    getFarmProfileAction(),
  ]);

  const userName = farmProfile?.user?.name || 'Farmer';
  const avatarUrl = farmProfile?.user?.avatarUrl;

  return (
    <>
      <FarmerHeader variant="default" userName={userName} avatarUrl={avatarUrl} />
      <main className="w-full px-[16px] flex-1 flex flex-col gap-[32px] pt-[16px] pb-24">
        <div className="mb-2">
          <h1 className="text-[28px] font-bold text-primary tracking-tight">Products Management</h1>
          <p className="text-on-surface-variant mt-1">Manage your active marketplace listings, update stock, or list new harvests.</p>
        </div>
        <ProductsClient products={products} />
      </main>
      <FarmerBottomNav activePage="products" />
    </>
  );
}
