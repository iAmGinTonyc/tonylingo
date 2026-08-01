import { prisma } from "@/lib/prisma";

export function serializeText(text: {
  id: string;
  title: string;
  sourceUrl: string | null;
  createdAt: Date;
  tokens: { plain: string | null; key: string | null; en: string | null; ru: string | null; introduce: boolean }[];
}) {
  return {
    id: text.id,
    title: text.title,
    sourceUrl: text.sourceUrl,
    createdAt: text.createdAt,
    tokens: text.tokens.map((t) => ({
      plain: t.plain,
      key: t.key,
      en: t.en,
      ru: t.ru,
      introduce: t.introduce,
    })),
  };
}

export async function getTextWithTokensById(id: string) {
  const text = await prisma.text.findUnique({
    where: { id },
    include: { tokens: { orderBy: { order: "asc" } } },
  });
  return text ? serializeText(text) : null;
}

export async function getLatestTextWithTokens() {
  const text = await prisma.text.findFirst({
    orderBy: { createdAt: "desc" },
    include: { tokens: { orderBy: { order: "asc" } } },
  });
  return text ? serializeText(text) : null;
}
