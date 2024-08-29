import GoogleAuth from "next-auth/providers/google";
import { serverEnv } from "@/lib/server/server-env";
import { getServerSession, NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/server/prisma";
import { sha256 } from "@/lib/server/security";

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    GoogleAuth({
      clientId: serverEnv.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_OAUTH_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    session: ({ session, token, user }) => {
      session.user = {
        id: user.id,
        ...session.user,
      } as any;
      return session;
    },
  },
  adapter: PrismaAdapter(prisma) as any,
  secret: sha256([serverEnv.GOOGLE_OAUTH_CLIENT_ID, serverEnv.GOOGLE_OAUTH_CLIENT_SECRET, serverEnv.APP_SECRET || ""]),
};

export const getServerAuthSession = () => getServerSession(nextAuthOptions);
