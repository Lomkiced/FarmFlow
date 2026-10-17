import { requireAdmin } from '@/lib/dal';
import { getAdminNotificationsAction } from '@/app/actions/notifications';
import { getSupportInquiriesAction } from '@/app/actions/support';
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

  // We fetch top notifications and support inquiries in parallel
  const [{ notifications, unreadCount }, { inquiries }] = await Promise.all([
    getAdminNotificationsAction(currentPage, 100),
    getSupportInquiriesAction(),
  ]);

  return (
    <div className="p-4 md:p-8">
      <InboxClient 
        initialNotifications={notifications} 
        unreadCount={unreadCount} 
        initialInquiries={inquiries || []}
      />
    </div>
  );
}
