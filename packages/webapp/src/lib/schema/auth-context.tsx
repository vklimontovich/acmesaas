import { z } from "zod";

export const TeamContextProps = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const UserContextProps = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
});

export type TeamContext = {
  team: z.infer<typeof TeamContextProps>;
};

export type UserContext = { user: z.infer<typeof UserContextProps> };

export type TeamPageContext = TeamContext & UserContext;
