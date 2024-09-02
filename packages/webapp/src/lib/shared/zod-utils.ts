import { ZodError } from "zod";
import { omit } from "lodash";

export function stringifyZodError(error: ZodError, {prefix} : {prefix?: string} = {}): string {
  let errorMessage = prefix || `❌ Failed to parse object Details:\n`;

  error.errors.forEach((issue, index) => {
    errorMessage += `   🚨 ${issue.path.join(" > ") || "unknown"} - ${issue.code}:\n`;
    errorMessage += `      📝 ${JSON.stringify(omit(issue, "code", "path"))}\n`;
  });
  return errorMessage;
}