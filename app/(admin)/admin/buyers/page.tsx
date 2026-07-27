import { getBuyersAction } from '@/app/actions/admin';
import BuyerDirectoryClient from '@/components/admin/BuyerDirectoryClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BuyersDirectoryPage() {
  const result = await getBuyersAction();
  
  if (!result.success || !result.data) {
    redirect('/admin');
  }

  return (
    <BuyerDirectoryClient initialBuyers={result.data} />
  );
}
