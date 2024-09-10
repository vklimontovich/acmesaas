import { typedRoute } from "@/lib/server/route-helpers";
import { z } from "zod";
import { getUser, verifyTeamAccess } from "@/lib/server/security-context";
import { prisma } from "@/lib/server/prisma";
import { requireDefined } from "@/lib/shared/preconditions";
import { SubscriptionStatus } from "@/lib/schema/billing";
import { getCurrentSubscription, setupStripeWebhook } from "@/lib/server/stripe";
import { serverEnv } from "@/lib/server/server-env";
import Stripe from "stripe";

async function getProduct(
  stripe: Stripe,
  productOrId: string | Stripe.Product | Stripe.DeletedProduct
): Promise<Stripe.Product> {
  if (typeof productOrId === "string") {
    return await stripe.products.retrieve(productOrId);
  } else {
    if (productOrId.deleted) {
      throw new Error(`Product ${productOrId.id} is deleted`);
    }
    return productOrId;
  }
}

export const GET = typedRoute(
  {
    query: z.object({
      teamId: z.string(),
    }),
    returns: SubscriptionStatus,
  },
  async ({ query }) => {
    if (!serverEnv.STRIPE_SECRET_KEY) {
      const result: SubscriptionStatus = { isFree: true, billingEnabled: false };
      return result;
    }

    await setupStripeWebhook();
    const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY);

    const user = requireDefined(await getUser(), `Not authenticated`);
    const team = requireDefined(
      await prisma.team.findUnique({ where: { id: query.teamId } }),
      `Team ${query.teamId} not found`
    );
    await verifyTeamAccess(user, team.id);

    const subscription = await getCurrentSubscription(team.id);
    const stripeSettings = {
      publishableKey: requireDefined(serverEnv.STRIPE_PUBLISHIBLE_KEY, `STRIPE_PUBLISHIBLE_KEY is not defined`),
      pricingTable: requireDefined(serverEnv.STRIPE_PRICING_TABLE_ID, `STRIPE_PRICING_TABLE_ID is not defined`),
    };

    if (!subscription) {
      const result: SubscriptionStatus = { isFree: true, billingEnabled: true, stripeSettings };

      return result;
    }

    const result: SubscriptionStatus = {
      isFree: false,
      billingEnabled: true,
      stripeSettings,
      subscription: {
        id: subscription.id,
        product: {
          name: (await getProduct(stripe, subscription.items.data[0].price.product)).name,
        },
        expiresAt: new Date(subscription.current_period_end * 1000).toISOString(),
        startedAt: new Date(subscription.start_date * 1000).toISOString(),
        pastDue: subscription.status === "past_due",
        cancelsAtPeriodEnd: subscription.cancel_at_period_end,
      },
    };
    return result;
  }
);
