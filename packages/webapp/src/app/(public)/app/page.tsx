import { prisma } from "@/lib/server/prisma";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/server/security-context";

export default async function AuthPage({ searchParams }: { searchParams: any }) {
  const user = await getUser();
  if (user) {
    if (searchParams.redirect) {
      return redirect(searchParams.redirect);
    }
    const team = await prisma.membership.findFirst({
      where: { userId: user.id, team: { deletedAt: null } },
      select: { team: { select: { slug: true, id: true } } },
    });
    if (team) {
      return redirect(`/${team.team.slug}`);
    } else {
      return redirect("/teams/new");
    }
  } else {
    redirect("/signin");
  }
}
