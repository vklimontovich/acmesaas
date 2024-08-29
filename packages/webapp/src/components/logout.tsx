"use client";
import { signOut, useSession } from "next-auth/react";
import React from "react";
import { useRouter } from "next/navigation";
import { Button, notification } from "antd";
import { LogIn, LogOut } from "lucide-react";

export function Logout() {
  const router = useRouter();
  const session = useSession();
  const [loggingOut, setLoggingOut] = React.useState(false);
  if (!session?.data?.user) {
    return (
      <div className="flex flex-col items-center gap-8 py-12 px-12">
        <h2 className="text-2xl font-bold">Not authorized</h2>
        <Button size="large" type="primary" href="/" icon={<LogIn />} className="">
          Login or Signup
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-4 py-12 px-12">
      <h2 className="text-2xl font-bold">👋 Hi, {session.data.user.name || session.data.user.email}</h2>
      <h2 className="text-lg">Do you want to log out?</h2>
      <Button
        type="primary"
        size="large"
        loading={loggingOut}
        onClick={async () => {
          try {
            setLoggingOut(true);
            await signOut({
              redirect: false,
            });
            router.push("/");
          } catch (e: any) {
            notification.error({ message: "Can't sign out", description: e?.message || "Unknown error" });
          } finally {
            setLoggingOut(false);
          }
        }}
        icon={<LogOut />}
      >
        Logout
      </Button>
    </div>
  );
}
