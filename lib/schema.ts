import { z } from 'zod';

export const ParsedTaskSchema = z.object({
  title: z.string().min(1).max(140),
  priority: z.enum(['low', 'medium', 'high']),
  estimateMin: z.number().int().min(5).max(240),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reminderAt: z.string().datetime().optional().nullable(),
  project: z.string().min(1).max(40).optional().nullable(),
});

export const ParseResponseSchema = z.object({
  tasks: z.array(ParsedTaskSchema),
});

export type ParsedTask = z.infer<typeof ParsedTaskSchema>;
