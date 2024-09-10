"use client";
import { CircleX } from "lucide-react";
import { ReactNode } from "react";

export const InlineError: React.FC<{ error: string | Error | any; title: ReactNode }> = ({ error, title }) => {
  const message =
    typeof error === "string"
      ? error
      : error.message || error.error || error.response?.data?.message || error.response?.data?.error || "Unknown error";
  return (
    <div className="w-full border px-4 py-6 border-foreground-error rounded flex flex-col gap-4 items-center text-foreground-error">
      <CircleX className="text-foreground-error w-16 h-16" />
      <h1 className="font-medium">{title || "Error loading form"}</h1>
      {message && <p>{message}</p>}
    </div>
  );
};
