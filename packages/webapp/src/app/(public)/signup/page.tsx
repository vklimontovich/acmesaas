import React from "react";
import { Button } from "antd";
import { GithubOutlined, GoogleOutlined } from "@ant-design/icons";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { getUser } from "@/lib/server/security-context";
import { redirect } from "next/navigation";
import { serverEnv } from "@/lib/server/server-env";

const SignUp: React.FC = async () => {
  const user = await getUser();
  if (user) {
    return redirect("/app");
  }
  return (
    <div className="flex min-h-screen relative">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-1 text-sm font-medium md:text-background px-4 py-2 rounded ">
          {<ChevronLeft />}
          Back
        </Link>
      </div>
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 bg-primary-dark text-background-light p-12 flex-col justify-center">
        <h1 className="text-4xl font-bold mb-4">AcmeCorp</h1>
        <p className="text-lg text-background-dark font-[300]">
          Join the millions of companies of all sizes who use AcmeCorp to solve all kinds of problems. Say goodbye to
          everyday stress and hello to a better way of running your business.
        </p>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full space-y-8">
          <h2 className="text-3xl font-semibold text-foreground text-center">Create your account</h2>
          {serverEnv.GOOGLE_OAUTH_CLIENT_ID && (
            <AuthButton
              type="google"
              className="bg-primary-dark text-background-light flex items-center justify-center mt-6"
            />
          )}
          {serverEnv.GITHUB_CLIENT_ID && (
            <AuthButton
              type="github"
              className="bg-background-dark text-foreground flex items-center justify-center mt-4"
            />
          )}
          <div className="text-sm text-foreground mt-4 text-center">
            <p>
              By signing up, you agree to our{" "}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-primary hover:underline whitespace-nowrap">
                Privacy Policy
              </a>
              .
            </p>
          </div>
          <div className="flex items-center justify-center mt-4 text-sm text-foreground">
            <span>Already have an account?</span>
            <a href="/signin" className="ml-1 text-primary hover:underline">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
