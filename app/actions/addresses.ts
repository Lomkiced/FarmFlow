'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/dal';
import { addressSchema } from '@/lib/validations/address';
import type { ActionState } from './crops';

// ─── Get Addresses ────────────────────────────────────────────────────────────

export async function getAddressesAction() {
  const user = await requireAuth();

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return addresses;
}

// ─── Create Address ───────────────────────────────────────────────────────────

export async function createAddressAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireAuth();

  const raw = {
    label: formData.get('label') || undefined,
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    street: formData.get('street'),
    barangay: formData.get('barangay'),
    city: formData.get('city'),
    province: formData.get('province'),
    zipCode: formData.get('zipCode') || undefined,
    isDefault: formData.get('isDefault') === 'true',
  };

  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    // If setting as default, unset previous defaults first
    if (parsed.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: parsed.data.label,
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        street: parsed.data.street,
        barangay: parsed.data.barangay,
        city: parsed.data.city,
        province: parsed.data.province,
        zipCode: parsed.data.zipCode,
        isDefault: parsed.data.isDefault,
      },
    });

    revalidatePath('/checkout');

    return {
      success: true,
      message: 'Address saved successfully!',
      data: { id: address.id },
    };
  } catch (err) {
    console.error('[createAddress]', err);
    return { success: false, error: 'Failed to save address. Please try again.' };
  }
}

// ─── Update Address ───────────────────────────────────────────────────────────

export async function updateAddressAction(
  addressId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireAuth();

  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
  });
  if (!existing) return { success: false, error: 'Address not found.' };

  const raw = {
    label: formData.get('label') || undefined,
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    street: formData.get('street'),
    barangay: formData.get('barangay'),
    city: formData.get('city'),
    province: formData.get('province'),
    zipCode: formData.get('zipCode') || undefined,
    isDefault: formData.get('isDefault') === 'true',
  };

  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    if (parsed.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    await prisma.address.update({
      where: { id: addressId },
      data: {
        label: parsed.data.label,
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        street: parsed.data.street,
        barangay: parsed.data.barangay,
        city: parsed.data.city,
        province: parsed.data.province,
        zipCode: parsed.data.zipCode,
        isDefault: parsed.data.isDefault,
      },
    });

    revalidatePath('/checkout');

    return { success: true, message: 'Address updated successfully!' };
  } catch (err) {
    console.error('[updateAddress]', err);
    return { success: false, error: 'Failed to update address.' };
  }
}

// ─── Delete Address ───────────────────────────────────────────────────────────

export async function deleteAddressAction(addressId: string): Promise<ActionState> {
  const user = await requireAuth();

  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
  });
  if (!existing) return { success: false, error: 'Address not found.' };

  // Cannot delete address with existing orders
  const ordersUsing = await prisma.order.count({ where: { addressId } });
  if (ordersUsing > 0) {
    return {
      success: false,
      error: 'This address is linked to existing orders and cannot be deleted.',
    };
  }

  try {
    await prisma.address.delete({ where: { id: addressId } });
    revalidatePath('/checkout');
    return { success: true, message: 'Address removed.' };
  } catch (err) {
    console.error('[deleteAddress]', err);
    return { success: false, error: 'Failed to delete address.' };
  }
}

// ─── Set Default Address ──────────────────────────────────────────────────────

export async function setDefaultAddressAction(addressId: string): Promise<ActionState> {
  const user = await requireAuth();

  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
  });
  if (!existing) return { success: false, error: 'Address not found.' };

  try {
    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);

    revalidatePath('/checkout');
    return { success: true, message: 'Default address updated.' };
  } catch (err) {
    console.error('[setDefaultAddress]', err);
    return { success: false, error: 'Failed to set default address.' };
  }
}
