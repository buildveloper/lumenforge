import "server-only";

import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/db/schema";

/**
 * A blank variable is not the same as an absent one. `??` would keep an empty
 * string and hand libSQL a URL of "", which fails with nothing useful to go on.
 * Treating blank as unset means a `.env` with `TURSO_DATABASE_URL=` still falls
 * back to the local file.
 */
const url =
  process.env.TURSO_DATABASE_URL?.trim() || "file:./data/lumenforge.db";
const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;

/**
 * SQLite cannot create its own parent directory, and `data/` is gitignored, so
 * a fresh clone has nowhere to put the file and every query fails with an
 * "unable to open database" that gives no hint why. Creating the directory here
 * makes the first run work instead of looking like a broken sign-in.
 */
if (url.startsWith("file:")) {
  try {
    mkdirSync(dirname(resolve(url.slice("file:".length))), { recursive: true });
  } catch (error) {
    console.error(
      `[LumenForge] Could not create the database directory for ${url}:`,
      error
    );
  }
}

const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
