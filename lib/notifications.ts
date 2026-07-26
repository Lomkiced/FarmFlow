import { prisma } from '@/lib/prisma';
import type { NotificationType } from '@prisma/client';

export type SendNotificationParams = {
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: 'user' | 'farmer' | 'farm' | 'order' | 'product' | 'payment';
};

/**
 * Creates a system notification for the admin inbox (recipientId = null).
 * Fire-and-forget: never breaks the main flow.
 */
export async function sendAdminNotification(params: SendNotificationParams) {
  try {
    await prisma.notification.create({
      data: {
        recipientId: null, // Admin-only
        type: params.type,
        title: params.title,
        message: params.message,
        relatedId: params.relatedId,
        relatedType: params.relatedType,
      },
    });
  } catch (error) {
    console.error('[sendAdminNotification] Failed to create notification:', error);
  }
}

/**
 * Creates a notification targeted to a specific farmer/user (recipientId = userId).
 * Fire-and-forget: never breaks the main flow.
 */
export async function sendFarmerNotification(
  userId: string,
  params: SendNotificationParams
) {
  if (!userId) return;
  try {
    await prisma.notification.create({
      data: {
        recipientId: userId,
        type: params.type,
        title: params.title,
        message: params.message,
        relatedId: params.relatedId,
        relatedType: params.relatedType,
      },
    });
  } catch (error) {
    console.error('[sendFarmerNotification] Failed to create notification:', error);
  }
}
