import { getOrigin, typedRoute } from "@/lib/server/route-helpers";
import { z } from "zod";
import { requireDefined } from "@/lib/shared/preconditions";
import { getUser, verifyTeamAccess } from "@/lib/server/security-context";
import { prisma } from "@/lib/server/prisma";
import { getStripe } from "@/lib/server/stripe";
import { NextResponse } from "next/server";

export const GET = typedRoute(
  {
    query: z.object({
      teamId: z.string(),
      type: z.string().optional(),
    }),
  },
  async ({ query }) => {
    const user = requireDefined(await getUser(), "Not authenticated");
    const team = requireDefined(
      await prisma.team.findUnique({ where: { id: query.teamId } }),
      `Team ${query.teamId} not found`
    );
    await verifyTeamAccess(user, team.id);
    const billing = requireDefined(
      await prisma.teamBilling.findFirst({ where: { teamId: query.teamId } }),
      `No active billing found for team ${query.teamId}`
    );
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: billing.stripeCustomerId,
      return_url: `${getOrigin()}/${team.slug}/settings?section=billing`,
      flow_data: {
        type: query.type as any,
        subscription_cancel:
          query.type === "subscription_cancel" ? { subscription: billing.stripeSubscriptionId } : undefined,
      },
    });
    return NextResponse.redirect(session.url);
  }
);
