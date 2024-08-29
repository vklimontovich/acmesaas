"use client";
import React, { useEffect, useState } from "react";

interface StripePricingTableProps {
  pricingTableId: string;
  publishableKey: string;
  teamId: string;
}
const StripePricingTable: React.FC<StripePricingTableProps> = ({ pricingTableId, publishableKey, teamId }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;

    script.onload = () => {
      setLoading(false);
    };

    script.onerror = () => {
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      {loading && <div>Loading...</div>}
      {!loading &&
        React.createElement("stripe-pricing-table", {
          "pricing-table-id": pricingTableId,
          "publishable-key": publishableKey,
          "client-reference-id": teamId,
        })}
    </>
  );
};

export default StripePricingTable;
