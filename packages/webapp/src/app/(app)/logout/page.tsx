import { Logout } from "@/components/logout";
import { SessionProvider } from "next-auth/react";
import { getServerAuthSession } from "@/lib/server/next-auth";
import { Session } from "next-auth";
import { ClientSessionProvider } from "@/components/client-session-provider";

export default async function LogoutPage() {
  const session = await getServerAuthSession();
  return (
    <ClientSessionProvider session={session}>
      <Logout />
    </ClientSessionProvider>
  );
}
