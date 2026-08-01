import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultProfile } from "@/lib/profile";

export async function GET() {
  const profile = await getDefaultProfile();

  const text = await prisma.text.findFirst({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
    include: { tokens: { orderBy: { order: "asc" } } },
  });

  if (!text) {
    return NextResponse.json({ text: null });
  }

  return NextResponse.json({
    text: {
      id: text.id,
      title: text.title,
      sourceUrl: text.sourceUrl,
      tokens: text.tokens.map((t) => ({
        plain: t.plain,
        key: t.key,
        en: t.en,
        ru: t.ru,
        introduce: t.introduce,
      })),
    },
  });
}
