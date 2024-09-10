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

export const TeamAccessEntry = z.union([
  z.object({
    status: z.literal("invited"),
    email: z.string(),
    invitationId: z.string(),
    invitedByUserId: z.string(),
    invitationCode: z.string(),

    userId: z.never().optional(),
  }),
  z.object({
    status: z.literal("active"),
    email: z.string(),
    userId: z.string(),

    invitedByUserId: z.never().optional(),
    invitationCode: z.never().optional(),
    invitationId: z.never().optional(),
  }),
]);

export type TeamAccessEntry = z.infer<typeof TeamAccessEntry>;
