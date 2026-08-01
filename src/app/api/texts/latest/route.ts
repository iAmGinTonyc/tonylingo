import { NextResponse } from "next/server";
import { getLatestTextWithTokens } from "@/lib/texts";

export async function GET() {
  const text = await getLatestTextWithTokens();
  return NextResponse.json({ text });
}
