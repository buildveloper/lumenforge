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

/** Vercel sets this. Any serverless host has a read-only, ephemeral filesystem. */
const isServerless = Boolean(process.env.VERCEL);

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
 * A SQLite file that was just created has no tables, so every query fails with
 * "no such table" and the operator has no way to run migrations on a machine
 * they cannot log into. Applying them here, once per instance, is what makes
 * the local and /tmp paths work without a manual step.
 *
 * A hosted database is left alone: migrations there are an operator decision.
 */
let ready: Promise<void> | null = null;

export function ensureDatabaseReady(): Promise<void> {
  if (!isLocalFile) return Promise.resolve();

  ready ??= (async () => {
    try {
      await migrate(db, { migrationsFolder: "./db/migrations" });
    } catch (error) {
      console.error("[LumenForge] Could not apply migrations:", error);
    }
  })();

  return ready;
}

export type Database = typeof db;
