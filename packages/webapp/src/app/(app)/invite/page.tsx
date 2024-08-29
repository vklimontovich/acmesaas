import { getUser } from "@/lib/server/security-context";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/server/prisma";
import { requireDefined } from "@/lib/shared/preconditions";
import { SumbitButton } from "@/components/submit-button";

export default async function InvitationPage({ searchParams }: { searchParams: any }) {
  const user = await getUser();
  const code = searchParams["code"] as string;
  if (!code) {
    throw new Error("Invitation code not set");
  }
  if (!user) {
    return redirect(`/auth?redirect=${encodeURIComponent(`/invite?code=${code}`)}&fromInvitation=true`);
  }

  const invitation = requireDefined(
    await prisma.teamInvitation.findFirst({
      where: { code },
      include: { team: true, invitedByUser: true },
    }),
    `Invitation code ${code} not found`
  );

  if (invitation.usedByUserId) {
    throw new Error("Invitation already used");
  }

  if (invitation.invitedByUser.id === user.id) {
    throw new Error("You cannot accept your own invitation");
  }

  const handleSubmit = async () => {
    "use server";
    await prisma.teamInvitation.update({
      where: { id: invitation.id },
      data: {
        usedByUserId: user.id,
      },
    });
    await prisma.membership.create({
      data: {
        role: "member",
        teamId: invitation.teamId,
        userId: user.id,
      },
    });
    return redirect(`/${invitation.team.slug}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-xl mb-4">
          <b className="font-bold">
            <u>{invitation.invitedByUser.email}</u>
          </b>{" "}
          invited you to join <b className="font-bold">{invitation.team.name}</b> team
        </h1>
        <p className="mb-6">Do you want to accept?</p>
        <form action={handleSubmit} className="flex justify-center">
          <SumbitButton type="primary" htmlType="submit" className="w-full">
            Accept
          </SumbitButton>
        </form>
      </div>
    </div>
  );
}
