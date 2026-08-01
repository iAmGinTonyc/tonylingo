import { prisma } from "@/lib/prisma";
import { getProfileIdFromCookies } from "@/lib/profileAuth";

// Fallback profile for admin/dev use and for anyone opening the app
// outside Telegram (no signed-in identity yet).
export async function getDefaultProfile() {
  const existing = await prisma.profile.findFirst();
  if (existing) return existing;
  return prisma.profile.create({ data: { name: "Профиль" } });
}

// Resolves the profile for the current request: the Telegram-identified
// profile from the session cookie if present, otherwise the fallback.
export async function getCurrentProfile() {
  const profileId = await getProfileIdFromCookies();
  if (profileId) {
    const profile = await prisma.profile.findUnique({ where: { id: profileId } });
    if (profile) return profile;
  }
  return getDefaultProfile();
}
