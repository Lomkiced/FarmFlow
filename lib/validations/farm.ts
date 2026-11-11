import { z } from 'zod';
import { AGOO_BARANGAYS, type AgooBarangay } from '@/lib/constants/locations';

export { AGOO_BARANGAYS, type AgooBarangay };

export const FARMING_PRACTICE_OPTIONS = [
  'Organic Farming',
  'Natural Composting',
  'Drip Irrigation',
  'Crop Rotation',
  'Integrated Pest Management',
  'Greenhouse Cultivation',
  'Hydroponics',
  'Rainfed Farming',
] as const;

export const farmSchema = z.object({
  farmName: z.string().min(2, 'Farm name must be at least 2 characters.').trim(),
  barangay: z.enum(AGOO_BARANGAYS, {
    error: 'Please select a valid Agoo barangay.',
  }),
  municipality: z.string().trim().min(2).default('Agoo'),
  province: z.string().trim().min(2).default('La Union'),
  landArea: z.coerce
    .number({ message: 'Land area must be a number.' })
    .positive('Land area must be greater than 0 hectares.'),
  bio: z.string().max(500, 'Bio must be at most 500 characters.').trim().optional().nullable(),
  practices: z.array(z.string().trim().min(1)).max(12).optional(),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  phone: z.string().trim().max(30).optional().nullable(),
});

export type FarmFormValues = z.infer<typeof farmSchema>;
