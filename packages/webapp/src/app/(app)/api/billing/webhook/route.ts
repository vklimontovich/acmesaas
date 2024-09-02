import { typedRoute } from "@/lib/server/route-helpers";
import Stripe from "stripe";
import { requireDefined } from "@/lib/shared/preconditions";
import { prisma } from "@/lib/server/prisma";
import { getStripeId } from "@/lib/server/stripe";
import { headers } from "next/headers";
import { serverEnv } from "@/lib/server/server-env";

export const POST = typedRoute({
  bodyParser: async (req) => await req.text(),
}, async ({ req, body }) => {
  const stripe = new Stripe(requireDefined(serverEnv.STRIPE_SECRET_KEY, `STRIPE_SECRET_KEY is not defined`));
  const signature = headers().get("Stripe-Signature") as string
  let event: Stripe.Event
  console.log(`Webhook received ${typeof body}: ${body}`);
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      requireDefined(serverEnv.STRIPE_WEBHOOK_SECRET, `STRIPE_WEBHOOK_SECRET is not defined`)
    )
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`, error);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
  console.log(`Event ${event.type}`, JSON.stringify(event, null, 2));
  if (event.type === "checkout.session.completed") {
    //initial subscription
    const session = event.data.object as Stripe.Checkout.Session;
    const teamId = requireDefined(session.client_reference_id, `Missing client_reference_id in event ${event.type}`);
    const subscriptionId = requireDefined(
      getStripeId(requireDefined(session.subscription, `Missing subscription in event ${event.type}`))
    );
    await prisma.teamBilling.upsert({
      where: { teamId },
      create: {
        teamId,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: getStripeId(requireDefined(session.customer, `Missing customer in event ${event.type}`)),
      },
      update: {
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: getStripeId(requireDefined(session.customer, `Missing customer in event ${event.type}`)),
      },
    });
  } else if (event.type == "customer.subscription.deleted" || event.type == "customer.subscription.updated") {
    const stripeSubscriptionId = getStripeId(event.data.object.id);
    const stripeCustomerId = getStripeId(event.data.object.customer);
    const object = await prisma.teamBilling.findFirst({ where: { stripeSubscriptionId, stripeCustomerId } });
    if (!object) {
      console.error(`No teamBilling found for subscription ${stripeSubscriptionId} and customer ${stripeCustomerId}`);
      return;
    }
    if (event.type == "customer.subscription.deleted") {
      await prisma.teamBilling.delete({ where: { id: object.id } });
    } else {
      await prisma.teamBilling.update({
        where: { id: object.id },
        data: { stripeSubscriptionId },
      });
    }
  }
});
