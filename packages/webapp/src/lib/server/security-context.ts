import { getServerAuthSession } from "@/lib/server/next-auth";
import { cache } from "react";
import { Membership, Team, User } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { requireDefined } from "@/lib/shared/preconditions";
import { newId } from "@/lib/shared/id";

async function _getUser(): Promise<User | undefined> {
  //console.debug("Obtaining user from a session for a first time. Subsequent calls will be cached if possible");
  const session = await getServerAuthSession();
  if (!session?.user) {
    return undefined;
  }
  const userId = requireDefined((session?.user as any)?.id, "Invalid session, there's no user id");
  return requireDefined(
    await prisma.user.findFirst({
      where: {
        id: userId,
      },
    }),
    `User with id ${userId} does not exist`
  );
}

export async function getOrCreateUser(opts: {
  provider: string;
  providerAccountId: string;
  email: string;
  name?: string;
}): Promise<User> {
  const user = await prisma.user.findFirst({
    where: {
      provider: opts.provider,
      providerAccountId: opts.providerAccountId,
    },
  });
  if (user) {
    return user;
  }
  const existingEmail = await prisma.user.findFirst({ where: { email: opts.email } });
  if (existingEmail) {
    throw new Error(
      `Account with email ${opts.email} already exists. It has been registered with \`${existingEmail.provider}\` provider. Please sign in with that provider.`
    );
  }
  return prisma.user.create({
    data: {
      id: "user_" + newId(),
      provider: opts.provider,
      providerAccountId: opts.providerAccountId,
      email: opts.email,
      name: opts.name,
    },
  });
}

export const getUser = cache(_getUser);

export async function verifyTeamAccess(userOrId: User | string, teamId: string, requiredRole?: string) {
  const user =
    typeof userOrId === "string"
      ? requireDefined(await prisma.user.findFirst({ where: { id: userOrId } }), `User ${userOrId} not found`)
      : userOrId;
  const membership = await prisma.membership.findFirst({ where: { userId: user.id, teamId }, select: { role: true } });
  if (!membership) {
    throw new Error(`User ${user.id} does not have access to team ${teamId}`);
  }
  if (requiredRole && membership.role !== requiredRole) {
    throw new Error(`User ${user.id} does not have required role ${requiredRole} in team ${teamId}`);
  }
}

export async function verifyAuth(teamId: string): Promise<{ user: User; team: Team; membership: Membership }> {
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
