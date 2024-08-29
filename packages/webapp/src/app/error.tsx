"use client";
import React from "react";
import { Button } from "antd";
import { CircleX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const ErrorPage: React.FC<{ error: Error & { digest?: string } }> = ({ error }) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center p-8 rounded-md w-3/4 max-w-xl">
        <div className="flex items-center justify-center mb-4 text-foreground-error">
          <CircleX size={64} />
        </div>
        <h1 className="text-2xl font-bold text-foreground-error mb-2">Error</h1>
        <p className="text-gray-800 mb-4">{error.message || "Unknown error"}</p>
        {error.digest && (
          <p className="text-gray-700 mb-4 text-sm">
            Digest: <span className="font-mono">{error.digest}</span>
          </p>
        )}
        <div className="flex flex-col items-center gap-1">
          <Button type="primary" onClick={handleReload} size="large">
            Reload Page
          </Button>
          <div className="flex py-6 my-6 border-t">
            <Button key="main" href="/" type="link" size="small">
              Go to Main Page
            </Button>
            <Button key="back" type="link" onClick={handleGoBack} size="small">
              Go Back
            </Button>
            <Button key="logout" href="/logout" type="link" size="small">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
