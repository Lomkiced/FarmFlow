import { z } from 'zod';

export const activitySchema = z.object({
  activityType: z.string().min(1, 'Activity type is required.'),
  description: z.string().trim().optional(),
  inputsUsed: z.string().trim().optional(),
  quantity: z.coerce.number().positive().optional(),
  unit: z.string().trim().optional(),
  activityDate: z.coerce.date({ message: 'Invalid activity date.' }),
  cropId: z.string().uuid().optional(),
});

export const ACTIVITY_TYPES = [
  'Planting',
  'Watering',
  'Fertilizing',
  'Pesticide Application',
  'Weeding',
  'Harvesting',
  'Soil Preparation',
  'Pruning',
  'Transplanting',
  'Other',
] as const;

export type ActivityFormValues = z.infer<typeof activitySchema>;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
