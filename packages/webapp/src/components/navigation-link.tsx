"use client";
import React from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";

export const NavigationButton: React.FC<{ icon: React.ReactNode; children: React.ReactNode; href?: string }> = ({
  icon,
  children,
  href,
}) => {
  const pathname = usePathname();
  const content = (
    <>
      <div
        className={clsx(
          "flex flex-row flex-nowrap gap-2 items-center hover:bg-background-dark px-3 py-2 rounded-lg text-sm",
          { "text-primary": href && pathname == href }
        )}
      >
        <div className="flex items-center justify-center w-4 h-4 rounded-md">{icon}</div>
        <div className={href && pathname == href ? "font-normal" : "font-lighter"}>{children}</div>
      </div>
    </>
  );
  return href ? <Link href={href}>{content}</Link> : content;
};
