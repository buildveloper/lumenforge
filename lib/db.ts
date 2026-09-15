import "server-only";

import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import * as schema from "@/db/schema";

/**
 * Where the database lives.
 *
 * A blank variable is not the same as an absent one: `??` keeps an empty string
 * and hands libSQL a URL of "", which fails with nothing useful to go on.
 */
const configured = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;

/**
 * Vercel sets VERCEL=1. Trimmed and compared explicitly rather than coerced,
 * because a whitespace-only value is truthy and would silently switch a local
 * run onto the ephemeral /tmp database.
 */
const isServerless = process.env.VERCEL?.trim() === "1";

function resolveUrl(): string {
  if (configured) return configured;

  if (isServerless) {
    // `./data/...` cannot work here: the deployment bundle is read-only, so
    // SQLite cannot even create the file. /tmp is the one writable path, and it
    // survives only as long as the instance. That keeps a deployed demo usable
    // with no configuration, at the cost of the data resetting.
    console.warn(
      "[LumenForge] TURSO_DATABASE_URL is not set, so a temporary database is " +
        "being used in /tmp. Everything written will be lost when this instance " +
        "recycles. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to persist data."
    );
    return "file:/tmp/lumenforge.db";
  }

  return "file:./data/lumenforge.db";
}

const url = resolveUrl();
const isLocalFile = url.startsWith("file:");

if (isLocalFile) {
  // SQLite cannot create its own parent directory, and `data/` is gitignored,
  // so a fresh clone has nowhere to put the file.
  try {
    mkdirSync(dirname(resolve(url.slice("file:".length))), { recursive: true });
  } catch (error) {
    console.error(
      `[LumenForge] Could not create the database directory for ${url}:`,
      error
    );
  }
}

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });

/**
 * Applies migrations once per instance.
 *
 * A database that exists but has no schema fails every query with "no such
 * table", and on a deployed instance there is no way to run `db:migrate` — the
 * operator cannot log in there. Doing it here is what makes a freshly created
 * Turso database, a local file, and the /tmp fallback all work without a manual
 * step.
 *
 * `migrate` is idempotent: it records applied migrations and skips them, so
 * this is a couple of queries per cold start, not a repeated schema build. If
 * two instances race on a brand-new database, one may lose; that is caught and
 * logged, and the winner's schema is the one that stands.
 */
let ready: Promise<void> | null = null;

export function ensureDatabaseReady(): Promise<void> {
  ready ??= (async () => {
    try {
      await migrate(db, { migrationsFolder: "./db/migrations" });
    } catch (error) {
      console.error(
        "[LumenForge] Could not apply migrations. If this is the first run " +
          "against a new database, apply them manually with `npm run db:migrate`.",
        error
      );
    }
  })();

  return ready;
}

export type Database = typeof db;
