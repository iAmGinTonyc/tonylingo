import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultProfile } from "@/lib/profile";
import { tokenizeText } from "@/lib/anthropic";

export async function GET() {
  const profile = await getDefaultProfile();
  const texts = await prisma.text.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, sourceUrl: true, createdAt: true },
  });
  return NextResponse.json({ texts });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const rawText = body?.rawText;
  const sourceUrl = typeof body?.sourceUrl === "string" && body.sourceUrl.trim() ? body.sourceUrl.trim() : null;

  if (typeof rawText !== "string" || !rawText.trim()) {
    return NextResponse.json({ error: "Вставь текст" }, { status: 400 });
  }

  const profile = await getDefaultProfile();

  const words = await prisma.word.findMany({
    where: { profileId: profile.id },
    select: { key: true, status: true },
  });
  const knownKeys = words.filter((w) => w.status === "know").map((w) => w.key);
  const learningKeys = words.filter((w) => w.status === "learn").map((w) => w.key);

  let tokenized;
  try {
    tokenized = await tokenizeText({ rawText, knownKeys, learningKeys });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Не получилось разметить текст. Попробуй ещё раз." }, { status: 502 });
  }

  const text = await prisma.text.create({
    data: {
      title: tokenized.title,
      sourceUrl,
      profileId: profile.id,
      tokens: {
        create: tokenized.tokens.map((tok, order) =>
          tok.kind === "plain"
            ? { order, plain: tok.text }
            : { order, key: tok.key, en: tok.en, ru: tok.ru, introduce: tok.introduce },
        ),
      },
    },
    select: { id: true, title: true, sourceUrl: true, createdAt: true },
  });

  return NextResponse.json({ text });
}
