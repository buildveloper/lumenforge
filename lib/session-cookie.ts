/**
 * Shared between the edge middleware and the Node-side session helper.
 * Middleware must not import `server-only` code or `node:crypto`.
 */
export const SESSION_COOKIE = "lf_session";

/** How long a signed-in session lasts before it has to be re-established. */
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
