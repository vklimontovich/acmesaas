import { getOrigin, typedRoute } from "@/lib/server/route-helpers";
import { requireDefined } from "@/lib/shared/preconditions";
import { getUser, verifyAuth, verifyTeamAccess } from "@/lib/server/security-context";
import { prisma } from "@/lib/server/prisma";
import { Invitation, InvitationResponse, TeamAccessEntry } from "@/lib/schema/invitation";
import { nanoid } from "nanoid";
import { z } from "zod";
import { sendEmail } from "@/lib/server/email";
import { brand } from "@/lib/content/branding";
import { InviteEmail, InviteEmailProps } from "@/components/emails/invite-email";
import { newId } from "@/lib/shared/id";

export const POST = typedRoute(
  {
    body: Invitation,
    returns: InvitationResponse.required(),
  },
  async ({ body }) => {
    const { user, team } = await verifyAuth(body.teamId);
    const code = newId(32).toLowerCase();
    const id = `invite_${newId().replace("-", "").replace("_", "")}`;
    await prisma.teamInvitation.create({
      data: {
        id,
        teamId: team.id,
        email: body.email,
        invitedByUserId: user.id,
        code,
      },
    });
    const emailProps: Required<InviteEmailProps> = {
      teamName: team.name || team.slug,
      serviceName: brand.serviceName,
      inviterName: user.name || user.email,
      acceptInviteUrl: `${getOrigin()}/invite?code=${code}`,
    };
    await sendEmail({
      to: body.email,
      subject: InviteEmail.subject(emailProps),
      component: <InviteEmail {...emailProps} />,
      plainText: InviteEmail.plainText(emailProps),
    });
    return { code, id };
  },
);

export const DELETE = typedRoute(
  {
    query: z.object({
      teamId: z.string(),
      invitationId: z.string().optional(),
      userId: z.string().optional(),
    }),
  },
  async ({ query }) => {
    const user = requireDefined(await getUser(), `Not authorized`);
    if (query.invitationId) {
      const invitation = requireDefined(
        await prisma.teamInvitation.findFirst({ where: { id: query.invitationId, usedByUserId: null } }),
        `Invitation ${query.invitationId} not found`,
      );
      const team = requireDefined(
        await prisma.team.findFirst({ where: { id: invitation.teamId } }),
        `Team ${invitation.teamId} not found`,
      );
      await verifyTeamAccess(user, team.id);
      await prisma.teamInvitation.delete({ where: { id: invitation.id } });
    } else if (query.userId) {
      await verifyTeamAccess(user, query.teamId);
      await prisma.membership.deleteMany({
        where: { teamId: query.teamId, userId:  query.userId},
      });
    } else {
      throw new Error(`userId or invitationId should be set`);
    }
  },
);

export const GET = typedRoute({
  query: z.object({
    teamId: z.string(),
  }),
  returns: z.array(TeamAccessEntry),
}, async ({ query }) => {
  await verifyAuth(query.teamId);

  const users = await prisma.user.findMany({ where: { memberships: { some: { teamId: query.teamId } } } });
  const invitations = await prisma.teamInvitation.findMany({ where: { teamId: query.teamId, usedByUserId: null } });
  const rows: TeamAccessEntry[] = [
    ...users.map(
      u =>
        ({
          status: "active",
          email: u.email,
          userId: u.id,
        }) as TeamAccessEntry,
    ),
    ...invitations.map(
      i =>
        ({
          status: "invited",
          email: i.email,
          invitationCode: i.code,
          invitationId: i.id,
          invitedByUserId: i.invitedByUserId,
        }) as TeamAccessEntry,
    ),
  ];
  return rows;

});
