import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultProfile } from "@/lib/profile";

export async function GET() {
  const profile = await getDefaultProfile();
  const words = await prisma.word.findMany({
    where: { profileId: profile.id },
    select: { key: true, en: true, ru: true, status: true },
    orderBy: { en: "asc" },
  });
  return NextResponse.json({ words });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { key, en, ru, status } = body ?? {};

  if (typeof key !== "string" || (status !== "know" && status !== "learn")) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const profile = await getDefaultProfile();

  const word = await prisma.word.upsert({
    where: { profileId_key: { profileId: profile.id, key } },
    update: { status },
    create: {
      profileId: profile.id,
      key,
      en: typeof en === "string" ? en : key,
      ru: typeof ru === "string" ? ru : key,
      status,
    },
  });

  return NextResponse.json({ word });
}
