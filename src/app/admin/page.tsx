"use client";

import { useEffect, useState } from "react";

type TextSummary = {
  id: string;
  title: string;
  sourceUrl: string | null;
  createdAt: string;
};

export default function AdminPage() {
  const [texts, setTexts] = useState<TextSummary[]>([]);
  const [rawText, setRawText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [tgStatus, setTgStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [tgError, setTgError] = useState<string | null>(null);
  const [notifying, setNotifying] = useState<string | null>(null);
  const [notifyResult, setNotifyResult] = useState<string | null>(null);

  async function loadTexts() {
    const res = await fetch("/api/admin/texts");
    if (res.ok) {
      const data = await res.json();
      setTexts(data.texts);
    }
  }

  useEffect(() => {
    (async () => {
      await loadTexts();
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setJustAdded(null);

    const res = await fetch("/api/admin/texts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText, sourceUrl: sourceUrl || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Что-то пошло не так");
      return;
    }

    setJustAdded(data.text.title);
    setRawText("");
    setSourceUrl("");
    loadTexts();
  }

  async function onSetupTelegram() {
    setTgStatus("loading");
    setTgError(null);
    const res = await fetch("/api/admin/telegram/setup", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setTgStatus("error");
      setTgError(data.error ?? "Не получилось");
      return;
    }
    setTgStatus("ok");
  }

  async function onNotify(textId: string) {
    setNotifying(textId);
    setNotifyResult(null);
    const res = await fetch("/api/admin/texts/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ textId }),
    });
    const data = await res.json().catch(() => ({}));
    setNotifying(null);
    setNotifyResult(res.ok ? `Отправлено: ${data.sent} из ${data.total}` : data.error ?? "Не получилось");
  }

  return (
    <div className="admin">
      <h1>Telegram-бот</h1>
      <p className="hint">
        Одна кнопка настраивает всё: постоянную кнопку «Открыть» у бота и вебхук для команды /start. Нажимай, когда токен бота уже добавлен в Environment Variables на Vercel.
      </p>
      <button className="btn-secondary" onClick={onSetupTelegram} disabled={tgStatus === "loading"}>
        {tgStatus === "loading" ? "Настраиваю..." : "Настроить бота"}
      </button>
      {tgStatus === "ok" && (
        <p className="hint" style={{ marginTop: 12, color: "var(--accent-soft)" }}>
          Готово — теперь напиши боту /start в Telegram.
        </p>
      )}
      {tgStatus === "error" && <div className="admin-error" style={{ marginTop: 12 }}>{tgError}</div>}

      <h1 style={{ marginTop: 48 }}>Добавить текст</h1>
      <p className="hint">Вставь английский текст — Claude переведёт его и разметит на слова. Ссылка на источник (видео/фото) необязательна.</p>

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="sourceUrl">Ссылка на источник</label>
          <input
            id="sourceUrl"
            type="url"
            placeholder="https://..."
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="rawText">Английский текст</label>
          <textarea
            id="rawText"
            rows={10}
            required
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Вставь сюда транскрибированный текст..."
          />
        </div>
        {error && <div className="admin-error">{error}</div>}
        <button className="btn-primary" type="submit" disabled={submitting || !rawText.trim()}>
          {submitting ? "Обрабатываю..." : "Обработать и сохранить"}
        </button>
      </form>

      {justAdded && (
        <p className="hint" style={{ marginTop: 16, color: "var(--accent-soft)" }}>
          Готово: «{justAdded}» сохранено и теперь доступно в приложении.
        </p>
      )}

      <h1 style={{ marginTop: 48 }}>Сохранённые тексты</h1>
      {notifyResult && (
        <p className="hint" style={{ color: "var(--accent-soft)" }}>
          {notifyResult}
        </p>
      )}
      {texts.length === 0 && <p className="hint">Пока пусто.</p>}
      {texts.map((t) => (
        <div className="admin-list-item" key={t.id}>
          <div>
            <div className="title">{t.title}</div>
            <div className="meta">{new Date(t.createdAt).toLocaleString("ru-RU")}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {t.sourceUrl && (
              <a className="source-link" href={t.sourceUrl} target="_blank" rel="noopener">
                источник
              </a>
            )}
            <button className="btn-secondary" onClick={() => onNotify(t.id)} disabled={notifying === t.id}>
              {notifying === t.id ? "..." : "Уведомить в Telegram"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
