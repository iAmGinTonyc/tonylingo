import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const client = new Anthropic();

const PlainToken = z.object({
  kind: z.literal("plain"),
  text: z.string(),
});
const WordToken = z.object({
  kind: z.literal("word"),
  ru: z.string(),
  en: z.string(),
  key: z.string(),
  introduce: z.boolean(),
});
const TokenizedText = z.object({
  title: z.string(),
  tokens: z.array(z.union([PlainToken, WordToken])),
});

export type TokenizedText = z.infer<typeof TokenizedText>;

const SYSTEM_PROMPT = `Ты — переводчик и разметчик текстов для приложения TonyLingo, которое учит английскому через чтение.

Тебе дают английский текст. Твоя задача — превратить его в русский текст с вкраплениями английских слов, разбитый на токены для интерактивного чтения.

ПРАВИЛА:
1. Переведи текст на естественный русский язык.
2. Разбей ПОЛНОСТЬЮ ВЕСЬ текст на токены в порядке чтения ПО-РУССКИ (не по-английски). Каждое слово или короткая устойчивая фраза русского перевода — отдельный токен kind="word" с полями:
   - ru: русская форма как она должна отображаться в этом месте текста (с правильным падежом/родом/регистром)
   - en: английский оригинал этого слова в соответствующей форме и регистре
   - key: нормализованный английский ключ в нижнем регистре, словарная форма (например "wake", а не "wakes"; "she"; "the mug" для устойчивых фраз) — одинаковый key у всех вхождений одного и того же слова/смысла, даже в разных предложениях этого текста
   - introduce: true только для слов из "новых слов этого текста" (см. правило 5)
3. Знаки препинания (запятая, точка, тире и т.п.) и непереводимые имена собственные — токены kind="plain" с полем text, без ru/en/key.
4. Функциональные слова (местоимения, предлоги, союзы) тоже должны стать токенами kind="word" — в приложении кликабельно буквально каждое переводимое слово, пропускать нельзя.
5. Выбери от 5 до 10 слов (пропорционально длине текста — примерно 5-10 на каждые 200 слов, минимум 3 для очень коротких текстов), которых ещё нет в списке "уже знает"/"сейчас учит" ниже — это новые слова, вводимые этим текстом. Пометь их introduce=true. Предпочитай общеупотребительные, полезные слова, а не редкие.
6. Если слово из текста уже есть в списке "уже знает" или "сейчас учит" ниже — используй тот же key, но НЕ ставь introduce=true.
7. title — короткое русское название текста (3-6 слов).

Верни только структурированный результат.`;

export async function tokenizeText(params: {
  rawText: string;
  knownKeys: string[];
  learningKeys: string[];
}): Promise<TokenizedText> {
  const { rawText, knownKeys, learningKeys } = params;

  const userPrompt = `Текст для обработки:\n"""\n${rawText}\n"""\n\nСлова, которые профиль уже знает (key): ${
    knownKeys.join(", ") || "(пока пусто)"
  }\nСлова, которые профиль сейчас учит (key): ${learningKeys.join(", ") || "(пока пусто)"}`;

  const response = await client.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: zodOutputFormat(TokenizedText),
    },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  if (!response.parsed_output) {
    throw new Error("Claude вернул пустой результат разметки текста");
  }
  return response.parsed_output;
}
