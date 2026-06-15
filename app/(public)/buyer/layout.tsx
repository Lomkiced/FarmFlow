import { requireRole } from '@/lib/dal';

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure the user is a BUYER. If not, requireRole will redirect them appropriately.
  await requireRole('BUYER');

  return (
    <div className="w-full h-full flex flex-col bg-surface">
      {children}
    </div>
  );
}
