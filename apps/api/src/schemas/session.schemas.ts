import { z } from 'zod';

export const sessionIdParams = z.object({ id: z.string().uuid() });

export const clipParams = z.object({ id: z.string().uuid(), clipId: z.string().uuid() });

export const thresholdBody = z.object({
  threshold: z.number().min(0.5).max(0.99),
});

export const decisionBody = z.discriminatedUnion('action', [
  z.object({ action: z.literal('confirm') }),
  z.object({ action: z.literal('exclude') }),
  z.object({ action: z.literal('reassign'), to: z.number().int().min(0).max(99) }),
]);
