import type { APIRoute } from "astro";
import { getEnv, passkeyMatches } from "../../../lib/env";

export const prerender = false;

/**
 * Checks a passkey without writing anything, so /logs/write can gate the form
 * up front instead of letting someone type a whole log and only then find out
 * the passkey was wrong.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals);

  if (!env.LOGS_PASSKEY) {
    return Response.json(
      { ok: false, error: "LOGS_PASSKEY is not configured on the server." },
      { status: 500 }
    );
  }

  let passkey = "";
  try {
    passkey = ((await request.json()) as { passkey?: string }).passkey ?? "";
  } catch {
    return Response.json({ ok: false, error: "Expected a JSON body." }, { status: 400 });
  }

  if (!passkeyMatches(passkey, env.LOGS_PASSKEY)) {
    return Response.json({ ok: false, error: "Wrong passkey." }, { status: 401 });
  }

  return Response.json({ ok: true });
};
