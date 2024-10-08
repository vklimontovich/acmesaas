"use client";
import { createContext, ReactNode, useContext } from "react";
import { TeamPageContext } from "@/lib/schema/auth-context";

const PageContext0 = createContext<TeamPageContext | undefined>(undefined);

export const TeamPage: React.FC<{ context: TeamPageContext; children: ReactNode }> = props => {
  return <PageContext0.Provider value={props.context}>{props.children}</PageContext0.Provider>;
};

export const useTeamPageContext = () => {
  const context = useContext(PageContext0);
  if (!context) {
    throw new Error("PageContext is not defined");
  }
  return context;
};
