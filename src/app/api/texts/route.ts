import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public list for the archive picker — texts are global, shared by everyone.
export async function GET() {
  const texts = await prisma.text.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true },
  });
  return NextResponse.json({ texts });
}
