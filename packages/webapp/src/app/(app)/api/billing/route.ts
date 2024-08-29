import { typedRoute } from "@/lib/server/route-helpers";
import { z } from "zod";
import Stripe from "stripe";
import { getUser, verifyTeamAccess } from "@/lib/server/security-context";
import { prisma } from "@/lib/server/prisma";
import { requireDefined } from "@/lib/shared/preconditions";
import { SubscriptionStatus } from "@/lib/schema/billing";
import { getCurrentSubscription, getStripeId } from "@/lib/server/stripe";
import { serverEnv } from "@/lib/server/server-env";

// Now you can use SubscriptionStatus to validate your data.

export const GET = typedRoute(
  {
    query: z.object({
      teamId: z.string(),
    }),
    returns: SubscriptionStatus,
  },
  async ({ query }) => {
    if (!serverEnv.STRIPE_SECRET_KEY) {
      return { isFree: true, billingEnabled: false };
    }

    const user = requireDefined(await getUser(), `Not authenticated`);
    const team = requireDefined(
      await prisma.team.findUnique({ where: { id: query.teamId } }),
      `Team ${query.teamId} not found`
    );
    await verifyTeamAccess(user, team.id);

    const subscription = await getCurrentSubscription(team.id);

    if (!subscription) {
      return { isFree: true, billingEnabled: true };
    }

    return {
      isFree: false,
      subscription: {
        id: subscription.id,
        product: requireDefined(
          subscription.items.data[0].price.product,
          `Subscription ${subscription.id} has no product`
        ),
        expiresAt: new Date(subscription.current_period_end).toISOString(),
        startedAt: new Date(subscription.start_date).toISOString(),
        pastDue: subscription.status === "past_due",
        cancelsAtPeriodEnd: subscription.cancel_at_period_end,
      },
    };
  }
);
