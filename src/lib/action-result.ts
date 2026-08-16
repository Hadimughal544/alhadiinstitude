export type ActionResult =
  | { ok: true; id?: string; message?: string }
  | { ok: false; error: string };

export function toActionError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof Error) {
    const msg = error.message || fallback;

    if (msg.includes("Unknown argument") || msg.includes("Unknown field")) {
      return "Database is out of date. Restart the server after running: npx prisma generate";
    }
    if (msg.includes("Unique constraint") || msg.includes("Unique constraint failed")) {
      return "That slug or code is already in use. Choose a different one.";
    }
    if (msg.includes("Unauthorized")) {
      return "You must be logged in as an admin to do this.";
    }
    if (msg.includes("Cloudinary")) {
      return msg;
    }
    // Avoid dumping huge Prisma dumps to the UI
    if (msg.includes("Invalid `") || msg.includes("prisma.")) {
      return "Could not save to the database. Check your fields and try again. If this persists, restart the dev server.";
    }
    if (msg.length > 220) {
      return fallback;
    }
    return msg;
  }
  return fallback;
}
