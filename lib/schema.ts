import { z } from 'zod';

// Loose datetime: tolerate Claude returning "2026-06-12T10:00:00" without timezone.
// Anything resembling YYYY-MM-DDTHH:MM[:SS[.ms]][Z|±HH:MM] is accepted; we
// normalize in the route handler before storing.
const looseDatetime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/);

export const ParsedTaskSchema = z.object({
  title: z.string().min(1).max(140),
  priority: z.enum(['low', 'medium', 'high']),
  estimateMin: z.number().int().min(1).max(480),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reminderAt: looseDatetime.optional().nullable(),
  project: z.string().min(1).max(40).optional().nullable(),
});

export const ParseResponseSchema = z.object({
  tasks: z.array(ParsedTaskSchema),
});

export type ParsedTask = z.infer<typeof ParsedTaskSchema>;
