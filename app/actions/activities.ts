'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireFarmer } from '@/lib/dal';
import { activitySchema } from '@/lib/validations/activity';
import { fromZonedTime } from 'date-fns-tz';

const TZ = 'Asia/Manila';
import type { ActionState } from './crops';

// ─── Get Activities ───────────────────────────────────────────────────────────

export async function getActivitiesAction(cropId?: string) {
  const { farmId } = await requireFarmer();

  const activities = await prisma.activity.findMany({
    where: {
      farmId,
      ...(cropId ? { cropId } : {}),
    },
    orderBy: { activityDate: 'desc' },
    take: 50,
    include: {
      crop: { select: { cropName: true, variety: true } },
    },
  });

  return activities;
}

// ─── Create Activity ──────────────────────────────────────────────────────────

export async function createActivityAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { farmId } = await requireFarmer();

  const raw = {
    activityType: formData.get('activityType'),
    description: formData.get('description') || undefined,
    inputsUsed: formData.get('inputsUsed') || undefined,
    quantity: formData.get('quantity') || undefined,
    unit: formData.get('unit') || undefined,
    activityDate: formData.get('activityDate'),
    cropId: formData.get('cropId') || undefined,
  };

  const parsed = activitySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Validate cropId belongs to this farm
  if (parsed.data.cropId) {
    const crop = await prisma.crop.findFirst({
      where: { id: parsed.data.cropId, farmId },
    });
    if (!crop) {
      return { success: false, error: 'Invalid crop selected.' };
    }
  }

  try {
    await prisma.activity.create({
      data: {
        farmId,
        activityType: parsed.data.activityType,
        description: parsed.data.description,
        inputsUsed: parsed.data.inputsUsed,
        quantity: parsed.data.quantity,
        unit: parsed.data.unit,
        activityDate: fromZonedTime(parsed.data.activityDate, TZ),
        cropId: parsed.data.cropId,
      },
    });

    revalidatePath('/farmer/activities');
    revalidatePath('/farmer/dashboard');
    if (parsed.data.cropId) {
      revalidatePath(`/farmer/crops/${parsed.data.cropId}`);
    }

    return { success: true, message: 'Activity logged successfully!' };
  } catch (err) {
    console.error('[createActivity]', err);
    return { success: false, error: 'Failed to log activity. Please try again.' };
  }
}

// ─── Delete Activity ──────────────────────────────────────────────────────────

export async function deleteActivityAction(activityId: string): Promise<ActionState> {
  const { farmId } = await requireFarmer();

  const existing = await prisma.activity.findFirst({
    where: { id: activityId, farmId },
  });
  if (!existing) return { success: false, error: 'Activity not found.' };

  try {
    await prisma.activity.delete({ where: { id: activityId } });

    revalidatePath('/farmer/activities');

    return { success: true, message: 'Activity deleted.' };
  } catch (err) {
    console.error('[deleteActivity]', err);
    return { success: false, error: 'Failed to delete activity.' };
  }
}
