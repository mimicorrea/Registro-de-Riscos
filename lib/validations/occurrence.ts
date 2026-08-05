import { z } from 'zod';
import { CATEGORIES, SEVERITIES } from '@/lib/enums';

export const createOccurrenceSchema = z.object({
  title: z.string().trim().min(3, 'Título muito curto').max(200),
  description: z.string().trim().min(10, 'Descrição muito curta').max(10000),
  category: z.enum(CATEGORIES),
  severity: z.enum(SEVERITIES),
  locationId: z
    .union([z.string().uuid(), z.null(), z.literal('')])
    .optional()
    .transform((v) => (v && v !== '' ? v : null)),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        label: z.string().max(200).optional(),
      })
    )
    .max(5)
    .optional(),
});

export const createAnonymousOccurrenceSchema = createOccurrenceSchema.extend({
  contact: z
    .string()
    .trim()
    .max(200)
    .nullable()
    .optional()
    .transform((v) => (v && v !== '' ? v : null)),
});

export const updateStatusSchema = z.object({
  status: z.enum(['OPEN', 'REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  note: z.string().trim().min(5).max(5000),
});

export const createCommentSchema = z.object({
  content: z.string().trim().min(5).max(5000),
});

export const assigneeSchema = z.object({
  assigneeId: z.preprocess(
    (val) => (val === '' || val === undefined ? null : val),
    z.string().uuid().nullable()
  ),
  note: z.string().trim().max(500).optional(),
});

export const dueDateSchema = z.object({
  dueDate: z.string().datetime().nullable(),
});

export const uploadImageSchema = z.object({
  imageBase64: z.string().min(100).max(10 * 1024 * 1024),
});
