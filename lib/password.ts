import "server-only";

import {
  randomBytes,
  scrypt,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";
import { promisify } from "node:util";

/**
 * `promisify` resolves scrypt's three-argument overload, which drops the options
 * parameter. The cost parameters are the whole point of using scrypt, so the
 * four-argument signature is asserted back on.
 */
const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions
) => Promise<Buffer>;

/**
 * Password hashing with scrypt from `node:crypto`.
 *
 * scrypt is memory-hard, which is what makes a stolen hash expensive to attack,
 * and it ships with Node, so this needs no dependency. The parameters are
 * encoded into the stored string so they can be raised later without
 * invalidating hashes that already exist.
 */
const PARAMS = { N: 16384, r: 8, p: 1 } as const;
const KEY_LENGTH = 64;
const MAX_MEM = 64 * 1024 * 1024;
const ALGORITHM = "scrypt";

/** Stored as `scrypt$N$r$p$salt$hash`, everything after the parameters in base64. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(normalize(password), salt, KEY_LENGTH, {
    ...PARAMS,
    maxmem: MAX_MEM,
  });

  return [
    ALGORITHM,
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64"),
    derived.toString("base64"),
  ].join("$");
}

/** Constant-time comparison. A malformed or absent hash is never a match. */
export async function verifyPassword(
  password: string,
  stored: string | null
): Promise<boolean> {
  if (!stored) return false;

  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== ALGORITHM) return false;

  const [, n, r, p, saltB64, hashB64] = parts;
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");
  if (salt.length === 0 || expected.length === 0) return false;

  try {
    const derived = await scryptAsync(normalize(password), salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: MAX_MEM,
    });

    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/**
 * Normalise so the same passphrase typed on a different keyboard layout, or
 * with a composed accent, produces the same hash.
 */
function normalize(password: string): string {
  return password.normalize("NFKC");
}

/** Session tokens are opaque and high-entropy. Only their hash is stored. */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}
