import { NextResponse } from "next/server";
import { setMenuButton, setWebhook } from "@/lib/telegramBot";

export async function POST() {
  try {
    await setMenuButton();
    await setWebhook();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
