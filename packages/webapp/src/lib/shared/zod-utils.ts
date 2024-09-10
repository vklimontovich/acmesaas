import { z, ZodError, ZodObject, ZodRawShape } from "zod";
import { omit } from "lodash";

export function stringifyZodError(error: ZodError, { prefix }: { prefix?: string } = {}): string {
  let errorMessage = prefix || `❌ Failed to parse object Details:\n`;

  error.errors.forEach((issue, index) => {
    errorMessage += `   🚨 ${issue.path.join(" > ") || "unknown"} - ${issue.code}:\n`;
    errorMessage += `      📝 ${JSON.stringify(omit(issue, "code", "path"))}\n`;
  });
  return errorMessage;
}

export function zodCombine<A extends ZodRawShape, B extends ZodRawShape>(
  schemaA: ZodObject<A>,
  schemaB: ZodObject<B>
): ZodObject<A & B> {
  return z.object({
    ...schemaA.shape,
    ...schemaB.shape,
  });
}
