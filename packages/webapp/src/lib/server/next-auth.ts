import GoogleAuth from "next-auth/providers/google";
import GithubAuth from "next-auth/providers/github";
import { getServerSession, NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";
import { sha256 } from "./security";
import { getOrCreateUser } from "@/lib/server/security-context";
import assert from "assert";
import { requireDefined } from "@/lib/shared/preconditions";
import { serverEnv } from "@/lib/server/server-env";

export const getNextAuthOptions: () => NextAuthOptions = () => {
  return {
    providers: [
      serverEnv.GOOGLE_OAUTH_CLIENT_ID &&
        GoogleAuth({
          clientId: serverEnv.GOOGLE_OAUTH_CLIENT_ID,
          clientSecret: requireDefined(
            serverEnv.GOOGLE_OAUTH_CLIENT_SECRET,
            `env GOOGLE_OAUTH_CLIENT_SECRET is missing`
          ),
          authorization: {
            params: {
              scope: "openid profile email",
              prompt: "select_account",
            },
          },
        }),
      serverEnv.GITHUB_CLIENT_ID &&
        GithubAuth({
          clientId: serverEnv.GITHUB_CLIENT_ID,
          clientSecret: requireDefined(serverEnv.GITHUB_CLIENT_SECRET, `env GITHUB_CLIENT_SECRET is missing`),
        }),
    ].filter(Boolean),
    pages: {
      error: "/error111",
    },
    callbacks: {
      signIn: async signInProps => {
        try {
          assert(signInProps.profile, "profile is required");
          assert(signInProps.account, "account is required");
          const email = requireDefined(signInProps.profile.email, "email is required");
          const user = await getOrCreateUser({
            email: email,
            name: signInProps.profile.name,
            provider: signInProps.account.provider,
            providerAccountId: signInProps.account.providerAccountId,
          });
          (signInProps.user as any).internalId = user.id;
        } catch (e: any) {
          return `/auth/error?error=` + encodeURIComponent(e?.message || "Uknown error");
        }
        return true;
      },
      jwt: async jwtProps => {
        if (jwtProps.token.internalId) {
          //There's already a user id in the token, so we don't need to look up the user
          return jwtProps.token;
        } else {
          const provider = jwtProps.account?.provider;
          console.assert(provider, "provider is required");
          const providerAccountId = jwtProps.account?.providerAccountId || jwtProps.token.sub;
          assert(providerAccountId, "providerAccountId is required");
          console.debug(`Looking up user with provider=${provider} and providerAccountId=${providerAccountId}`);
          const user = await prisma.user.findFirst({
            where: {
              provider: provider,
              providerAccountId: providerAccountId,
            },
          });
          assert(user, `User with provider=${provider} and providerAccountId=${providerAccountId} must exist`);
          return {
            internalId: user.id,
            ...jwtProps.token,
          };
        }
      },
      session: async sessionProps => {
        return {
          ...sessionProps.session,
          user: {
            id: sessionProps.token.internalId,
            ...sessionProps.session.user,
          },
        };
      },
    },

    secret: sha256([
      "v2",
      serverEnv.GOOGLE_OAUTH_CLIENT_ID,
      serverEnv.GOOGLE_OAUTH_CLIENT_SECRET,
      serverEnv.APP_SECRET || "",
    ]),
  };
};

export const nextAuthOptions = getNextAuthOptions();

export const getServerAuthSession = () => getServerSession(getNextAuthOptions());
