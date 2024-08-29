import { getOrigin, typedRoute } from "@/lib/server/route-helpers";
import { requireDefined } from "@/lib/shared/preconditions";
import { getUser, verifyTeamAccess } from "@/lib/server/security-context";
import { prisma } from "@/lib/server/prisma";
import { Invitation, InvitationResponse } from "@/lib/schema/invitation";
import { nanoid } from "nanoid";
import { z } from "zod";
import { sendEmail } from "@/lib/server/email";
import { brand } from "@/lib/content/branding";
import { InviteEmail, InviteEmailProps } from "@/components/emails/invite-email";
import { Membership, Team, User } from "@prisma/client";

async function verifyAuth(teamId: string): Promise<{ user: User; team: Team; membership: Membership }> {
  const user = requireDefined(await getUser(), `Not authorized`);
  const team = requireDefined(
    await prisma.team.findFirst({ where: { id: teamId, deletedAt: null }, include: { memberships: true } }),
    `Team ${teamId} not found`
  );
  const memberships = team.memberships.filter(m => m.userId === user.id);
  if (memberships.length === 0) {
    throw new Error(`User ${user.email} (${user.id}) a member of team ${team.slug} (${team.id})`);
  }
  if (memberships.length > 1) {
    console.warn(`User ${user.email} (${user.id}) has multiple memberships in team ${team.slug} (${team.id})`);
  }
  const membership = memberships[0];

  return { user, team, membership };
}

export const POST = typedRoute(
  {
    body: Invitation,
    returns: InvitationResponse.required(),
  },
  async ({ body }) => {
    const { user, team } = await verifyAuth(body.teamId);
    const code = nanoid(32).toLowerCase();
    const id = `inv_${nanoid()}`;
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
  }
);

export const DELETE = typedRoute(
  {
    query: z.object({
      invitationId: z.string(),
    }),
  },
  async ({ query }) => {
    const user = requireDefined(await getUser(), `Not authorized`);
    const invitation = requireDefined(
      await prisma.teamInvitation.findFirst({ where: { id: query.invitationId, usedByUserId: null } }),
      `Invitation ${query.invitationId} not found`
    );
    const team = requireDefined(
      await prisma.team.findFirst({ where: { id: invitation.teamId } }),
      `Team ${invitation.teamId} not found`
    );
    await verifyTeamAccess(user, team.id);
    await prisma.teamInvitation.delete({ where: { id: invitation.id } });
  }
);
