import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "tl_profile";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

function secret() {
  const s = process.env.ADMIN_PASSWORD ?? "dev-secret";
  return s;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function createProfileCookieValue(profileId: string) {
  return `${profileId}.${sign(profileId)}`;
}

export function readProfileIdFromCookieValue(value: string | undefined) {
  if (!value) return null;
  const [profileId, signature] = value.split(".");
  if (!profileId || !signature) return null;
  const expected = Buffer.from(sign(profileId));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  return profileId;
}

export async function setProfileCookie(profileId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, createProfileCookieValue(profileId), {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getProfileIdFromCookies() {
  const store = await cookies();
  return readProfileIdFromCookieValue(store.get(COOKIE_NAME)?.value);
}
