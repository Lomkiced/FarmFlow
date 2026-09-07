import { z } from 'zod';
import { AGOO_BARANGAYS, type AgooBarangay } from '@/lib/constants/locations';

export { AGOO_BARANGAYS, type AgooBarangay };

export const farmSchema = z.object({
  farmName: z.string().min(2, 'Farm name must be at least 2 characters.').trim(),
  barangay: z.enum(AGOO_BARANGAYS, {
    error: 'Please select a valid Agoo barangay.',
  }),
  municipality: z.string().default('Agoo'),
  province: z.string().default('La Union'),
  landArea: z.coerce
    .number({ message: 'Land area must be a number.' })
    .positive('Land area must be greater than 0 hectares.'),
  bio: z.string().max(500, 'Bio must be at most 500 characters.').trim().optional(),
  // coverPhoto URL is set separately after upload action
});

export type FarmFormValues = z.infer<typeof farmSchema>;