'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireFarmer } from '@/lib/dal';
import { cropSchema, updateCropStageSchema } from '@/lib/validations/crop';

// ─── Shared Action State Type ─────────────────────────────────────────────────

export type ActionState =
  | { success: true; message: string; data?: Record<string, unknown> }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Get Crops ────────────────────────────────────────────────────────────────

export async function getCropsAction() {
  const { farmId } = await requireFarmer();

  const crops = await prisma.crop.findMany({
    where: { farmId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { activities: true } },
    },
  });

  return crops;
}

// ─── Get Single Crop ──────────────────────────────────────────────────────────

export async function getCropAction(cropId: string) {
  const { farmId } = await requireFarmer();

  const crop = await prisma.crop.findFirst({
    where: { id: cropId, farmId }, // farmId ensures ownership
    include: {
      activities: {
        orderBy: { activityDate: 'desc' },
        take: 10,
      },
      products: {
        where: { status: 'ACTIVE' },
        select: { id: true, name: true, pricePerKg: true, stockKg: true },
      },
    },
  });

  if (!crop) return null;
  return crop;
}

// ─── Create Crop ──────────────────────────────────────────────────────────────

export async function createCropAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { farmId } = await requireFarmer();

  const raw = {
    cropName: formData.get('cropName'),
    variety: formData.get('variety') || undefined,
    datePlanted: formData.get('datePlanted'),
    expectedHarvest: formData.get('expectedHarvest'),
    areaSqm: formData.get('areaSqm'),
    stage: formData.get('stage') || 'SEEDLING',
    notes: formData.get('notes') || undefined,
  };

  const parsed = cropSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const crop = await prisma.crop.create({
      data: {
        farmId,
        cropName: parsed.data.cropName,
        variety: parsed.data.variety,
        datePlanted: parsed.data.datePlanted,
        expectedHarvest: parsed.data.expectedHarvest,
        areaSqm: parsed.data.areaSqm,
        stage: parsed.data.stage,
        notes: parsed.data.notes,
      },
    });

    revalidatePath('/farmer/crops');
    revalidatePath('/farmer/dashboard');

    return {
      success: true,
      message: `${parsed.data.cropName} crop added successfully!`,
      data: { id: crop.id },
    };
  } catch (err) {
    console.error('[createCrop]', err);
    return { success: false, error: 'Failed to create crop. Please try again.' };
  }
}

// ─── Update Crop ──────────────────────────────────────────────────────────────

export async function updateCropAction(
  cropId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { farmId } = await requireFarmer();

  // Verify ownership
  const existing = await prisma.crop.findFirst({ where: { id: cropId, farmId } });
  if (!existing) return { success: false, error: 'Crop not found.' };

  const raw = {
    cropName: formData.get('cropName'),
    variety: formData.get('variety') || undefined,
    datePlanted: formData.get('datePlanted'),
    expectedHarvest: formData.get('expectedHarvest'),
    areaSqm: formData.get('areaSqm'),
    stage: formData.get('stage') || existing.stage,
    notes: formData.get('notes') || undefined,
  };

  const parsed = cropSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await prisma.crop.update({
      where: { id: cropId },
      data: {
        cropName: parsed.data.cropName,
        variety: parsed.data.variety,
        datePlanted: parsed.data.datePlanted,
        expectedHarvest: parsed.data.expectedHarvest,
        areaSqm: parsed.data.areaSqm,
        stage: parsed.data.stage,
        notes: parsed.data.notes,
      },
    });

    revalidatePath('/farmer/crops');
    revalidatePath(`/farmer/crops/${cropId}`);

    return { success: true, message: 'Crop updated successfully!' };
  } catch (err) {
    console.error('[updateCrop]', err);
    return { success: false, error: 'Failed to update crop. Please try again.' };
  }
}

// ─── Update Crop Stage (Quick Action) ────────────────────────────────────────

export async function updateCropStageAction(
  cropId: string,
  formData: FormData
): Promise<ActionState> {
  const { farmId } = await requireFarmer();

  const existing = await prisma.crop.findFirst({ where: { id: cropId, farmId } });
  if (!existing) return { success: false, error: 'Crop not found.' };

  const parsed = updateCropStageSchema.safeParse({
    stage: formData.get('stage'),
    actualHarvest: formData.get('actualHarvest') || undefined,
    notes: formData.get('notes') || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: 'Invalid stage update.' };
  }

  try {
    await prisma.crop.update({
      where: { id: cropId },
      data: {
        stage: parsed.data.stage,
        actualHarvest: parsed.data.stage === 'HARVESTED'
          ? parsed.data.actualHarvest ?? new Date()
          : undefined,
      },
    });

    revalidatePath('/farmer/crops');
    revalidatePath('/farmer/dashboard');

    return { success: true, message: `Crop stage updated to ${parsed.data.stage}.` };
  } catch (err) {
    console.error('[updateCropStage]', err);
    return { success: false, error: 'Failed to update stage.' };
  }
}

// ─── Delete Crop ──────────────────────────────────────────────────────────────

export async function deleteCropAction(cropId: string): Promise<ActionState> {
  const { farmId } = await requireFarmer();

  const existing = await prisma.crop.findFirst({ where: { id: cropId, farmId } });
  if (!existing) return { success: false, error: 'Crop not found.' };

  // Soft check: if crop has active products linked, warn the farmer
  const linkedProducts = await prisma.product.count({
    where: { cropId, status: 'ACTIVE' },
  });

  if (linkedProducts > 0) {
    return {
      success: false,
      error: `This crop has ${linkedProducts} active product listing(s). Please remove or archive those first.`,
    };
  }

  try {
    await prisma.crop.delete({ where: { id: cropId } });

    revalidatePath('/farmer/crops');
    revalidatePath('/farmer/dashboard');

    return { success: true, message: 'Crop deleted successfully.' };
  } catch (err) {
    console.error('[deleteCrop]', err);
    return { success: false, error: 'Failed to delete crop.' };
  }
}
