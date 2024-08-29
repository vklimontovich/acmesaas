import { getOrigin, typedRoute } from "@/lib/server/route-helpers";
import { z } from "zod";
import { getStripe } from "@/lib/server/stripe";
import { assertDefined, requireDefined } from "@/lib/shared/preconditions";
import { getUser, verifyTeamAccess } from "@/lib/server/security-context";
import { prisma } from "@/lib/server/prisma";
import { NextResponse } from "next/server";

export const GET = typedRoute(
  {
    query: z.object({
      teamId: z.string(),
    }),
  },
  async ({ query }) => {
    const user = requireDefined(await getUser(), `Not authenticated`);
    const team = requireDefined(
      await prisma.team.findUnique({ where: { id: query.teamId } }),
      `Team ${query.teamId} not found`
    );
    await verifyTeamAccess(user, team.id);

    const stripe = await getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: "setup",
      currency: "usd",
      success_url: `${getOrigin()}/${team.slug}/settings`,
    });
    console.log(`Created checkout session ${checkoutSession.id}: ${checkoutSession.url}`);
    assertDefined(checkoutSession.url, `Stripe checkout session url is not defined`);
    return NextResponse.redirect(checkoutSession.url, { status: 303 });
  }
);
