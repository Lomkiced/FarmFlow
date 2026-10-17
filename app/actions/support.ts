'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/dal';
import { sendAdminNotification } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';

const supportInquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').trim(),
  email: z.string().email('Please enter a valid email address.').trim().toLowerCase(),
  phone: z.string().trim().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters.').max(150).trim(),
  message: z.string().min(10, 'Message must be at least 10 characters.').max(2000).trim(),
});

export type SupportInquiryValues = z.infer<typeof supportInquirySchema>;

export async function submitSupportInquiryAction(raw: SupportInquiryValues) {
  const parsed = supportInquirySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Please fix the errors in your form.',
    };
  }

  try {
    const inquiry = await prisma.supportInquiry.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject,
        message: parsed.data.message,
        status: 'OPEN',
      },
    });

    // Notify administrators
    sendAdminNotification({
      type: 'SUPPORT_INQUIRY',
      title: '📩 New Customer Support Inquiry',
      message: `${parsed.data.name} (${parsed.data.email}): "${parsed.data.subject}"`,
      relatedId: inquiry.id,
      relatedType: 'user',
    });

    revalidatePath('/admin/inbox');

    return {
      success: true,
      message: 'Thank you! Your message has been sent. Our support team will reply within 1-2 business days.',
    };
  } catch (error: any) {
    console.error('[submitSupportInquiryAction]', error);
    return {
      success: false,
      error: 'Failed to submit inquiry. Please try again later or reach out via phone.',
    };
  }
}

export async function getSupportInquiriesAction(status?: string) {
  await requireAdmin();

  try {
    const inquiries = await prisma.supportInquiry.findMany({
      where: status && status !== 'ALL' ? { status } : {},
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { success: true, inquiries };
  } catch (error) {
    console.error('[getSupportInquiriesAction]', error);
    return { success: false, inquiries: [] };
  }
}

export async function resolveSupportInquiryAction(
  inquiryId: string,
  newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' = 'RESOLVED'
) {
  await requireAdmin();

  try {
    await prisma.supportInquiry.update({
      where: { id: inquiryId },
      data: { status: newStatus },
    });

    revalidatePath('/admin/inbox');

    return { success: true, message: `Inquiry marked as ${newStatus.toLowerCase()}.` };
  } catch (error) {
    console.error('[resolveSupportInquiryAction]', error);
    return { success: false, error: 'Failed to update inquiry status.' };
  }
}
