import { z } from "zod";

const dotenv = require("dotenv");

dotenv.config();

export const ServerEnvVars = z.object({
  DATABASE_URL: z.string(),
  GOOGLE_OAUTH_CLIENT_ID: z.string(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
  APP_SECRET: z.string().optional(),
});

export type ServerEnv = z.infer<typeof ServerEnvVars>;

export const serverEnv: ServerEnv = ServerEnvVars.parse(process.env);
