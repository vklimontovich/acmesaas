import { PropsWithChildren, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "@/lib/server/team-page-context";

export const AuthConditionalContent: React.FC<
  PropsWithChildren<{
    authenticated: React.ReactNode | ((user: UserContext) => React.ReactNode);
  }>
> = ({ children, authenticated }) => {
  const [userContext, setUserContext] = useState<UserContext | undefined>();

  useEffect(() => {
    axios
      .get("/api/me")
      .then(res => {
        if (res.data.authenticated) {
          setUserContext(res.data);
        }
      })
      .catch(e => {
        console.error(`Can't get user info from /api/me`, e);
      });
  }, []);

  return userContext ? (typeof authenticated === "function" ? authenticated(userContext) : authenticated) : children;
};
