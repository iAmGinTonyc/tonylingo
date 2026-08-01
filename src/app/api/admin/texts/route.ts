import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tokenizeText } from "@/lib/anthropic";
import { notifyNewText } from "@/lib/telegramBot";

export async function GET() {
  const texts = await prisma.text.findMany({
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

  // Texts are shared by every profile, so "already taught" is anything any
  // profile has been introduced to before — keeps the curriculum from
  // repeating the same new words across texts.
  const taughtWords = await prisma.word.findMany({ distinct: ["key"], select: { key: true } });
  const taughtKeys = taughtWords.map((w) => w.key);

  let tokenized;
  try {
    tokenized = await tokenizeText({ rawText, knownKeys: taughtKeys, learningKeys: [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Не получилось разметить текст. Попробуй ещё раз." }, { status: 502 });
  }

  const text = await prisma.text.create({
    data: {
      title: tokenized.title,
      sourceUrl,
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

  const subscribers = await prisma.profile.findMany({
    where: { telegramChatId: { not: null } },
    select: { telegramChatId: true },
  });
  await Promise.allSettled(
    subscribers.map((p) => notifyNewText(p.telegramChatId as string, text.title, text.id)),
  );

  return NextResponse.json({ text });
}
