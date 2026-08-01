import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOpenAppMessage } from "@/lib/telegramBot";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const update = await req.json().catch(() => null);
  const message = update?.message;
  const chatId = message?.chat?.id;
  const text = message?.text as string | undefined;
  const from = message?.from;

  if (chatId && text?.startsWith("/start")) {
    const id = String(chatId);
    await prisma.profile.upsert({
      where: { telegramChatId: id },
      update: { telegramUsername: from?.username ?? null, telegramFirstName: from?.first_name ?? null },
      create: {
        name: from?.first_name ?? from?.username ?? "Профиль",
        telegramChatId: id,
        telegramUsername: from?.username ?? null,
        telegramFirstName: from?.first_name ?? null,
      },
    });
    await sendOpenAppMessage(id, "Привет! Здесь будут появляться новые тексты для чтения — жми на кнопку ниже, когда захочешь позаниматься.");
  }

  return NextResponse.json({ ok: true });
}
