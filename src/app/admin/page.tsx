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

  return (
    <div className="admin">
      <h1>Добавить текст</h1>
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
      {texts.length === 0 && <p className="hint">Пока пусто.</p>}
      {texts.map((t) => (
        <div className="admin-list-item" key={t.id}>
          <div>
            <div className="title">{t.title}</div>
            <div className="meta">{new Date(t.createdAt).toLocaleString("ru-RU")}</div>
          </div>
          {t.sourceUrl && (
            <a className="source-link" href={t.sourceUrl} target="_blank" rel="noopener">
              источник
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
