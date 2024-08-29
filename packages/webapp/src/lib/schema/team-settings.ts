import { z } from "zod";

export const TeamSettings = z.object({
  slug: z.string().min(5),
  name: z.string().min(5),
  id: z.string().optional(),
});

export type TeamSettings = z.infer<typeof TeamSettings>;
