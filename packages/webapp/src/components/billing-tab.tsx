import { getCurrentSubscription, getStripe, setupStripeWebhook } from "@/lib/server/stripe";
import StripePricingTable from "@/components/stripe-pricing-table";
import { assertDefined, assertTrue, requireDefined } from "@/lib/shared/preconditions";
import Stripe from "stripe";
import dayjs from "dayjs";
import clsx from "clsx";
import { Ban, CreditCard, Download, Settings } from "lucide-react";
import Link from "next/link";
import React from "react";
import { serverEnv } from "@/lib/server/server-env";

export const BillingTab: React.FC<{ teamId: string }> = async p => {
  await setupStripeWebhook();
  const subscription = await getCurrentSubscription(p.teamId);
  if (subscription) {
    const stripe = getStripe();
    const productOrId = subscription.items.data[0]?.plan.product;
    assertDefined(productOrId, `Product not found in subscription ${subscription.id}`);
    const _product =
      typeof productOrId === "string"
        ? requireDefined(await stripe.products.retrieve(productOrId), `Product ${productOrId} does not exist`)
        : productOrId;
    assertTrue(!_product.deleted, `Product ${_product.id} is deleted`);
    const product = _product as Stripe.Product;
    if (subscription) {
      return (
        <div>
          <div className="border border-background-dark rounded-b">
            <div className="mx-6 py-4 border-b border-background-dark flex justify-between items-center">
              <h2 className="text-2xl font-bold">{product.name} Plan</h2>
              <div className="flex items-center gap-2">
                <div
                  className={clsx(
                    "",
                    subscription.cancel_at_period_end ? "text-foreground-warning" : "text-foreground-light"
                  )}
                >
                  {subscription.cancel_at_period_end ? "Cancels on" : "Renews on"}
                </div>
                <div className="bg-foreground text-background-light px-2 font-semibold py-0.5 text-sm rounded-full">
                  {dayjs(subscription.current_period_end * 1000).format("MMM D, YYYY")}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 mx-6 py-4">
              <Link href={`/api/billing/link?teamId=${p.teamId}`} className="flex flex-nowrap gap-2 items-center">
                <Settings /> Manage Subscription
              </Link>
              <Link href={`/api/billing/link?teamId=${p.teamId}`} className="flex flex-nowrap gap-2 items-center">
                <Download /> Download Invoices
              </Link>
              <Link
                href={`/api/billing/link?teamId=${p.teamId}&type=payment_method_update`}
                className="flex flex-nowrap gap-2 items-center"
              >
                <CreditCard /> Change Payment Method
              </Link>
            </div>
          </div>
          <div className="flex justify-end pt-4 mr-2 ">
            <Link
              href={`/api/billing/link?teamId=${p.teamId}&type=subscription_cancel`}
              className="text-sm flex flex-nowrap gap-1 items-center text-foreground-error"
            >
              <Ban className="w-3.5 h-3.5" /> Cancel Subscription
            </Link>
          </div>
        </div>
      );
    }
  }
  const pricingTableId = requireDefined(serverEnv.STRIPE_PRICING_TABLE_ID, `STRIPE_PRICING_TABLE_ID is not set`);
  const stripePublicKey = requireDefined(serverEnv.STRIPE_PUBLISHIBLE_KEY, `STRIPE_PUBLISHIBLE_KEY is not set`);
  return <StripePricingTable pricingTableId={pricingTableId} publishableKey={stripePublicKey} teamId={p.teamId} />;
};
