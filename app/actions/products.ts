'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireFarmer } from '@/lib/dal';
import { productSchema } from '@/lib/validations/product';
import { sendAdminNotification } from '@/lib/notifications';
import type { ActionState } from './crops';

// ─── Get Farm Products (Farmer's Own Listings) ────────────────────────────────

export async function getFarmerProductsAction() {
  const { farmId } = await requireFarmer();

  const products = await prisma.product.findMany({
    where: { farmId },
    orderBy: { createdAt: 'desc' },
    include: {
      crop: { select: { cropName: true } },
      _count: { select: { orderItems: true } },
    },
  });

  return products;
}

// ─── Get Single Product (with ownership check) ────────────────────────────────

export async function getFarmerProductAction(productId: string) {
  const { farmId } = await requireFarmer();

  const product = await prisma.product.findFirst({
    where: { id: productId, farmId },
    include: {
      crop: { select: { id: true, cropName: true, variety: true } },
    },
  });

  return product;
}

// ─── Create Product ───────────────────────────────────────────────────────────

export async function createProductAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { farmId } = await requireFarmer();

  // Parse photo URLs — sent as JSON array string from client
  let photoUrls: string[] = [];
  const photosRaw = formData.get('photos');
  if (photosRaw && typeof photosRaw === 'string') {
    try {
      photoUrls = JSON.parse(photosRaw) as string[];
    } catch {
      photoUrls = [];
    }
  }

  const raw = {
    name: formData.get('name'),
    category: formData.get('category'),
    description: formData.get('description') || undefined,
    pricePerKg: formData.get('pricePerKg'),
    stockKg: formData.get('stockKg'),
    harvestDate: formData.get('harvestDate') || undefined,
    deliveryAvail: formData.get('deliveryAvail') === 'true',
    cropId: formData.get('cropId') || undefined,
    photos: photoUrls,
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const product = await prisma.product.create({
      data: {
        farmId,
        name: parsed.data.name,
        category: parsed.data.category,
        description: parsed.data.description,
        pricePerKg: parsed.data.pricePerKg,
        stockKg: parsed.data.stockKg,
        harvestDate: parsed.data.harvestDate,
        deliveryAvail: parsed.data.deliveryAvail,
        cropId: parsed.data.cropId,
        photos: parsed.data.photos,
        status: 'PENDING_REVIEW', // All new listings need admin approval
      },
    });

    revalidatePath('/farmer/products');
    revalidatePath('/farmer/dashboard');

    sendAdminNotification({
      type: 'NEW_LISTING',
      title: 'New Product Listing',
      message: `${parsed.data.name} was submitted and is pending your review.`,
      relatedId: product.id,
      relatedType: 'product',
    });

    return {
      success: true,
      message: 'Product submitted for review! It will go live once approved.',
      data: { id: product.id },
    };
  } catch (err) {
    console.error('[createProduct]', err);
    return { success: false, error: 'Failed to create product. Please try again.' };
  }
}

// ─── Update Product ───────────────────────────────────────────────────────────

export async function updateProductAction(
  productId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { farmId } = await requireFarmer();

  const existing = await prisma.product.findFirst({ where: { id: productId, farmId } });
  if (!existing) return { success: false, error: 'Product not found.' };

  // Parse updated photo URLs
  let photoUrls: string[] = existing.photos;
  const photosRaw = formData.get('photos');
  if (photosRaw && typeof photosRaw === 'string') {
    try {
      photoUrls = JSON.parse(photosRaw) as string[];
    } catch {
      photoUrls = existing.photos;
    }
  }

  const raw = {
    name: formData.get('name'),
    category: formData.get('category'),
    description: formData.get('description') || undefined,
    pricePerKg: formData.get('pricePerKg'),
    stockKg: formData.get('stockKg'),
    harvestDate: formData.get('harvestDate') || undefined,
    deliveryAvail: formData.get('deliveryAvail') === 'true',
    cropId: formData.get('cropId') || undefined,
    photos: photoUrls,
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: parsed.data.name,
        category: parsed.data.category,
        description: parsed.data.description,
        pricePerKg: parsed.data.pricePerKg,
        stockKg: parsed.data.stockKg,
        harvestDate: parsed.data.harvestDate,
        deliveryAvail: parsed.data.deliveryAvail,
        cropId: parsed.data.cropId,
        photos: parsed.data.photos,
        // Re-submit for review if price or stock changes
        status: 'PENDING_REVIEW',
      },
    });

    revalidatePath('/farmer/products');
    revalidatePath(`/products/${productId}`);

    return { success: true, message: 'Product updated and resubmitted for review.' };
  } catch (err) {
    console.error('[updateProduct]', err);
    return { success: false, error: 'Failed to update product.' };
  }
}

// ─── Delete Product ───────────────────────────────────────────────────────────

export async function deleteProductAction(productId: string): Promise<ActionState> {
  const { farmId } = await requireFarmer();

  const existing = await prisma.product.findFirst({ where: { id: productId, farmId } });
  if (!existing) return { success: false, error: 'Product not found.' };

  // Safety check: can't delete if there are open orders for this product
  const openOrders = await prisma.orderItem.count({
    where: {
      productId,
      order: { orderStatus: { in: ['PENDING', 'CONFIRMED', 'READY'] } },
    },
  });

  if (openOrders > 0) {
    return {
      success: false,
      error: `This product has ${openOrders} open order(s). Wait for them to be fulfilled before deleting.`,
    };
  }

  try {
    await prisma.product.delete({ where: { id: productId } });

    revalidatePath('/farmer/products');
    revalidatePath('/products');

    return { success: true, message: 'Product deleted successfully.' };
  } catch (err) {
    console.error('[deleteProduct]', err);
    return { success: false, error: 'Failed to delete product.' };
  }
}

// ─── Update Stock ─────────────────────────────────────────────────────────────

export async function updateProductStockAction(
  productId: string,
  stockKg: number
): Promise<ActionState> {
  const { farmId } = await requireFarmer();

  if (stockKg < 0) return { success: false, error: 'Stock cannot be negative.' };

  const existing = await prisma.product.findFirst({ where: { id: productId, farmId } });
  if (!existing) return { success: false, error: 'Product not found.' };

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { stockKg },
    });

    revalidatePath('/farmer/products');

    return { success: true, message: `Stock updated to ${stockKg} kg.` };
  } catch (err) {
    console.error('[updateProductStock]', err);
    return { success: false, error: 'Failed to update stock.' };
  }
}
