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
 * Creates a system notification for the admin.
 * Fire-and-forget: it catches errors internally so it never breaks the main flow.
 */
export async function sendAdminNotification(params: SendNotificationParams) {
  try {
    await prisma.notification.create({
      data: {
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
