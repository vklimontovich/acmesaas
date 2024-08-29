import { z } from "zod";

export const SubscriptionStatus = z.union([
  z.object({
    isFree: z.boolean(),
    billingEnabled: z.boolean(),
    subscription: z.never().optional(),
  }),
  z.object({
    isFree: z.boolean(),
    subscription: z.object({
      id: z.string(),
      product: z.object({}),
      expiresAt: z.string(),
      startedAt: z.string(),
      cancelsAtPeriodEnd: z.boolean(),
    }),
  }),
]);
