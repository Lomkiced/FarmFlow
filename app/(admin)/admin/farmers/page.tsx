import { getFarmersAction } from '@/app/actions/admin';
import FarmersClient from '@/components/admin/FarmersClient';

export const dynamic = 'force-dynamic';

export default async function FarmersDirectoryPage() {
  // Fetch farmers without pagination limit for the directory (or implement pagination in the future)
  const { farmers } = await getFarmersAction(undefined, 1, 100);

  return (
    <FarmersClient initialFarmers={farmers} />
  );
}
