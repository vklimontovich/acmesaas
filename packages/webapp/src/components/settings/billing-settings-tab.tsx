import StripePricingTable from "@/components/stripe-pricing-table";
import dayjs from "dayjs";
import clsx from "clsx";
import { Ban, CreditCard, Download, Settings } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";
import axios from "axios";
import { SubscriptionStatus } from "@/lib/schema/billing";
import { Skeleton } from "antd";
import { InlineError } from "@/components/errors/inline-error";
import { useTeamPageContext } from "@/components/team-page";

export const BillingSettingsTab: React.FC<{}> = p => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<any>();
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<SubscriptionStatus | undefined>();
  const { team } = useTeamPageContext();
  useEffect(() => {
    axios
      .get(`/api/billing?teamId=${team.id}`)
      .then(data => setSubscriptionStatus(data.data))
      .catch(e => setError(e))
      .finally(() => setLoading(false));
  }, [team.id]);
  if (loading) {
    return <Skeleton title={false} paragraph={{ rows: 10, width: "100%" }} />;
  } else if (error) {
    return <InlineError error={error} title="Error loading billing information" />;
  } else if (!subscriptionStatus) {
    return <InlineError error={error} title="Subscription not found" />;
  }

  if (!subscriptionStatus.isFree) {
    if (subscriptionStatus.subscription) {
      return (
        <div>
          <div className="border border-background-dark rounded-b">
            <div className="mx-6 py-4 border-b border-background-dark flex justify-between items-center">
              <h2 className="text-2xl font-bold">{subscriptionStatus.subscription.product.name} Plan</h2>
              <div className="flex items-center gap-2">
                <div
                  className={clsx(
                    "",
                    subscriptionStatus.subscription.cancelsAtPeriodEnd
                      ? "text-foreground-warning font-bold"
                      : "text-foreground-light"
                  )}
                >
                  {subscriptionStatus.subscription.cancelsAtPeriodEnd ? "Cancels on" : "Renews on"}
                </div>
                <div className="bg-foreground text-background-light px-2 font-semibold py-0.5 text-sm rounded-full">
                  {dayjs(subscriptionStatus.subscription.expiresAt).format("MMM D, YYYY")}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 mx-6 py-4">
              <Link href={`/api/billing/link?teamId=${team.id}`} className="flex flex-nowrap gap-2 items-center">
                <Settings /> Manage Subscription
              </Link>
              <Link href={`/api/billing/link?teamId=${team.id}`} className="flex flex-nowrap gap-2 items-center">
                <Download /> Download Invoices
              </Link>
              <Link
                href={`/api/billing/link?teamId=${team.id}&type=payment_method_update`}
                className="flex flex-nowrap gap-2 items-center"
              >
                <CreditCard /> Change Payment Method
              </Link>
            </div>
          </div>
          <div className="flex justify-end pt-4 mr-2 ">
            {!subscriptionStatus.subscription.cancelsAtPeriodEnd && (
              <Link
                href={`/api/billing/link?teamId=${team.id}&type=subscription_cancel`}
                className="text-sm flex flex-nowrap gap-1 items-center text-foreground-error"
              >
                <Ban className="w-3.5 h-3.5" /> Cancel Subscription
              </Link>
            )}
          </div>
        </div>
      );
    }
  } else if (subscriptionStatus.isFree && !subscriptionStatus.billingEnabled) {
    return (
      <div>
        <div className="border border-background-dark rounded-b">
          <div className="mx-6 py-4 border-b border-background-dark flex justify-between items-center">
            <h2 className="text-2xl font-bold">Billing Disabled</h2>
          </div>
          <div className="flex flex-col gap-2 mx-6 py-4">
            <p className="text-foreground-light">
              Billing is disabled for this team. Please contact support if you believe this is an error.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="border border-background-dark rounded-b">
        <div className="mx-6 py-4 border-b border-background-dark flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your are on the FREE Plan</h2>
        </div>
        <div className="flex flex-col gap-2 mx-6 py-4">
          <p className="text-center text-xl text-foreground-light my-6">
            Please upgrade to a paid plan to unlock more features.
          </p>
          <div className="border py-12 px-4 rounded">
            <StripePricingTable
              pricingTableId={subscriptionStatus.stripeSettings.pricingTable}
              publishableKey={subscriptionStatus.stripeSettings.publishableKey}
              teamId={team.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
