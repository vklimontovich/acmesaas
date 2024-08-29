import { z } from "zod";

export const Invitation = z.object({
  teamId: z.string(),
  email: z.string().email(),
});

export type Invitation = z.infer<typeof Invitation>;

export const InvitationResponse = z.object({
  code: z.string(),
  id: z.string(),
});

export type InvitationResponse = z.infer<typeof InvitationResponse>;
