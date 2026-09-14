import { defineConfig } from "drizzle-kit";

// Blank is treated as unset: an empty TURSO_DATABASE_URL would otherwise be
// passed straight through and fail with no explanation.
const url = process.env.TURSO_DATABASE_URL?.trim() || "file:./data/lumenforge.db";
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "turso",
  dbCredentials: {
    url,
    authToken: authToken || undefined,
  },
});
