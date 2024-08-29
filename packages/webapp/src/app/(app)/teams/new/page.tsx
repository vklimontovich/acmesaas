import { getUser } from "@/lib/server/security-context";
import assert from "assert";
import { TeamSettingsEditor } from "@/components/team-settings-editor";
import Link from "next/link";
import humanId from "human-id";

export default async function CreateNewOrg() {
  const user = await getUser();
  assert(user, "User must exist");
  return (
    <div className="flex flex-col items-center">
      <div className="py-12 flex flex-col items-center">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          👋 Welcome, {user.name || user.email}!
        </h2>
        <p className="mt-2 text-center text-sm text-text-light max-w-[400px]">
          Let’s get your organization set up. Please pick a <b>name</b> for your organization and a <b>slug</b>. The slug is a unique
          identifier that will be part of your organization’s URL, making it easy for your team to access and remember.
        </p>
      </div>
      <div className=" min-w-[500px]">
        <TeamSettingsEditor buttonTitle="Set up" currentSettings={{
          slug: humanId({ separator: "-", capitalize: false }),
        }} redirect={true} />
      </div>

      <div className="flex flex-col items-center gap-2 text-xs">
        <Link className=" underline" href={"/org/list"}>
          Organizations list
        </Link>
        <Link className=" underline" href={"/logout"}>
          Logout
        </Link>
      </div>
    </div>
  );
}
