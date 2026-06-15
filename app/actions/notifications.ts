'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/dal';
import type { ActionState } from './crops';

export async function getAdminNotificationsAction(page = 1, pageSize = 20) {
  await requireAdmin();

  const [notifications, unreadCount, totalCount] = await Promise.all([
    prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where: { isRead: false } }),
    prisma.notification.count(),
  ]);

  return { notifications, unreadCount, totalCount };
}

export async function getTopUnreadNotificationsAction() {
  await requireAdmin();

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.notification.count({ where: { isRead: false } }),
  ]);

  return { notifications, unreadCount };
}

export async function markNotificationReadAction(id: string): Promise<ActionState> {
  await requireAdmin();
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath('/admin');
    return { success: true, message: 'Notification marked as read.' };
  } catch (error) {
    return { success: false, error: 'Failed to mark notification.' };
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionState> {
  await requireAdmin();
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    revalidatePath('/admin');
    return { success: true, message: 'All notifications marked as read.' };
  } catch (error) {
    return { success: false, error: 'Failed to mark notifications.' };
  }
}

export async function deleteAllReadNotificationsAction(): Promise<ActionState> {
  await requireAdmin();
  try {
    const unreadCount = await prisma.notification.count({ where: { isRead: false } });
    if (unreadCount > 0) {
      return { success: false, error: 'Cannot delete until all notifications are read.' };
    }

    await prisma.notification.deleteMany({
      where: { isRead: true },
    });
    revalidatePath('/admin');
    return { success: true, message: 'All notifications deleted.' };
  } catch (error) {
    return { success: false, error: 'Failed to delete notifications.' };
  }
}
