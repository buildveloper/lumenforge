import { defineConfig } from "drizzle-kit";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "turso",
  dbCredentials: {
    url: url ?? "file:./data/lumenforge.db",
    authToken: authToken || undefined,
  },
});
