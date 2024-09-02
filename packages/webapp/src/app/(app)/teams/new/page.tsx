import { getUser } from "@/lib/server/security-context";
import assert from "assert";
import { TeamSettingsEditor } from "@/components/settings/team-settings-editor";
import Link from "next/link";
import humanId from "human-id";
import { brand } from "@/lib/content/branding";
import { prisma } from "@/lib/server/prisma";
import { requireDefined } from "@/lib/shared/preconditions";

export default async function CreateNewTeamPage() {
  const user = requireDefined(await getUser(), `Not authenticated`);
  const hasTeams = await prisma.membership.count({ where: { userId: user.id } }) > 0;
  assert(user, "User must exist");
  return (
    <div className="flex flex-col items-center">
      <div className="py-6 flex flex-col items-center">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          {hasTeams ? "Create a new team" : "👋 Welcome to {brand.serviceName}"}
        </h2>
        <p className="mt-2 text-center text-sm text-foreground-light font-[350] max-w-[400px]">
          {hasTeams ? <></> : "We just need a few details to set up your profile and team. You can always make changes later."}
        </p>
      </div>
      <div className=" min-w-[500px] bg-background-light px-12 py-6 border border-foreground-disabled rounded">
        <TeamSettingsEditor
          buttonTitle="Finish"
          currentSettings={{
            slug: humanId({ separator: "-", capitalize: false }),
          }}
          redirect={true}
        />
      </div>
      <div className="flex flex-col items-center gap-2 text-xs mt-6">
        <Link className=" underline" href={"/teams"}>
          All teams
        </Link>
        <Link className=" underline" href={"/logout"}>
          Logout
        </Link>
      </div>
    </div>
  );
}
