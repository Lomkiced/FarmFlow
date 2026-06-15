import { getFarmersAction } from '@/app/actions/admin';
import FarmersClient from '@/components/admin/FarmersClient';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function FarmersDirectoryPage({ searchParams }: Props) {
  const params = await searchParams;
  const location = params.location as string | undefined;
  const dateFrom = params.dateFrom as string | undefined;
  const dateTo = params.dateTo as string | undefined;

  // Fetch farmers without pagination limit for the directory (or implement pagination in the future)
  // We pass undefined for status so the client can compute pending counts across all tabs
  const { farmers } = await getFarmersAction(undefined, 1, 100, { location, dateFrom, dateTo });

  // Map Prisma Farm model to FarmerData expected by client
  const mappedFarmers = farmers.map(f => ({
    ...f,
    location: f.barangay && f.municipality ? `${f.barangay}, ${f.municipality}` : (f.barangay || f.municipality || 'Not set'),
  }));

  const formattedFarmers = farmers.map((f) => ({
    ...f,
    location: `${f.barangay}, ${f.municipality}, ${f.province}`,
  }));

  return (
    <FarmersClient initialFarmers={formattedFarmers} />
  );
}
