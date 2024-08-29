"use client";

import { AuthConditionalContent } from "@/components/signup-link";
import { brand } from "@/lib/content/branding";
import Link from "next/link";

export const LandingPage = () => {
  return (
    <div>
      <div className="mx-auto max-w-4xl flex flex-col items-center " style={{ minHeight: "calc(100vh - 4rem)" }}>
        <h1 className="text-5xl md:text-6xl  my-12 text-center font-bold text-primary px-12 leading-snug md:leading-relaxed">
          Solve all your problems with <span className="font-extrabold">{brand.serviceName}</span>
        </h1>
        <p className="text-center leading-7 px-12">
          Join the millions of companies of all sizes who use {brand.serviceName} to solve all kind of problems. Say
          goodbye to everyday stress and hello to a better way of running your business.
        </p>
        <div className="my-12">
          <Link
            href="/app"
            className="bg-primary px-6 py-4 text-background text-xl md:text-2xl font-semibold rounded-lg hover:scale-110 block transition-all duration-200"
          >
            <AuthConditionalContent authenticated={"Open App"}>Sign up</AuthConditionalContent>
          </Link>
        </div>
      </div>
      <div className="px-12 flex justify-center items-center" style={{ height: "4rem" }}>
        <div className="flex justify-center gap-4">
          <Link href="/terms" className="text-foreground-light underline font-light hover:font-normal text-sm">
            Terms of service
          </Link>
          <Link href="/privacy" className="text-foreground-light underline font-light hover:font-normal text-sm">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};
