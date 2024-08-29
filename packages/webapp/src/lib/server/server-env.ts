import { z } from "zod";
import { omit } from "lodash";

const dotenv = require("dotenv");

dotenv.config();

export const ServerEnvVars = z.object({
  DATABASE_URL: z.string(),

  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  APP_SECRET: z.string().optional(),
  SMTP_CONNECTION_STRING: z.string().optional(),
  SMTP_FROM_NAME: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().optional(),
  STRIPE_WEBHOOK_ORIGIN: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PRICING_TABLE_ID: z.string().optional(),
  STRIPE_PUBLISHIBLE_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof ServerEnvVars>;

function parseEnv() {
  if (process.env.NEXT_PHASE && process.env.NEXT_PHASE.includes("build")) {
    //console.debug("️ ? Environment variables parser is called during build phase. Returning empty object. If any of the env variables are required during static initialization, this might cause an error.");
    return {} as ServerEnv;
  }
  const parseResult = ServerEnvVars.safeParse(process.env);
  if (!parseResult.success) {
    const { errors } = parseResult.error;

    let errorMessage = `❌ Failed to parse env variables. Details:\n`;

    errors.forEach((issue, index) => {
      errorMessage += `   🚨 ${issue.path.join(" > ") || "unknown"} - ${issue.code}:\n`;
      errorMessage += `      📝 ${JSON.stringify(omit(issue, "code", "path"))}\n`;
    });

    console.error(errorMessage);

    throw new Error(`Failed to parse env variables. See details above.`);
  }
  return parseResult.data;
}

export const serverEnv: ServerEnv = parseEnv();
