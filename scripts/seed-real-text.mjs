// Replaces all seeded/test data with the one real text for the first
// hands-on test. Resets vocabulary progress so it starts at zero, matching
// a genuine first session.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const tokens = [
  // Intro
  { kind: "word", ru: "Если", en: "if", key: "if", introduce: false },
  { kind: "word", ru: "ты", en: "you're", key: "you", introduce: false },
  { kind: "word", ru: "не уверена", en: "unsure", key: "unsure", introduce: true },
  { kind: "word", ru: "в", en: "about", key: "about", introduce: false },
  { kind: "word", ru: "своих", en: "your", key: "your", introduce: false },
  { kind: "word", ru: "отношениях", en: "relationship", key: "relationship", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "задай", en: "ask", key: "ask", introduce: false },
  { kind: "word", ru: "себе", en: "yourself", key: "yourself", introduce: false },
  { kind: "word", ru: "следующие", en: "these", key: "these", introduce: false },
  { kind: "word", ru: "вопросы", en: "questions", key: "question", introduce: false },
  { kind: "plain", text: "." },

  // Q1
  { kind: "word", ru: "Первый", en: "Number one", key: "numberone", introduce: false },
  { kind: "plain", text: ":" },
  { kind: "word", ru: "Если", en: "if", key: "if", introduce: false },
  { kind: "word", ru: "бы", en: "would", key: "would", introduce: false },
  { kind: "word", ru: "кто-то", en: "someone", key: "someone", introduce: false },
  { kind: "word", ru: "сказал", en: "told", key: "tell", introduce: false },
  { kind: "word", ru: "что", en: "that", key: "that", introduce: false },
  { kind: "word", ru: "ты", en: "you", key: "you", introduce: false },
  { kind: "word", ru: "очень похожа на", en: "a lot like", key: "alotlike", introduce: false },
  { kind: "word", ru: "своего", en: "your", key: "your", introduce: false },
  { kind: "word", ru: "партнёра", en: "partner", key: "partner", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "было бы это", en: "would this be", key: "wouldthisbe", introduce: false },
  { kind: "word", ru: "для", en: "to", key: "to", introduce: false },
  { kind: "word", ru: "тебя", en: "you", key: "you", introduce: false },
  { kind: "word", ru: "комплиментом", en: "compliment", key: "compliment", introduce: true },
  { kind: "plain", text: "?" },

  // Q2
  { kind: "word", ru: "Второй", en: "Number two", key: "numbertwo", introduce: false },
  { kind: "plain", text: ":" },
  { kind: "word", ru: "Ты", en: "you", key: "you", introduce: false },
  { kind: "word", ru: "по-настоящему", en: "truly", key: "truly", introduce: false },
  { kind: "word", ru: "счастлива", en: "fulfilled", key: "fulfilled", introduce: true },
  { kind: "plain", text: "," },
  { kind: "word", ru: "или", en: "or", key: "or", introduce: false },
  { kind: "word", ru: "просто", en: "just", key: "just", introduce: false },
  { kind: "word", ru: "менее", en: "less", key: "less", introduce: false },
  { kind: "word", ru: "одинока", en: "lonely", key: "lonely", introduce: true },
  { kind: "plain", text: "?" },

  // Q3
  { kind: "word", ru: "Третий", en: "Number three", key: "numberthree", introduce: false },
  { kind: "plain", text: ":" },
  { kind: "word", ru: "Можешь ли ты", en: "are you able to", key: "ableto", introduce: false },
  { kind: "word", ru: "не извиняясь", en: "unapologetically", key: "unapologetically", introduce: true },
  { kind: "word", ru: "оставаться", en: "be", key: "be", introduce: false },
  { kind: "word", ru: "собой", en: "yourself", key: "yourself", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "когда", en: "when", key: "when", introduce: false },
  { kind: "word", ru: "чувствуешь", en: "feel", key: "feel", introduce: false },
  { kind: "word", ru: "необходимость", en: "the need", key: "need", introduce: false },
  { kind: "word", ru: "вести себя", en: "show up", key: "showup", introduce: false },
  { kind: "word", ru: "иначе", en: "differently", key: "differently", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "чтобы", en: "to", key: "to2", introduce: false },
  { kind: "word", ru: "угодить", en: "please", key: "please", introduce: false },
  { kind: "word", ru: "партнёру", en: "partner", key: "partner", introduce: false },
  { kind: "plain", text: "?" },

  // Q4
  { kind: "word", ru: "Четвёртый", en: "Number four", key: "numberfour", introduce: false },
  { kind: "plain", text: ":" },
  { kind: "word", ru: "Ты", en: "you", key: "you", introduce: false },
  { kind: "word", ru: "влюблена", en: "in love", key: "inlove", introduce: false },
  { kind: "word", ru: "в", en: "with", key: "with", introduce: false },
  { kind: "word", ru: "партнёра", en: "partner", key: "partner", introduce: false },
  { kind: "word", ru: "целиком", en: "as a whole", key: "asawhole", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "какой он есть", en: "who your partner is", key: "whois", introduce: false },
  { kind: "word", ru: "прямо сейчас", en: "right now", key: "rightnow", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "или", en: "or", key: "or", introduce: false },
  { kind: "word", ru: "влюблена", en: "in love", key: "inlove", introduce: false },
  { kind: "word", ru: "только", en: "only", key: "only", introduce: false },
  { kind: "word", ru: "в", en: "in", key: "in", introduce: false },
  { kind: "word", ru: "его", en: "their", key: "their", introduce: false },
  { kind: "word", ru: "хорошие", en: "good", key: "good", introduce: false },
  { kind: "word", ru: "стороны", en: "sides", key: "sides", introduce: false },
  { kind: "word", ru: "и", en: "and", key: "and", introduce: false },
  { kind: "word", ru: "потенциал", en: "potential", key: "potential", introduce: true },
  { kind: "plain", text: "," },
  { kind: "word", ru: "в саму идею", en: "the idea", key: "idea", introduce: false },
  { kind: "word", ru: "о", en: "of", key: "of", introduce: false },
  { kind: "word", ru: "нём", en: "them", key: "them", introduce: false },
  { kind: "plain", text: "?" },

  // Q5
  { kind: "word", ru: "Пятый", en: "Number five", key: "numberfive", introduce: false },
  { kind: "plain", text: ":" },
  { kind: "word", ru: "Хотела бы ты", en: "would you want", key: "wouldyouwant", introduce: false },
  { kind: "word", ru: "чтобы", en: "to", key: "to3", introduce: false },
  { kind: "word", ru: "твой", en: "your", key: "your", introduce: false },
  { kind: "word", ru: "будущий", en: "future", key: "future", introduce: false },
  { kind: "word", ru: "или", en: "or", key: "or", introduce: false },
  { kind: "word", ru: "воображаемый", en: "imagined", key: "imagined", introduce: true },
  { kind: "word", ru: "ребёнок", en: "child", key: "child", introduce: false },
  { kind: "word", ru: "встречался", en: "date", key: "date", introduce: false },
  { kind: "word", ru: "с кем-то похожим на", en: "somebody like", key: "somebodylike", introduce: false },
  { kind: "word", ru: "твоего", en: "your", key: "your", introduce: false },
  { kind: "word", ru: "партнёра", en: "partner", key: "partner", introduce: false },
  { kind: "plain", text: "?" },
  { kind: "word", ru: "Если бы", en: "If", key: "if", introduce: false },
  { kind: "word", ru: "у вас с партнёром", en: "you and your partner", key: "youandpartner", introduce: false },
  { kind: "word", ru: "был", en: "had", key: "had", introduce: false },
  { kind: "word", ru: "ребёнок", en: "a child", key: "child", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "а потом", en: "and then", key: "andthen", introduce: false },
  { kind: "word", ru: "ты", en: "you", key: "you", introduce: false },
  { kind: "word", ru: "умерла", en: "died", key: "died", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "и", en: "and", key: "and", introduce: false },
  { kind: "word", ru: "ребёнка", en: "your child", key: "yourchild", introduce: false },
  { kind: "word", ru: "растил бы", en: "was gonna be raised", key: "raised", introduce: false },
  { kind: "word", ru: "только он", en: "by them", key: "bythem", introduce: false },
  { kind: "plain", text: "—" },
  { kind: "word", ru: "со всеми", en: "with all of their", key: "withall", introduce: false },
  { kind: "word", ru: "своими", en: "their", key: "their", introduce: false },
  { kind: "word", ru: "привычками", en: "habits", key: "habits", introduce: true },
  { kind: "plain", text: "," },
  { kind: "word", ru: "ценностями", en: "values", key: "values", introduce: true },
  { kind: "plain", text: "," },
  { kind: "word", ru: "поведением", en: "behaviors", key: "behaviors", introduce: false },
  { kind: "plain", text: "," },
  { kind: "plain", text: "—" },
  { kind: "word", ru: "тревожило бы", en: "would worry", key: "worry", introduce: false },
  { kind: "word", ru: "тебя", en: "you", key: "you", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "казалось бы", en: "would you feel like", key: "feellike", introduce: false },
  { kind: "word", ru: "проблемой", en: "a problem", key: "problem", introduce: false },
  { kind: "plain", text: "," },
  { kind: "word", ru: "или", en: "or", key: "or", introduce: false },
  { kind: "word", ru: "ты была бы", en: "would you be", key: "wouldyoube", introduce: false },
  { kind: "word", ru: "этому только рада", en: "super happy with it", key: "superhappy", introduce: false },
  { kind: "plain", text: "?" },
];

await prisma.text.deleteMany({});
await prisma.word.deleteMany({});

await prisma.text.create({
  data: {
    title: "5 вопросов о твоих отношениях",
    sourceUrl: "https://www.instagram.com/reel/DbTMolWKNia/?igsh=MW5laHdzbTVwMTht",
    tokens: {
      create: tokens.map((tok, order) =>
        tok.kind === "plain"
          ? { order, plain: tok.text }
          : { order, key: tok.key, en: tok.en, ru: tok.ru, introduce: tok.introduce },
      ),
    },
  },
});

console.log("Reset progress and seeded the real test text");
await prisma.$disconnect();
