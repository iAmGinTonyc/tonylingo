import { NextRequest, NextResponse } from "next/server";
import { getTextWithTokensById } from "@/lib/texts";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const text = await getTextWithTokensById(id);
  if (!text) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ text });
}
