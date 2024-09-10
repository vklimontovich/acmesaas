import React, { PropsWithChildren } from "react";
import { ChevronsUpDown, LogOut, Settings, Telescope, Unplug } from "lucide-react";
import Link from "next/link";
import { assertDefined } from "@/lib/shared/preconditions";
import { NavigationButton } from "@/components/navigation-link";
import { restoreTeamContext } from "@/lib/server/team-page-context";
import { TeamPage } from "@/components/team-page";

const minW = "900px";
const sidebarW = "200px";

const TeamSwitcher: React.FC<{ teamName: string }> = ({ teamName }) => {
  return (
    <Link
      href={"/teams"}
      className="flex gap-2 justify-between w-full hover:bg-background-dark rounded-lg px-3 py-2 items-center"
    >
      <div className="flex flex-nowrap items-center justify-start gap-2 grow">
        <div className="bg-primary text-background-light rounded-xl w-8 h-8 flex justify-center items-center">
          {teamName[0]}
        </div>
        <div className="overflow-ellipsis whitespace-nowrap text-sm">
          {teamName.length > 10 ? teamName.slice(0, 10 - 3) + "..." : teamName}
        </div>
      </div>
      <ChevronsUpDown className={"h-6 w-6 shrink"} />
    </Link>
  );
};

export default async function AppLayout(p: PropsWithChildren<{ params: { teamSlug: string } }>) {
  const {
    children,
    params: { teamSlug },
  } = p;
  assertDefined(teamSlug, `Team is not defined`);
  const context = await restoreTeamContext(teamSlug);
  (p.params as any).context = context;
  return (
    <main style={{ minWidth: minW, minHeight: "100vh" }} className="flex flex-col justify-start w-full">
      <section className="grow flex justify-start w-full bg-background-light">
        <div className="pr-4 flex items-stretch w-full">
          <nav
            className="pb-4 border-r bg-background flex flex-col justify-between h-screen"
            style={{ minWidth: sidebarW, width: sidebarW }}
          >
            <div>
              <div className="border-b px-2 py-3 h-20 flex items-center">
                <TeamSwitcher teamName={context.team.name} />
              </div>
              <div className="px-3 py-3">
                <NavigationButton href={`/${teamSlug}`} icon={<Telescope />}>
                  Overview
                </NavigationButton>
                <NavigationButton href={`/${teamSlug}/settings`} icon={<Settings />}>
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
          <main className="flex-1 h-screen overflow-y-auto pl-8 pr-4 py-4">
            <TeamPage context={context}>{children}</TeamPage>
          </main>
        </div>
      </section>
    </main>
  );
}
