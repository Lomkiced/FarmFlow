import { getAllListingsAction } from '@/app/actions/admin';
import ListingsClient from '@/components/admin/ListingsClient';

export const dynamic = 'force-dynamic';

export default async function ListingModerationPage() {
  const { products } = await getAllListingsAction(1, 100);

  return (
    <ListingsClient initialListings={products as any} />
  );
}
