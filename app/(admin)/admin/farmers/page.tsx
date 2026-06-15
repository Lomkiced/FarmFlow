import { getFarmersAction } from '@/app/actions/admin';
import FarmersClient from '@/components/admin/FarmersClient';

export const dynamic = 'force-dynamic';

export default async function FarmersDirectoryPage() {
  // Fetch farmers without pagination limit for the directory (or implement pagination in the future)
  const { farmers } = await getFarmersAction(undefined, 1, 100);

  const formattedFarmers = farmers.map((f) => ({
    ...f,
    location: `${f.barangay}, ${f.municipality}, ${f.province}`,
  }));

  return (
    <FarmersClient initialFarmers={formattedFarmers} />
  );
}
