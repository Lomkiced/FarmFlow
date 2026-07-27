import { getBuyersAction } from '@/app/actions/admin';
import BuyerDirectoryClient from '@/components/admin/BuyerDirectoryClient';


export const dynamic = 'force-dynamic';

export default async function BuyersDirectoryPage() {
  const result = await getBuyersAction();
  
  if (!result.success || !result.data) {
    return (
      <div className="flex-1 bg-[#FAFAF7] p-8 font-['Inter']">
        <div className="max-w-[1600px] mx-auto bg-white p-8 rounded-2xl border border-red-100 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            Error Loading Directory
          </h1>
          <p className="text-gray-700">{result.error || 'Failed to fetch buyers.'}</p>
          <p className="text-sm text-gray-500 mt-4">Tip: If you recently added the Buyer Directory, ensure you have run <code className="bg-gray-100 px-1 py-0.5 rounded">npx prisma db push</code> on your database.</p>
        </div>
      </div>
    );
  }

  return (
    <BuyerDirectoryClient initialBuyers={result.data} />
  );
}
