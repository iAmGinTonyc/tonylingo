// Adds a second text WITHOUT touching existing texts or anyone's word progress.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tokens = [
  { kind: "word", ru: "Как", en: "How", key: "how", introduce: false },
  { kind: "word", ru: "люди", en: "people", key: "people", introduce: false },
  { kind: "word", ru: "понимают", en: "know", key: "know", introduce: false },
  { kind: "word", ru: "что", en: "that", key: "that", introduce: false },
  { kind: "word", ru: "пора", en: "time", key: "time", introduce: false },
  { kind: "word", ru: "остановиться", en: "quit", key: "quit", introduce: true },
  { kind: "plain", text: "?" },

  { kind: "word", ru: "Другие", en: "Other", key: "other", introduce: false },
  { kind: "word", ru: "люди", en: "people", key: "people", introduce: false },
  { kind: "word", ru: "понимают", en: "know", key: "know", introduce: false },
  { kind: "word", ru: "что", en: "when", key: "when", introduce: false },
  { kind: "word", ru: "пора", en: "time", key: "time", introduce: false },
  { kind: "word", ru: "уходить", en: "leave", key: "leave", introduce: false },
  { kind: "word", ru: "из отношений", en: "a relationship", key: "relationship", introduce: false },
  { kind: "plain", text: "." },

  { kind: "word", ru: "То есть", en: "I mean", key: "imean", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "это", en: "it's", key: "its", introduce: false },
  { kind: "word", ru: "трудно", en: "hard", key: "hard", introduce: false },
  { kind: "word", ru: "сказать", en: "to say", key: "tosay", introduce: false },
  { kind: "plain", text: "." },

  { kind: "word", ru: "Это как", en: "It's like", key: "itslike", introduce: false },
  { kind: "plain", text: "—" },
  { kind: "word", ru: "как", en: "how", key: "how", introduce: false },
  { kind: "word", ru: "ты", en: "you", key: "you", introduce: false },
  { kind: "word", ru: "понимаешь", en: "know", key: "know", introduce: false },
  { kind: "word", ru: "что", en: "when", key: "when", introduce: false },
  { kind: "word", ru: "пора", en: "time", key: "time", introduce: false },
  { kind: "word", ru: "уходить", en: "leave", key: "leave", introduce: false },
  { kind: "word", ru: "с работы", en: "a job", key: "job", introduce: false },
  { kind: "plain", text: "?" },

  { kind: "word", ru: "Ну", en: "Um", key: "um", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "знаешь", en: "you know", key: "youknow", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "слушай", en: "look", key: "look", introduce: false },
  { kind: "plain", text: "." },

  { kind: "word", ru: "Шутливый", en: "humorous", key: "humorous", introduce: true },
  { kind: "word", ru: "ответ", en: "answer", key: "answer", introduce: false },
  { kind: "plain", text: "—" },
  { kind: "word", ru: "победители", en: "winners", key: "winners", introduce: false },
  { kind: "word", ru: "никогда", en: "never", key: "never", introduce: false },
  { kind: "word", ru: "не сдаются", en: "quit", key: "quit", introduce: true },
  { kind: "plain", text: "," },
  { kind: "word", ru: "а", en: "and", key: "and", introduce: false },
  { kind: "word", ru: "неудачники", en: "quitters", key: "quitters", introduce: false },
  { kind: "word", ru: "никогда", en: "never", key: "never", introduce: false },
  { kind: "word", ru: "не побеждают", en: "win", key: "win", introduce: false },
  { kind: "plain", text: "." },

  { kind: "word", ru: "Но", en: "But", key: "but", introduce: false },
  { kind: "word", ru: "если", en: "if", key: "if", introduce: false },
  { kind: "word", ru: "ты", en: "you", key: "you", introduce: false },
  { kind: "word", ru: "никогда", en: "never", key: "never", introduce: false },
  { kind: "word", ru: "не побеждаешь", en: "win", key: "win", introduce: false },
  { kind: "word", ru: "и", en: "and", key: "and", introduce: false },
  { kind: "word", ru: "никогда", en: "never", key: "never", introduce: false },
  { kind: "word", ru: "не сдаёшься", en: "quit", key: "quit", introduce: true },
  { kind: "plain", text: "," },
  { kind: "word", ru: "ты", en: "you", key: "you", introduce: false },
  { kind: "word", ru: "просто", en: "just", key: "just", introduce: false },
  { kind: "word", ru: "конченый идиот", en: "a fucking idiot", key: "idiot", introduce: false },
  { kind: "plain", text: "." },

  { kind: "word", ru: "Так что", en: "So", key: "so", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "думаю", en: "I think", key: "ithink", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "когда", en: "when", key: "when", introduce: false },
  { kind: "word", ru: "ты", en: "you", key: "you", introduce: false },
  { kind: "word", ru: "сделал", en: "have done", key: "havedone", introduce: false },
  { kind: "word", ru: "всё, что мог", en: "what you could do", key: "whatcould", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "а всё равно", en: "and still", key: "andstill", introduce: false },
  { kind: "word", ru: "большую часть времени", en: "the majority of the time", key: "majority", introduce: false },
  { kind: "word", ru: "чувствуешь себя", en: "you feel", key: "youfeel", introduce: false },
  { kind: "word", ru: "пустым", en: "empty", key: "empty", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "неудовлетворённым", en: "unsatisfied", key: "unsatisfied", introduce: true },
  { kind: "word", ru: "и", en: "and", key: "and", introduce: false },
  { kind: "word", ru: "одиноким", en: "alone", key: "alone", introduce: false },
  { kind: "plain", text: "." },

  { kind: "word", ru: "Мне кажется", en: "I think", key: "ithink", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "есть", en: "there was", key: "therewas", introduce: false },
  { kind: "word", ru: "особый тип", en: "a type", key: "type", introduce: false },
  { kind: "word", ru: "одиночества", en: "loneliness", key: "loneliness", introduce: true },
  { kind: "plain", text: "," },
  { kind: "word", ru: "когда", en: "when", key: "when", introduce: false },
  { kind: "word", ru: "ты", en: "you", key: "you", introduce: false },
  { kind: "word", ru: "с кем-то", en: "with someone", key: "withsomeone", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "но", en: "but", key: "but", introduce: false },
  { kind: "word", ru: "чувствуешь себя", en: "you feel", key: "youfeel", introduce: false },
  { kind: "word", ru: "очень", en: "very", key: "very", introduce: false },
  { kind: "word", ru: "одиноким", en: "lonely", key: "lonely", introduce: false },
  { kind: "plain", text: "—" },
  { kind: "word", ru: "это очень", en: "that is a very", key: "thatisavery", introduce: false },
  { kind: "word", ru: "уникальный", en: "unique", key: "unique", introduce: true },
  { kind: "word", ru: "вид", en: "kind", key: "kind", introduce: false },
  { kind: "word", ru: "ада", en: "hell", key: "hell", introduce: true },
  { kind: "plain", text: "." },
];

const text = await prisma.text.create({
  data: {
    title: "Когда пора остановиться",
    sourceUrl: null,
    tokens: {
      create: tokens.map((tok, order) =>
        tok.kind === "plain"
          ? { order, plain: tok.text }
          : { order, key: tok.key, en: tok.en, ru: tok.ru, introduce: tok.introduce },
      ),
    },
  },
  select: { id: true, title: true },
});

console.log("Added new text:", text.id, text.title);
await prisma.$disconnect();
