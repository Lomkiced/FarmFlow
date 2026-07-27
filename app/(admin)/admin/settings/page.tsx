import { requireAdmin } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import AdminSettingsClient from '@/components/admin/AdminSettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await requireAdmin();

  // Fetch real admin users from the database
  const adminUsers = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return <AdminSettingsClient adminUsers={adminUsers} currentUserId={session.id} />;
}
