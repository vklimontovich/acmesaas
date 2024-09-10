import React from "react";
import { Button } from "antd";
import { ChevronLeft } from "lucide-react";
import { brand } from "@/lib/content/branding";
import { getUser } from "@/lib/server/security-context";
import { redirect } from "next/navigation";
import { AuthButton } from "@/components/auth-button";
import { serverEnv } from "@/lib/server/server-env";
import Link from "next/link";

const SignIn: React.FC<{ searchParams: any }> = async ({ searchParams }) => {
  const user = await getUser();
  if (user) {
    return redirect(searchParams.redirect || "/app");
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-background relative">
      <div className="absolute top-4 left-4">
        <Button
          className="flex items-center gap-1 text-sm font-medium text-foreground px-4 py-2 rounded"
          size="large"
          href="/"
          icon={<ChevronLeft />}
          type="text"
          ghost
        >
          Back
        </Button>
      </div>
      <div className="w-full max-w-md space-y-8 text-center px-4 py-24">
        <h1 className="text-3xl font-bold text-primary">{brand.serviceName}</h1>
        <div className="border border-foreground-disabled rounded p-6 bg-background-light">
          <h2 className="text-2xl font-semibold text-foreground">
            {searchParams.fromInvitation ? "Please sign in to accept invitation" : "Welcome back"}
          </h2>
          <p className="mt-1 text-foreground-light font-lighter">Sign in to your account</p>
          {serverEnv.GOOGLE_OAUTH_CLIENT_ID && <AuthButton type="google" className="mt-6" />}
          {serverEnv.GITHUB_CLIENT_ID && <AuthButton type="github" className=" mt-4" />}
          <div className="flex items-center justify-center mt-4 text-sm text-foreground">
            <span>Don{"'"}t have an account?</span>
            <Link
              href={{
                pathname: "/signup",
                query: searchParams,
              }}
              className="ml-1 text-primary hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
