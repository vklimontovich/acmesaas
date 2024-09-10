import { requireDefined } from "@/lib/shared/preconditions";
import { getUser, verifyTeamAccess } from "@/lib/server/security-context";
import { prisma } from "@/lib/server/prisma";
import { z } from "zod";
import { TeamContextProps, TeamPageContext, UserContextProps } from "@/lib/schema/auth-context";
import { headers } from "next/headers";

export async function getPageContext(p: any): Promise<TeamPageContext> {
  if (!p.params.context) {
    p.params.context = await restoreTeamContext(requireDefined(p.params.teamSlug, "Team slug is not defined"));
  }
  const context = requireDefined(p.params.context, "Context is not defined");
  return context as TeamPageContext;
}

export async function restoreTeamContext(teamSlug: string): Promise<TeamPageContext> {
  const _user = requireDefined(await getUser(), `Not authorized`);
  const user = UserContextProps.parse(_user);
  const team = TeamContextProps.parse(
    requireDefined(
      await prisma.team.findUnique({ where: { slug: teamSlug, deletedAt: null } }),
      `Team '${teamSlug}' is not found`
    )
  );
  await verifyTeamAccess(_user, team.id);
  return { team, user };
}
