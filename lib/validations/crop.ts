import { z } from 'zod';

export const cropSchema = z.object({
  cropName: z.string().min(2, 'Crop name must be at least 2 characters.').trim(),
  variety: z.string().trim().optional(),
  datePlanted: z.coerce.date({ message: 'Invalid date planted.' }),
  expectedHarvest: z.coerce.date({ message: 'Invalid expected harvest date.' }),
  areaSqm: z.coerce
    .number({ message: 'Area must be a number.' })
    .positive('Area must be greater than 0.'),
  stage: z.enum(['SEEDLING', 'GROWING', 'READY_TO_HARVEST', 'HARVESTED']).default('SEEDLING'),
  notes: z.string().trim().optional(),
}).refine(
  (data) => data.expectedHarvest > data.datePlanted,
  { message: 'Expected harvest must be after the planting date.', path: ['expectedHarvest'] }
);

export const updateCropStageSchema = z.object({
  stage: z.enum(['SEEDLING', 'GROWING', 'READY_TO_HARVEST', 'HARVESTED']),
  actualHarvest: z.coerce.date().optional(),
  notes: z.string().trim().optional(),
});

export type CropFormValues = z.infer<typeof cropSchema>;
export type UpdateCropStageValues = z.infer<typeof updateCropStageSchema>;
