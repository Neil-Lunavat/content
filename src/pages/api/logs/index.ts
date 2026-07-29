import type { APIRoute } from "astro";
import { getEnv, passkeyMatches, requireEnv } from "../../../lib/env";
import { appendLog } from "../../../lib/sheets";

export const prerender = false;

const MAX_TITLE = 200;
const MAX_BODY = 50_000;

/** Appends a log to the sheet. The passkey is checked here, not in the browser. */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals);

  try {
    requireEnv(env);
  } catch (err) {
    return Response.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }

  let payload: { passkey?: string; title?: string; body?: string };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return Response.json({ ok: false, error: "Expected a JSON body." }, { status: 400 });
  }

  if (!passkeyMatches(payload.passkey ?? "", env.LOGS_PASSKEY)) {
    return Response.json({ ok: false, error: "Wrong passkey." }, { status: 401 });
  }

  const title = (payload.title ?? "").trim();
  const body = (payload.body ?? "").trim();

  if (!title) {
    return Response.json({ ok: false, error: "Title is required." }, { status: 400 });
  }
  if (!body) {
    return Response.json({ ok: false, error: "Body is required." }, { status: 400 });
  }
  if (title.length > MAX_TITLE) {
    return Response.json(
      { ok: false, error: `Title is longer than ${MAX_TITLE} characters.` },
      { status: 400 }
    );
  }
  if (body.length > MAX_BODY) {
    return Response.json(
      { ok: false, error: `Body is longer than ${MAX_BODY} characters.` },
      { status: 400 }
    );
  }

  try {
    // The date is the moment of submission — it is never taken from the client.
    const number = await appendLog(env, { title, body, date: new Date() });
    return Response.json({ ok: true, number });
  } catch (err) {
    return Response.json({ ok: false, error: (err as Error).message }, { status: 502 });
  }
};
