import { z } from 'zod';

export const farmSchema = z.object({
  farmName: z.string().min(2, 'Farm name must be at least 2 characters.').trim(),
  barangay: z.string().min(1, 'Please select a barangay.').trim(),
  municipality: z.string().default('Agoo'),
  province: z.string().default('La Union'),
  landArea: z.coerce
    .number({ invalid_type_error: 'Land area must be a number.' })
    .positive('Land area must be greater than 0 hectares.'),
  bio: z.string().max(500, 'Bio must be at most 500 characters.').trim().optional(),
  // coverPhoto URL is set separately after upload action
});

export const AGOO_BARANGAYS = [
  'Agoo Poblacion',
  'Ambitacay',
  'Balawarte',
  'Cataguintingan',
  'Consolacion',
  'Imelda',
  'La Union',
  'Macalva Norte',
  'Macalva Sur',
  'Nazareno',
  'Purok 1',
  'Purok 2',
  'San Cristobal',
  'San Isidro',
  'San Juan',
  'San Miguel',
  'San Nicolas Norte',
  'San Nicolas Sur',
  'San Vicente',
  'Santa Cruz',
  'Santa Monica',
  'Santiago Norte',
  'Santiago Sur',
  'Santo Rosario',
  'Sta. Barbara',
  'Sto. Tomas',
] as const;

export type FarmFormValues = z.infer<typeof farmSchema>;