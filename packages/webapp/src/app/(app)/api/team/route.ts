import { getUser, verifyTeamAccess } from "@/lib/server/security-context";
import { requireDefined } from "@/lib/shared/preconditions";
import { prisma } from "@/lib/server/prisma";
import { TeamSettings } from "@/lib/schema/team-settings";
import { nanoid } from "nanoid";
import { typedRoute } from "@/lib/server/route-helpers";
import { z } from "zod";

export const DELETE = typedRoute(
  {
    query: z.object({
      userId: z.string(),
      teamId: z.string(),
    }),
  },
  async ({ query: { userId, teamId } }) => {
    const user = requireDefined(await getUser());
    await verifyTeamAccess(user, teamId);
    console.log(`Deleting user ${userId} from team ${teamId}`);
    await prisma.membership.delete({ where: { userId_teamId: { userId, teamId } } });
  }
);

export const POST = typedRoute(
  {
    body: TeamSettings,
    returns: TeamSettings.required(),
  },
  async ({ body }) => {
    const user = requireDefined(await getUser(), `Not authenticated`);
    if (!body.id && (await prisma.team.count({ where: { slug: requireDefined(body.slug) } })) != 0) {
      throw new Error(`Team with this slug ${body.slug} already exists. Please pick another slug`);
    }
    const exstingTeam = body.id
      ? requireDefined(
          await prisma.team.findFirst({ where: { id: body.id, deletedAt: null } }),
          `Team ${body.id} not found`
        )
      : undefined;
    if (exstingTeam) {
      await verifyTeamAccess(user, exstingTeam.id);
      return prisma.team.update({
        where: { id: exstingTeam.id },
        data: {
          name: body.name,
          slug: body.slug,
        },
      });
    } else {
      return prisma.team.create({
        data: {
          id: `team_${nanoid()}`,
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
  }
);
