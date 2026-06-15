import FarmerHeader from '@/components/farmer/FarmerHeader';
import AddProductClient from '@/components/farmer/AddProductClient';
import { getCropsAction } from '@/app/actions/crops';

export default async function AddProductPage() {
  const crops = await getCropsAction();
  
  const cropOptions = crops.map(c => ({ id: c.id, cropName: c.cropName }));

  return (
    <>
      <FarmerHeader variant="back" />
      <main className="max-w-[800px] mx-auto px-[16px] md:px-[48px] py-[32px] pb-32 w-full">
        <div className="mb-[32px]">
          <h2 className="text-[24px] font-semibold text-on-background">List a Product for Sale</h2>
          <p className="text-[16px] text-on-surface-variant">Provide details about your harvest to attract premium buyers.</p>
        </div>

        <AddProductClient crops={cropOptions} />
      </main>
    </>
  );
}
