import { getUser, verifyAuth } from "@/lib/server/security-context";
import { assertDefined, requireDefined } from "@/lib/shared/preconditions";
import { prisma } from "@/lib/server/prisma";
import { TeamSettings } from "@/lib/schema/team-settings";
import { nanoid } from "nanoid";
import { objectEditRoute } from "@/lib/server/route-helpers";
import { z } from "zod";
import { getPageContext } from "@/lib/server/team-page-context";
import { newId } from "@/lib/shared/id";

const handler = objectEditRoute({
  objectType: TeamSettings,
  query: z.object({
    teamId: z.string().optional(),
  }),
  get: async ({ query }) => {
    if (!query.teamId) {
      return undefined;
    }
    const { team } = await verifyAuth(requireDefined(query.teamId, "teamId parameter is required"));
    return requireDefined(await prisma.team.findUnique({ where: { id: team.id } }), `Team ${team.id} not found`);
  },
  upsert: async ({ body, query }) => {
    const teamId = body.id || query.teamId;
    assertDefined(
      !body.id || !query.teamId || body.id === query.teamId,
      `Team id is different in the query and body. Specified: ${query.teamId}, body: ${body.id}. They should be the same, or you should use just one approach¬`
    );
    if (teamId) {
      const { team } = await verifyAuth(teamId);
      return prisma.team.update({
        where: { id: team.id },
        data: {
          name: body.name,
          slug: body.slug,
        },
      });
    } else {
      const user = requireDefined(await getUser(), `Not authenticated`);
      return prisma.team.create({
        data: {
          id: `team_${newId()}`,
          name: body.name,
          slug: body.slug,
          memberships: {
            create: {
              role: "owner",
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          },
        },
      });
    }
  },
});

export { handler as GET, handler as POST };
