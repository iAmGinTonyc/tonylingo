// One-off local helper: seeds a demo text (same passage as the approved mockup)
// directly into the DB, bypassing the Claude API call, so the real app can be
// tested end-to-end before an API key is configured.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tokens = [
  { kind: "plain", text: "Майя" },
  { kind: "word", ru: "просыпается", en: "wakes up", key: "wakes", introduce: false },
  { kind: "word", ru: "ещё", en: "even", key: "even", introduce: false },
  { kind: "word", ru: "до", en: "before", key: "before", introduce: false },
  { kind: "word", ru: "будильника", en: "the alarm", key: "alarm", introduce: false },
  { kind: "plain", text: "—" },
  { kind: "word", ru: "в", en: "in", key: "in", introduce: false },
  { kind: "word", ru: "то", en: "that", key: "thattime", introduce: false },
  { kind: "word", ru: "редкое", en: "rare", key: "rare", introduce: false },
  { kind: "word", ru: "утро", en: "morning", key: "morning", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "когда", en: "when", key: "when", introduce: false },
  { kind: "word", ru: "солнечный свет", en: "sunlight", key: "sunlight", introduce: false },
  { kind: "word", ru: "уже", en: "already", key: "already", introduce: false },
  { kind: "word", ru: "пробивается", en: "leans", key: "leans", introduce: true },
  { kind: "word", ru: "сквозь", en: "through", key: "through", introduce: false },
  { kind: "word", ru: "занавески", en: "curtains", key: "curtains", introduce: true },
  { kind: "plain", text: "." },
  { kind: "word", ru: "Она", en: "She", key: "she", introduce: false },
  { kind: "word", ru: "медленно", en: "slowly", key: "slowly", introduce: false },
  { kind: "word", ru: "готовит", en: "makes", key: "makes", introduce: false },
  { kind: "word", ru: "кофе", en: "coffee", key: "coffee", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "наблюдая", en: "watching", key: "watching", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "как", en: "as", key: "as", introduce: false },
  { kind: "word", ru: "пар", en: "steam", key: "steam", introduce: false },
  { kind: "word", ru: "вьётся", en: "curl", key: "curl", introduce: true },
  { kind: "word", ru: "над", en: "above", key: "above", introduce: false },
  { kind: "word", ru: "кружкой", en: "the mug", key: "mug", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "пока", en: "while", key: "while", introduce: false },
  { kind: "word", ru: "чайник", en: "kettle", key: "kettle", introduce: true },
  { kind: "word", ru: "остывает", en: "cools", key: "cools", introduce: false },
  { kind: "word", ru: "на", en: "on", key: "on", introduce: false },
  { kind: "word", ru: "плите", en: "the stove", key: "stove", introduce: false },
  { kind: "plain", text: "." },
  { kind: "word", ru: "Где-то", en: "Somewhere", key: "somewhere", introduce: false },
  { kind: "word", ru: "в", en: "in", key: "in", introduce: false },
  { kind: "word", ru: "её", en: "her", key: "her", introduce: false },
  { kind: "word", ru: "сумке", en: "bag", key: "bag", introduce: false },
  { kind: "word", ru: "лежит", en: "lies", key: "lies", introduce: false },
  { kind: "word", ru: "письмо", en: "a letter", key: "letter", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "на которое", en: "to which", key: "towhich", introduce: false },
  { kind: "word", ru: "она", en: "she", key: "she", introduce: false },
  { kind: "word", ru: "всё ещё", en: "still", key: "still", introduce: false },
  { kind: "word", ru: "не", en: "not", key: "not", introduce: false },
  { kind: "word", ru: "ответила", en: "answered", key: "answered", introduce: false },
  { kind: "plain", text: "—" },
  { kind: "word", ru: "она", en: "she", key: "she", introduce: false },
  { kind: "word", ru: "собирается", en: "keeps meaning to", key: "meaning", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "но", en: "but", key: "but", introduce: false },
  { kind: "word", ru: "такое", en: "such", key: "such", introduce: false },
  { kind: "word", ru: "утро", en: "morning", key: "morning", introduce: false },
  { kind: "word", ru: "слишком", en: "too", key: "too", introduce: false },
  { kind: "word", ru: "тихое", en: "quiet", key: "quiet", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "чтобы", en: "to", key: "to", introduce: false },
  { kind: "word", ru: "испортить", en: "spoil", key: "spoil", introduce: false },
  { kind: "word", ru: "его", en: "it", key: "it", introduce: false },
  { kind: "word", ru: "напоминанием", en: "with a reminder", key: "reminder", introduce: false },
  { kind: "word", ru: "о", en: "of", key: "of", introduce: false },
  { kind: "word", ru: "незаконченном", en: "what’s unfinished", key: "unfinished", introduce: false },
  { kind: "plain", text: "." },
  { kind: "word", ru: "На улице", en: "Outside", key: "outside", introduce: false },
  { kind: "word", ru: "упрямая", en: "stubborn", key: "stubborn", introduce: true },
  { kind: "word", ru: "кошка", en: "cat", key: "cat", introduce: false },
  { kind: "word", ru: "отказывается", en: "refuses", key: "refuses", introduce: false },
  { kind: "word", ru: "уходить", en: "to move", key: "move", introduce: false },
  { kind: "word", ru: "с", en: "from", key: "from", introduce: false },
  { kind: "word", ru: "самого тёплого места", en: "the warmest patch", key: "warmestpatch", introduce: false },
  { kind: "word", ru: "у", en: "by", key: "by", introduce: false },
  { kind: "word", ru: "порог", en: "doorstep", key: "doorstep", introduce: true },
  { kind: "plain", text: "," },
  { kind: "word", ru: "и", en: "and", key: "and", introduce: false },
  { kind: "plain", text: "Майя" },
  { kind: "word", ru: "решает", en: "decides", key: "decides", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "что", en: "that", key: "that2", introduce: false },
  { kind: "word", ru: "сегодня", en: "today", key: "today", introduce: false },
  { kind: "word", ru: "она", en: "she", key: "she", introduce: false },
  { kind: "word", ru: "тоже", en: "too", key: "also", introduce: false },
  { kind: "word", ru: "никуда не будет спешить", en: "won’t rush anywhere", key: "wontrush", introduce: false },
  { kind: "plain", text: "." },
];

const profile = await prisma.profile.upsert({
  where: { id: "demo-profile" },
  update: {},
  create: { id: "demo-profile", name: "Профиль" },
});

// make it the only/default profile getDefaultProfile() will find
const existing = await prisma.profile.findFirst();
const profileId = existing?.id ?? profile.id;

await prisma.text.create({
  data: {
    title: "Тихое утро Майи",
    sourceUrl: "https://example.com/source-video",
    profileId,
    tokens: {
      create: tokens.map((tok, order) =>
        tok.kind === "plain"
          ? { order, plain: tok.text }
          : { order, key: tok.key, en: tok.en, ru: tok.ru, introduce: tok.introduce },
      ),
    },
  },
});

console.log("Seeded demo text for profile", profileId);
await prisma.$disconnect();
