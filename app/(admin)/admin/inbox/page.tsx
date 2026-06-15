import { requireAdmin } from '@/lib/dal';
import { getAdminNotificationsAction } from '@/app/actions/notifications';
import InboxClient from '@/components/admin/InboxClient';

export const metadata = {
  title: 'Notifications Inbox | Admin | FarmFlow',
  description: 'Manage system notifications and alerts',
};

export default async function AdminInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  // We fetch a generous amount for the inbox, or we could handle pagination fully in the client
  // For now, let's fetch top 100 to allow client-side filtering to work well
  const { notifications, unreadCount } = await getAdminNotificationsAction(currentPage, 100);

  return (
    <div className="p-4 md:p-8">
      <InboxClient 
        initialNotifications={notifications} 
        unreadCount={unreadCount} 
      />
    </div>
  );
}
