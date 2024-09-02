import { z } from "zod";
import { Simplify } from "type-fest";

export const PublishableStripeSettings = z.object({
  publishableKey: z.string(),
  pricingTable: z.string(),
})

export const SubscriptionStatus = z.union([
  z.object({
    isFree: z.literal(true),
    billingEnabled: z.literal(false),
    subscription: z.never().optional(),
    stripeSettings: z.never().optional(),
  }),
  z.object({
    isFree: z.literal(true),
    billingEnabled: z.literal(true),
    stripeSettings: PublishableStripeSettings,
    subscription: z.never().optional(),
  }),
  z.object({
    isFree: z.literal(false),
    billingEnabled: z.literal(true),
    stripeSettings: PublishableStripeSettings,
    subscription: z.object({
      id: z.string(),
      product: z.object({
        name: z.string(),
      }),
      expiresAt: z.string(),
      startedAt: z.string(),
      pastDue: z.boolean(),
      cancelsAtPeriodEnd: z.boolean(),
    }),
  }),
]);

export type SubscriptionStatus = Simplify<z.infer<typeof SubscriptionStatus>>;
