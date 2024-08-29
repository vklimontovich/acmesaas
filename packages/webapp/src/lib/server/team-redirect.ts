import { User } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { redirect } from "next/navigation";

export async function getStartingUrl(user: User, opts?: { searchParams?: any }) {
  if (opts?.searchParams.redirect) {
    return opts?.searchParams.redirect;
  }
  const team = await prisma.membership.findFirst({
    where: { userId: user.id, team: { deletedAt: null } },
    select: { team: { select: { slug: true, id: true } } },
  });
  if (team) {
    return `/${team.team.slug}`;
  } else {
    return "/teams/new";
  }
}
