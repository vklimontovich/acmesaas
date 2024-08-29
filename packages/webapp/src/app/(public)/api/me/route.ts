import { typedRoute } from "@/lib/server/route-helpers";
import { getUser } from "@/lib/server/security-context";

export const GET = typedRoute({}, async ({ req, res }) => {
  const user = await getUser();
  return user
    ? {
        authenticated: true,
        ...user,
      }
    : {
        authenticated: false,
      };
});
