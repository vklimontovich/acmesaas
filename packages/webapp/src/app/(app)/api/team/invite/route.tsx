import { typedRoute } from "@/lib/server/route-helpers";
import { requireDefined } from "@/lib/shared/preconditions";
import { getUser, verifyTeamAccess } from "@/lib/server/security-context";
import { prisma } from "@/lib/server/prisma";
import { Invitation, InvitationResponse } from "@/lib/schema/invitation";
import { nanoid } from "nanoid";
import { z } from "zod";
import { sendEmail } from "@/lib/server/email";
import { brand } from "@/lib/shared/branding";
import { InviteEmail } from "@/components/emails/invite-email";

export const POST = typedRoute(
  {
    body: Invitation,
    returns: InvitationResponse.required(),
  },
  async ({ body }) => {
    const user = requireDefined(await getUser(), `Not authorized`);
    const team = requireDefined(await prisma.team.findFirst({ where: { id: body.teamId, deletedAt: null } }), `Team ${body.teamId} not found`);
    await verifyTeamAccess(user, team.id);
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
    await sendEmail({
      to: body.email,
      subject: `You're invited to join ${team.name || team.slug} on ${brand.serviceName}`,
      component: <></>,

    })
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
    const invitation = requireDefined(await prisma.teamInvitation.findFirst({ where: { id: query.invitationId, usedByUserId: null } }), `Invitation ${query.invitationId} not found`);
    const team = requireDefined(await prisma.team.findFirst({ where: { id: invitation.teamId } }), `Team ${invitation.teamId} not found`);
    await verifyTeamAccess(user, team.id);
    await prisma.teamInvitation.delete({ where: { id: invitation.id } });
  }
);
