/**
 * Minimal Google Sheets v4 client.
 *
 * The official `googleapis` package pulls in Node built-ins and will not run on
 * Cloudflare Workers, so this signs its own service-account JWT with WebCrypto
 * and talks to the REST API over fetch. Nothing here needs a Node runtime.
 *
 * Sheet layout (row 1 is a header, data starts at row 2):
 *
 *   A: ISO 8601 date    B: title    C: body
 *
 * The range strings deliberately omit a tab name — Sheets then applies them to
 * the first sheet in the document, so renaming the tab cannot break this.
 */
import type { LogsEnv } from "./env";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const READ_RANGE = "A2:C";
const APPEND_RANGE = "A:C";

export interface LogEntry {
  /** 1-based position in the sheet: the first log ever written is #1. */
  number: number;
  date: Date;
  title: string;
  body: string;
}

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function encodeJson(value: unknown): string {
  return base64url(new TextEncoder().encode(JSON.stringify(value)));
}

/** Strips the PEM armour and base64-decodes the DER body. */
function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/\\n/g, "\n") // survives being stored as a single-line env var
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getAccessToken(env: LogsEnv): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${encodeJson({ alg: "RS256", typ: "JWT" })}.${encodeJson(claim)}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(env.GOOGLE_PRIVATE_KEY),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned)
  );

  const assertion = `${unsigned}.${base64url(new Uint8Array(signature))}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token request failed (${res.status}): ${await res.text()}`);
  }
  return ((await res.json()) as { access_token: string }).access_token;
}

function sheetUrl(env: LogsEnv, path: string): string {
  return `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.GOOGLE_SHEET_ID)}/values/${path}`;
}

/** Reads every log, oldest first, numbered by position in the sheet. */
export async function readLogs(env: LogsEnv): Promise<LogEntry[]> {
  const token = await getAccessToken(env);

  const res = await fetch(sheetUrl(env, READ_RANGE), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Reading the sheet failed (${res.status}): ${await res.text()}`);
  }

  const rows = ((await res.json()) as { values?: string[][] }).values ?? [];

  return rows
    .map((row, i) => ({
      number: i + 1,
      date: new Date(row[0] ?? ""),
      title: (row[1] ?? "").trim(),
      body: row[2] ?? "",
    }))
    // A trailing blank row in the sheet should not become an empty log.
    .filter((entry) => entry.title !== "" || entry.body.trim() !== "");
}

/** Appends one log and returns the number it was given. */
export async function appendLog(
  env: LogsEnv,
  { title, body, date }: { title: string; body: string; date: Date }
): Promise<number> {
  const token = await getAccessToken(env);

  const params = new URLSearchParams({
    // RAW stores the text exactly as typed. It also means a body starting with
    // "=" is kept as text instead of being evaluated as a spreadsheet formula.
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
  });

  const res = await fetch(`${sheetUrl(env, `${APPEND_RANGE}:append`)}?${params}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [[date.toISOString(), title, body]] }),
  });

  if (!res.ok) {
    throw new Error(`Writing to the sheet failed (${res.status}): ${await res.text()}`);
  }

  const updatedRange = ((await res.json()) as { updates?: { updatedRange?: string } }).updates
    ?.updatedRange;

  // updatedRange looks like "Sheet1!A7:C7" — row 7 is log #6, since row 1 is
  // the header. Falls back to 0 if Google ever stops returning it.
  const rowMatch = updatedRange?.match(/[A-Z]+(\d+)/);
  return rowMatch ? Number(rowMatch[1]) - 1 : 0;
}

/** First line of the body, cut to `maxLength` with an ellipsis if it overruns. */
export function excerptOf(body: string, maxLength = 160): string {
  const firstLine = body.split("\n")[0].trim();
  if (firstLine.length <= maxLength) return firstLine;
  return `${firstLine.slice(0, maxLength).trimEnd()}...`;
}
