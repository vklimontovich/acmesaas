import Stripe from "stripe";
import { requireDefined } from "@/lib/shared/preconditions";
import { getOrigin } from "@/lib/server/route-helpers";
import { brand } from "@/lib/content/branding";
import { prisma } from "@/lib/server/prisma";
import { serverEnv } from "@/lib/server/server-env";

export function getStripeId(obj: string | { id: string }) {
  return typeof obj === "string" ? obj : obj.id;
}

function hasProduct(s: Stripe.Subscription, productIds: string[]) {
  for (const item of s.items.data) {
    const productId = getStripeId(item.price.product);
    if (productIds.includes(productId)) {
      return true;
    }
  }
  return false;
}

const productIds = serverEnv.STRIPE_PRODUCT_IDS?.split(",");

export function getStripe() {
  return new Stripe(requireDefined(serverEnv.STRIPE_SECRET_KEY, `env STRIPE_SECRET_KEY not defined`));
}

export async function setupStripeWebhook() {
  const stripe = getStripe();
  const webhooks = await stripe.webhookEndpoints.list({ limit: 100 });
  const url = `${serverEnv.STRIPE_WEBHOOK_ORIGIN || getOrigin()}/api/billing/webhook`;
  const eventTypes: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "checkout.session.completed",
  ];
  const existingWebhook = webhooks.data.find(webhook => webhook.url === url);

  if (!existingWebhook) {
    await stripe.webhookEndpoints.create({
      url,
      enabled_events: eventTypes,
    });
  } else {
    await stripe.webhookEndpoints.update(existingWebhook.id, {
      enabled_events: eventTypes,
    });
  }
}

export async function getCurrentSubscription(teamId: string) {
  const stripe = getStripe();
  const billing = await prisma.teamBilling.findFirst({ where: { teamId } });

  if (!billing) {
    return undefined;
  }

  const subscription = await stripe.subscriptions.retrieve(billing.stripeSubscriptionId);
  if (!subscription) {
    console.error(`Subscription ${billing.stripeSubscriptionId} for team ${teamId} is not find in stripe`);
    return undefined;
  }
  if (subscription.status === "canceled") {
    return undefined;
  }
  return subscription;
}
