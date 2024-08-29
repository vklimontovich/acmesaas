"use server";
import { prisma } from "@/lib/server/prisma";
import { TeamAccessEditorUserProps, TeamAccessEditorView } from "@/components/team-access-editor-view";

export const TeamAccessEditor: React.FC<{ userId: string; teamId: string }> = async props => {
  const users = await prisma.user.findMany({ where: { memberships: { some: { teamId: props.teamId } } } });
  const invitations = await prisma.teamInvitation.findMany({ where: { teamId: props.teamId, usedByUserId: null } });
  const rows = [
    ...users.map(
      u =>
        ({
          email: u.email,
          userId: u.id,
          self: u.id === props.userId,
          status: "active",
        }) as TeamAccessEditorUserProps
    ),
    ...invitations.map(
      i =>
        ({
          email: i.email,
          self: false,
          status: "invited",
          invitationCode: i.code,
          invitationId: i.id,
        }) as TeamAccessEditorUserProps
    ),
  ];
  return <TeamAccessEditorView users={rows} />;
};
