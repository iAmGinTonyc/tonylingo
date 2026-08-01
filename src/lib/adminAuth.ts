const COOKIE_NAME = "tl_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD is not set");
  return s;
}

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacKey() {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

async function sign(value: string) {
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toHex(sig);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function checkPassword(input: string) {
  return timingSafeEqual(input, secret());
}

export async function createSessionCookieValue() {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${await sign(issuedAt)}`;
}

export async function isValidSessionCookieValue(value: string | undefined) {
  if (!value) return false;
  const [issuedAt, signature] = value.split(".");
  if (!issuedAt || !signature) return false;
  if (!timingSafeEqual(await sign(issuedAt), signature)) return false;
  const age = (Date.now() - Number(issuedAt)) / 1000;
  return age >= 0 && age <= MAX_AGE_SECONDS;
}

export const ADMIN_COOKIE = {
  name: COOKIE_NAME,
  maxAge: MAX_AGE_SECONDS,
};
