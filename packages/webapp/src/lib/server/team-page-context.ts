import { requireDefined } from "@/lib/shared/preconditions";
import { getUser, verifyTeamAccess } from "@/lib/server/security-context";
import { prisma } from "@/lib/server/prisma";
import { z } from "zod";

export const TeamContextProps = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});
export type TeamContext = {
  team: z.infer<typeof TeamContextProps>;
};

export const UserContextProps = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
});

export type UserContext = { user: z.infer<typeof UserContextProps> };

export type PageContext = TeamContext & UserContext;

export async function getPageContext(p: any): Promise<PageContext> {
  if (!p.params.context) {
    p.params.context = await restoreTeamContext(requireDefined(p.params.teamSlug, "Team slug is not defined"));
  }
  const context = requireDefined(p.params.context, "Context is not defined");
  return context as PageContext;
}

export async function restoreTeamContext(teamSlug: string): Promise<PageContext> {
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
