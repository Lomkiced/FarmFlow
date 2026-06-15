import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters.').trim(),
  category: z.string().min(1, 'Please select a category.').trim(),
  description: z.string().trim().optional(),
  pricePerKg: z.coerce
    .number({ message: 'Price must be a number.' })
    .positive('Price must be greater than ₱0.')
    .multipleOf(0.01, 'Price can have at most 2 decimal places.'),
  stockKg: z.coerce
    .number({ message: 'Stock must be a number.' })
    .positive('Stock must be greater than 0.')
    .multipleOf(0.1, 'Stock can have at most 1 decimal place.'),
  harvestDate: z.coerce.date().optional(),
  deliveryAvail: z.boolean().default(false),
  cropId: z.string().uuid('Invalid crop reference.').optional(),
  // photos are handled separately via the upload action — stored as URLs
  photos: z.array(z.string().url()).default([]),
});

export const updateProductStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'PENDING_REVIEW', 'REMOVED']),
});

export const PRODUCT_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Grains & Rice',
  'Root Crops',
  'Herbs & Spices',
  'Legumes',
  'Leafy Greens',
  'Other',
] as const;

export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];