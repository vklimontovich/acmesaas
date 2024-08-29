import NextAuth from "next-auth";
import { getNextAuthOptions, nextAuthOptions } from "@/lib/server/next-auth";

export const dynamic = "force-dynamic";

const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST };
