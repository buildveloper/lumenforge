import "server-only";

import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

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

/** Thrown when the database exists but does not have the schema this app needs. */
export class DatabaseSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseSetupError";
  }
}

const MIGRATIONS_DIR = "./db/migrations";

/**
 * The columns the app cannot run without. Checked with `limit 0` queries, which
 * cost nothing and fail only if the column is genuinely absent.
 */
const REQUIRED_SCHEMA: { what: string; probe: string }[] = [
  { what: "users.password_hash", probe: "select password_hash from users limit 0" },
  { what: "users.notify_project_updates", probe: "select notify_project_updates from users limit 0" },
  { what: "clients.client_user_id", probe: "select client_user_id from clients limit 0" },
  { what: "sessions.token_hash", probe: "select token_hash from sessions limit 0" },
];

async function findMissingSchema(): Promise<string[]> {
  const missing: string[] = [];

  for (const check of REQUIRED_SCHEMA) {
    try {
      await client.execute(check.probe);
    } catch {
      missing.push(check.what);
    }
  }

  return missing;
}

type LocalMigration = { tag: string; statements: string[] };

/** Reads the shipped migrations, in order, from the journal. */
function readLocalMigrations(): LocalMigration[] {
  try {
    const dir = resolve(MIGRATIONS_DIR);
    const journal = JSON.parse(
      readFileSync(join(dir, "meta", "_journal.json"), "utf8")
    ) as { entries: { tag: string }[] };

    return journal.entries.map((entry) => ({
      tag: entry.tag,
      statements: readFileSync(join(dir, `${entry.tag}.sql`), "utf8")
        .split("--> statement-breakpoint")
        .map((statement) => statement.trim())
        .filter(Boolean),
    }));
  } catch (error) {
    console.error("[LumenForge] Could not read the migrations folder:", error);
    return [];
  }
}

/**
 * Brings a database forward one statement at a time.
 *
 * `migrate()` cannot do this for a database whose tables came from
 * `drizzle-kit push`, because push records no migration history: the migrator
 * starts at `0000`, finds the table already there, and stops. Replaying the
 * statements individually is what makes those databases repairable in place
 * rather than requiring shell access the operator may not have.
 *
 * A statement that fails because the object already exists is the outcome we
 * wanted, so it is logged and skipped. Only a schema that is still incomplete
 * afterwards is treated as a real failure.
 */
async function reconcileStatement(
  statement: string,
  tag: string
): Promise<boolean> {
  try {
    await client.execute(statement);
    return true;
  } catch (error) {
    const reason = String(error);
    const alreadyThere =
      /duplicate column|already exists|no such index|table .* already exists/i.test(
        reason
      );

    if (!alreadyThere) {
      console.warn(
        `[LumenForge] ${tag}: statement did not apply (${reason.slice(0, 140)})`
      );
    }
    return false;
  }
}

/**
 * Applies migrations once per instance.
 *
 * A database that exists but has no schema fails every query with "no such
 * table", and on a deployed instance there is no way to run `db:migrate` — the
 * operator cannot log in there. Doing it here is what makes a freshly created
 * Turso database, a local file, and the /tmp fallback all work without a manual
 * step.
 */
let ready: Promise<void> | null = null;

export function ensureDatabaseReady(): Promise<void> {
  ready ??= (async () => {
    // 1. The normal path.
    try {
      await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
      return;
    } catch (error) {
      console.error("[LumenForge] migrate() did not complete:", error);
    }

    // 2. A push-created database may still be perfectly usable as it stands.
    let missing = await findMissingSchema();
    if (missing.length === 0) {
      console.warn(
        "[LumenForge] Migrations did not apply, but the schema is complete. Continuing."
      );
      return;
    }

    // 3. Replay the migrations statement by statement, tolerating the ones whose
    //    objects already exist. This is what repairs the database in place.
    console.warn(
      `[LumenForge] Schema is missing ${missing.join(", ")}. Applying migrations individually…`
    );

    for (const migration of readLocalMigrations()) {
      for (const statement of migration.statements) {
        await reconcileStatement(statement, migration.tag);
      }
    }

    missing = await findMissingSchema();
    if (missing.length === 0) {
      console.warn("[LumenForge] Schema repaired. Continuing.");
      return;
    }

    throw new DatabaseSetupError(
      `the database is missing ${missing.join(", ")} and could not be repaired automatically. Its tables were probably created by an older version of the app. Run \`npx drizzle-kit push\` against it to sync the schema, or point the app at an empty database.`
    );
  })();

  return ready;
}

export type Database = typeof db;
