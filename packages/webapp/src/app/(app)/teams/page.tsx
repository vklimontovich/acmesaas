import { getUser } from "@/lib/server/security-context";
import { prisma } from "@/lib/server/prisma";
import Link from "next/link";
import { Button, Tag } from "antd";
import { ArrowRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { requireDefined } from "@/lib/shared/preconditions";

export default async function CreateNewTeamPage() {
  const user = requireDefined(await getUser(), `Not authenticated`);
  const teams = user.admin
    ? await prisma.team.findMany({ where: { deletedAt: null } })
    : await prisma.team.findMany({ where: { deletedAt: null, memberships: { some: { userId: user.id } } } });
  if (teams.length === 0) {
    return (
      <div className="flex justify-center items-center pt-12">
        <div>
          You don{"'"} have any teams yet.{" "}
          <Link className="font-semibold underline" href={"/teams/new"}>
            Create a new team
          </Link>{" "}
          or{" "}
          <Link className="font-semibold underline" href={"/logout"}>
            logout
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 max-w-4xl py-12">
      <PageHeader
        description={"Create and manage teams"}
        actions={
          <>
            <Button type="primary" href="/teams/new" size="large" icon={<Plus />}>
              New
            </Button>
          </>
        }
      >
        My teams
      </PageHeader>
      <div className="flex flex-col gap-2 mt-12">
        {teams.map(({ id, name, slug }) => (
          <Link
            className="border border-foreground-disabled rounded px-4 py-4 shadow hover:border-primary hover:shadow-primary-disabled flex justify-between items-center hover:text-foregroundPrimary group"
            key={slug}
            href={`/${slug}`}
          >
            <div className="flex items-center justify-start gap-2">
              <div>{name}</div>
              <div className="text-foreground-light">/{slug}</div>
              <Tag className="text-xs text-foreground-light">{id}</Tag>
            </div>
            <div className="invisible group-hover:visible">
              <ArrowRight className="text-primary" />
            </div>
          </Link>
        ))}
      </div>
      <div className="text-center text-sm pt-12 text-primary underline">
        <Link href={"/logout"}>Logout</Link>
      </div>
    </div>
  );
}
