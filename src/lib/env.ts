/**
 * Secrets come from two different places depending on where the code runs:
 *
 *  - `bun run dev` on this machine  -> .env, exposed as import.meta.env
 *  - Cloudflare                     -> the Worker binding, exposed as
 *                                      locals.runtime.env
 *
 * Cloudflare secrets are NOT visible through import.meta.env at runtime, so
 * every server route reads config through here rather than touching either
 * source directly.
 */
export interface LogsEnv {
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
  GOOGLE_SHEET_ID: string;
  LOGS_PASSKEY: string;
}

export function getEnv(locals: unknown): LogsEnv {
  const runtime = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env ?? {};

  // These are referenced one by one on purpose: Vite inlines
  // `import.meta.env.FOO` statically, so spreading the object would not work.
  return {
    GOOGLE_SERVICE_ACCOUNT_EMAIL:
      runtime.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
    GOOGLE_PRIVATE_KEY:
      runtime.GOOGLE_PRIVATE_KEY ?? import.meta.env.GOOGLE_PRIVATE_KEY ?? "",
    GOOGLE_SHEET_ID:
      runtime.GOOGLE_SHEET_ID ?? import.meta.env.GOOGLE_SHEET_ID ?? "",
    LOGS_PASSKEY:
      runtime.LOGS_PASSKEY ?? import.meta.env.LOGS_PASSKEY ?? "",
  };
}

/** Throws with a readable message naming whatever is missing. */
export function requireEnv(env: LogsEnv): void {
  const missing = (Object.keys(env) as (keyof LogsEnv)[]).filter((k) => !env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Missing environment variable(s): ${missing.join(", ")}. ` +
        `Set them in .env for local dev, or under Variables and secrets in the Cloudflare dashboard.`
    );
  }
}

/**
 * Compares in constant time so a wrong passkey cannot be discovered one
 * character at a time by timing the response.
 */
export function passkeyMatches(supplied: string, expected: string): boolean {
  if (typeof supplied !== "string" || supplied.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= supplied.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
