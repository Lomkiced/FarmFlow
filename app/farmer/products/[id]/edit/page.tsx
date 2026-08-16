import FarmerHeader from '@/components/farmer/FarmerHeader';
import EditProductClient from '@/components/farmer/EditProductClient';
import { getCropsAction } from '@/app/actions/crops';
import { getFarmerProductAction } from '@/app/actions/products';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const [product, crops] = await Promise.all([
    getFarmerProductAction(id),
    getCropsAction(),
  ]);
  
  if (!product) {
    notFound();
  }

  const cropOptions = crops.map(c => ({ id: c.id, cropName: c.cropName }));

  return (
    <>
      <FarmerHeader variant="back" />
      <main className="max-w-[800px] mx-auto px-[16px] md:px-[48px] py-[32px] pb-32 w-full">
        <div className="mb-[32px]">
          <h2 className="text-[24px] font-semibold text-on-background">Edit Listing</h2>
          <p className="text-[16px] text-on-surface-variant">Update the details, pricing, or stock of your product.</p>
        </div>

        <EditProductClient product={product} crops={cropOptions} />
      </main>
    </>
  );
}
