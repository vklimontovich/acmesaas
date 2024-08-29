import { LoginSignupForm } from "@/components/login-signup-form";
import { prisma } from "@/lib/server/prisma";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/server/security-context";

export default async function AuthPage({searchParams}: {searchParams: any}) {
  const user = await getUser(); //(1)
  if (user) {
    if (searchParams.redirect) {
      return redirect(searchParams.redirect);
    }
    const team = await prisma.membership.findFirst({
      where: { userId: user.id },
      select: { team: { select: { slug: true, id: true } } },
    });
    if (team) {
      return redirect(`/${team.team.slug}`);
    } else {
      return redirect("/teams/new");
    }
  }
  return (
    <div>
      <LoginSignupForm title={searchParams.fromInvitation ? "Please sign up to accept invitation" : undefined} />
    </div>
  );
}
