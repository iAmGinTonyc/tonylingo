import { prisma } from "@/lib/prisma";

// Single-profile app for now — this always returns (and lazily creates)
// the one learner profile. Swap for real multi-profile lookup (e.g. by
// Telegram id) once there's more than one reader.
export async function getDefaultProfile() {
  const existing = await prisma.profile.findFirst();
  if (existing) return existing;
  return prisma.profile.create({ data: { name: "Профиль" } });
}
