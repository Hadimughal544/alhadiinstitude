import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

export function generatePassword(length = 12) {
  return randomBytes(18).toString("base64url").replace(/[^a-zA-Z0-9]/g, "").slice(0, length);
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
