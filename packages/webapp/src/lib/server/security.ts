import { createHash } from "crypto";

export function sha256(strings: (string | undefined)[] | string): string {
  const hash = createHash("sha256");
  for (const str of typeof strings === "string" ? [strings] : strings) {
    hash.update(str || "");
  }
  return hash.digest("hex");
}
