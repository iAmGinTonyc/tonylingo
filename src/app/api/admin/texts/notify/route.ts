import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewText } from "@/lib/telegramBot";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const textId = body?.textId;

  const text = textId
    ? await prisma.text.findUnique({ where: { id: textId }, select: { id: true, title: true } })
    : await prisma.text.findFirst({ orderBy: { createdAt: "desc" }, select: { id: true, title: true } });

  if (!text) return NextResponse.json({ error: "text not found" }, { status: 404 });

  const subscribers = await prisma.profile.findMany({
    where: { telegramChatId: { not: null } },
    select: { telegramChatId: true },
  });

  const results = await Promise.allSettled(
    subscribers.map((p) => notifyNewText(p.telegramChatId as string, text.title, text.id)),
  );
  const sent = results.filter((r) => r.status === "fulfilled").length;

  return NextResponse.json({ sent, total: subscribers.length });
}
