import React, { PropsWithChildren } from "react";
import { ChevronsUpDown, LogOut, Settings, Telescope } from "lucide-react";
import { getUser, verifyOrgAccess } from "@/lib/server/security-context";
import Link from "next/link";
import { assertDefined, requireDefined } from "@/lib/shared/preconditions";
import { NavigationButton } from "@/components/navigation-link";
import { prisma } from "@/lib/server/prisma";
import { restoreOrgContext } from "@/lib/server/page-context";

const minW = "900px";
const sidebarW = "200px";

const OrganizationSwitcher: React.FC<{ orgName: string }> = ({ orgName }) => {
  return (
    <Link
      href={"/org/list"}
      className="flex gap-2 justify-between w-full hover:bg-primary-bg-dark rounded-lg px-3 py-2 items-center"
    >
      <div className="flex flex-nowrap items-center justify-start gap-2">
        <div className="bg-primary text-primary-bg-light rounded-xl w-8 h-8 flex justify-center items-center">
          {orgName[0]}
        </div>
        <div className="overflow-ellipsis whitespace-nowrap text-sm">
          {orgName.length > 10 ? orgName.slice(0, 10 - 3) + "..." : orgName}
        </div>
      </div>
      <ChevronsUpDown className={"h-6 w-6 grow"} />
    </Link>
  );
};

export default async function AppLayout(p: PropsWithChildren<{ params: { org: string } }>) {
  const {
    children,
    params: { org: orgSlug },
  } = p;
  assertDefined(orgSlug, `Organization is not defined`);
  const context = await restoreOrgContext(orgSlug);
  (p.params as any).context = context;
  return (
    <main style={{ minWidth: minW, minHeight: "100vh" }} className="flex flex-col justify-start w-full">
      <section className="grow flex justify-start w-full bg-primary-bg-light">
        <div className="pr-4 flex items-stretch w-full">
          <nav
            className="pb-4 border-r bg-primary-bg flex flex-col justify-between h-screen"
            style={{ minWidth: sidebarW, width: sidebarW }}
          >
            <div>
              <div className="border-b px-2 py-3 h-20 flex items-center">
                <OrganizationSwitcher orgName={context.org.name} />
              </div>
              <div className="px-3 py-3">
                <NavigationButton href={`/${orgSlug}`} icon={<Telescope />}>
                  Overview
                </NavigationButton>
                <NavigationButton href={`/${orgSlug}/settings`} icon={<Settings />}>
                  Settings
                </NavigationButton>
              </div>
            </div>
            <div className="px-3">
              <Link href={"/logout"}>
                <NavigationButton icon={<LogOut className="w-full h-full" />}>Logout</NavigationButton>
              </Link>
            </div>
          </nav>
          <main className="flex-1 h-screen overflow-y-auto pl-8 pr-4 py-4">{children}</main>
        </div>
      </section>
    </main>
  );
}
