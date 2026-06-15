import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/marketplace/ProductDetailClient';
import { getPublicProductAction } from '@/app/actions/search';

export default async function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await getPublicProductAction(params.id);

  if (!data) {
    notFound();
  }

  return (
    <>
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-[24px] py-[48px]">
        <ProductDetailClient 
          product={data.product} 
          relatedProducts={data.related} 
        />
      </main>
    </>
  );
}