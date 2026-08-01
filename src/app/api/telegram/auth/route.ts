import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTelegramInitData } from "@/lib/telegramBot";
import { setProfileCookie } from "@/lib/profileAuth";

export async function POST(req: NextRequest) {
  const { initData } = await req.json().catch(() => ({ initData: "" }));

  if (typeof initData !== "string" || !initData) {
    return NextResponse.json({ error: "no initData" }, { status: 400 });
  }

  const user = verifyTelegramInitData(initData);
  if (!user) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const chatId = String(user.id);
  const profile = await prisma.profile.upsert({
    where: { telegramChatId: chatId },
    update: { telegramUsername: user.username ?? null, telegramFirstName: user.first_name ?? null },
    create: {
      name: user.first_name ?? user.username ?? "Профиль",
      telegramChatId: chatId,
      telegramUsername: user.username ?? null,
      telegramFirstName: user.first_name ?? null,
    },
  });

  await setProfileCookie(profile.id);

  return NextResponse.json({
    firstName: profile.telegramFirstName,
    username: profile.telegramUsername,
  });
}
