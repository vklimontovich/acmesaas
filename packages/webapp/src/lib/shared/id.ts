import { customAlphabet } from "nanoid";

const generator = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 16);

export function newId(size?: number) {
  return generator(size);
}
