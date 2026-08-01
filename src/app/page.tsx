"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { initTelegramWebApp, getTelegramInitData } from "@/lib/telegram";

type Token =
  | { plain: string; key: null; en: null; ru: null; introduce: false }
  | { plain: null; key: string; en: string; ru: string; introduce: boolean };

type TextData = {
  id: string;
  title: string;
  sourceUrl: string | null;
  createdAt: string;
  tokens: Token[];
};

type TextSummary = { id: string; title: string; createdAt: string };

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  if (isSameDay(d, new Date())) return "Сегодня";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

type WordStatus = "know" | "learn";
type WordsMap = Record<string, { en: string; ru: string; status: WordStatus }>;

const ATTACHED = /^[,.!?;:)\]»”…]$/;

function needsSpaceBefore(token: Token, isFirst: boolean) {
  if (isFirst) return false;
  if (token.plain !== null && ATTACHED.test(token.plain.trim())) return false;
  return true;
}

export default function ReadingApp() {
  const [tab, setTab] = useState<"read" | "know" | "learn">("read");
  const [text, setText] = useState<TextData | null | undefined>(undefined);
  const [words, setWords] = useState<WordsMap>({});
  const [searchKnow, setSearchKnow] = useState("");
  const [searchLearn, setSearchLearn] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveList, setArchiveList] = useState<TextSummary[] | null>(null);
  const [splashName, setSplashName] = useState<string | null>(null);
  const [splashHiding, setSplashHiding] = useState(false);

  const appRef = useRef<HTMLDivElement>(null);
  const tokenRefs = useRef<Record<number, HTMLElement | null>>({});
  const popupRef = useRef<HTMLDivElement>(null);
  const [popup, setPopup] = useState<{ index: number; left: number; top: number; arrowLeft: number } | null>(null);

  function fetchText(id?: string) {
    fetch(id ? `/api/texts/${id}` : "/api/texts/latest")
      .then((r) => r.json())
      .then((d) => setText(d.text ?? null));
  }

  function reloadWords() {
    fetch("/api/words")
      .then((r) => r.json())
      .then((d) => {
        const map: WordsMap = {};
        for (const w of d.words as { key: string; en: string; ru: string; status: WordStatus }[]) {
          map[w.key] = { en: w.en, ru: w.ru, status: w.status };
        }
        setWords(map);
      });
  }

  useEffect(() => {
    initTelegramWebApp();

    async function boot() {
      const initData = getTelegramInitData();
      if (initData) {
        try {
          const res = await fetch("/api/telegram/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.firstName) setSplashName(data.firstName as string);
          }
        } catch {
          // not signed in — carry on with the fallback profile
        }
      }

      const deepLinkId = new URLSearchParams(window.location.search).get("text") ?? undefined;
      fetchText(deepLinkId);
      reloadWords();
    }

    boot();
  }, []);

  useEffect(() => {
    if (!splashName) return;
    const t = setTimeout(() => setSplashHiding(true), 3200);
    return () => clearTimeout(t);
  }, [splashName]);

  function openArchive() {
    setArchiveOpen(true);
    if (archiveList === null) {
      fetch("/api/texts")
        .then((r) => r.json())
        .then((d) => setArchiveList(d.texts));
    }
  }

  async function setStatus(key: string, en: string, ru: string, status: WordStatus) {
    setWords((prev) => ({ ...prev, [key]: { en, ru, status } }));
    setPopup(null);
    await fetch("/api/words", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, en, ru, status }),
    });
  }

  function openPopup(index: number) {
    if (popup?.index === index) {
      setPopup(null);
      return;
    }
    const span = tokenRefs.current[index];
    const app = appRef.current;
    if (!span || !app) return;
    const spanRect = span.getBoundingClientRect();
    const appRect = app.getBoundingClientRect();
    setPopup({
      index,
      left: spanRect.left - appRect.left + spanRect.width / 2,
      top: spanRect.top - appRect.top,
      arrowLeft: 0,
    });
  }

  useLayoutEffect(() => {
    if (!popup || !popupRef.current || !appRef.current) return;
    const popRect = popupRef.current.getBoundingClientRect();
    const appRect = appRef.current.getBoundingClientRect();
    const halfW = popRect.width / 2;
    const min = halfW + 8;
    const max = appRect.width - halfW - 8;
    const clamped = Math.min(Math.max(popup.left, min), max);
    const arrowLeft = halfW + (popup.left - clamped);
    setPopup((p) => (p && p.index === popup.index ? { ...p, left: clamped, arrowLeft } : p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popup?.index]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const know = Object.entries(words).filter(([, w]) => w.status === "know");
  const learn = Object.entries(words).filter(([, w]) => w.status === "learn");

  const knowFiltered = know.filter(
    ([, w]) => !searchKnow || w.en.toLowerCase().includes(searchKnow.toLowerCase()) || w.ru.toLowerCase().includes(searchKnow.toLowerCase()),
  );
  const learnFiltered = learn.filter(
    ([, w]) => !searchLearn || w.en.toLowerCase().includes(searchLearn.toLowerCase()) || w.ru.toLowerCase().includes(searchLearn.toLowerCase()),
  );

  const openToken = popup && text && text.tokens[popup.index];

  return (
    <div className="app" ref={appRef} onClick={() => setPopup(null)}>
      <header className="top">
        <span className="wordmark">
          tony<b>lingo</b>
        </span>
        <span className="stat">
          <span>
            <b>{know.length}</b> знаю
          </span>
          <span>
            <b>{learn.length}</b> учу
          </span>
        </span>
      </header>

      {tab === "read" && (
        <section className="view active">
          <div className="scroll" onScroll={() => setPopup(null)}>
            {text === undefined && <div className="empty-state">Загрузка...</div>}
            {text === null && (
              <div className="empty-state">
                Пока нет текстов — жди, когда появится первый.
              </div>
            )}
            {text && !archiveOpen && (
              <>
                <div className="eyebrow-row">
                  <div className="eyebrow-left">
                    <div className="eyebrow">{dayLabel(text.createdAt)}</div>
                    <button
                      className="archive-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        openArchive();
                      }}
                    >
                      Архив
                    </button>
                  </div>
                  {text.sourceUrl && (
                    <a className="source-link" href={text.sourceUrl} target="_blank" rel="noopener">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 4h6v6" />
                        <path d="M20 4L10 14" />
                        <path d="M18 13v5.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H11" />
                      </svg>
                      Источник
                    </a>
                  )}
                </div>
                <p className="passage">
                  {text.tokens.map((tok, i) => {
                    const space = needsSpaceBefore(tok, i === 0) ? " " : "";
                    if (tok.plain !== null) {
                      return <span key={i}>{space}{tok.plain}</span>;
                    }
                    const st = words[tok.key]?.status;
                    const asEnglish = st === "know" || st === "learn" || tok.introduce;
                    const display = asEnglish ? tok.en : tok.ru;
                    const cls = ["w", asEnglish && st !== "know" ? "new" : "", popup?.index === i ? "tapped" : ""]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <span key={i}>
                        {space}
                        <span
                          className={cls}
                          tabIndex={0}
                          role="button"
                          ref={(el) => {
                            tokenRefs.current[i] = el;
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openPopup(i);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openPopup(i);
                            }
                          }}
                        >
                          {display}
                        </span>
                      </span>
                    );
                  })}
                </p>
              </>
            )}

            {archiveOpen && (
              <>
                <div className="archive-header">
                  <button
                    className="archive-back"
                    onClick={(e) => {
                      e.stopPropagation();
                      setArchiveOpen(false);
                    }}
                    aria-label="Назад к чтению"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 5l-7 7 7 7" />
                    </svg>
                  </button>
                  <span className="archive-title">Архив текстов</span>
                </div>
                <div className="list">
                  {archiveList === null && <div className="empty-state">Загрузка...</div>}
                  {archiveList?.length === 0 && <div className="empty-state">Пока пусто</div>}
                  {archiveList?.map((t) => {
                    const today = isSameDay(new Date(t.createdAt), new Date());
                    return (
                      <button
                        key={t.id}
                        className="archive-row"
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchText(t.id);
                          setArchiveOpen(false);
                        }}
                      >
                        <span className="archive-row-title">{t.title}</span>
                        <span className={"archive-row-date" + (today ? " today" : "")}>{dayLabel(t.createdAt)}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {tab === "know" && (
        <section className="view active">
          <div className="scroll">
            <div className="eyebrow">Слова, которые знаю</div>
            <div className="search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input placeholder="Искать слово" value={searchKnow} onChange={(e) => setSearchKnow(e.target.value)} />
            </div>
            <div className="list">
              {knowFiltered.length === 0 && (
                <div className="empty-state">
                  {searchKnow ? "Ничего не найдено" : "Пока пусто — здесь появятся слова, которые ты отметишь галочкой"}
                </div>
              )}
              {knowFiltered.map(([key, w]) => (
                <div className="row" key={key}>
                  <div className="row-text">
                    <div className="row-en">{w.en}</div>
                    <div className="row-ru">{w.ru}</div>
                  </div>
                  <button
                    className="row-btn to-learn"
                    aria-label="Перенести в «Учу»"
                    onClick={() => {
                      setStatus(key, w.en, w.ru, "learn");
                      setToast(`«${w.en}» перенесено в «Учу»`);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4v16" />
                      <path d="M4 5h13l-2.5 3.5L17 12H4" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === "learn" && (
        <section className="view active">
          <div className="scroll">
            <div className="eyebrow">Слова, которые учу</div>
            <button
              className={"cta-study" + (learn.length === 0 ? " empty" : "")}
              onClick={() => learn.length > 0 && setToast("Режим повторения — отдельный экран, спроектируем следующим")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="14" height="14" rx="2" />
                <path d="M7 9h6M7 13h4" />
                <path d="M21 7v10" />
              </svg>
              {learn.length > 0 ? `Поучить слова (${learn.length})` : "Нечего повторять"}
            </button>
            <div className="search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input placeholder="Искать слово" value={searchLearn} onChange={(e) => setSearchLearn(e.target.value)} />
            </div>
            <div className="list">
              {learnFiltered.length === 0 && (
                <div className="empty-state">
                  {searchLearn ? "Ничего не найдено" : "Пока пусто — нажми крестик у слова в тексте, чтобы добавить его сюда"}
                </div>
              )}
              {learnFiltered.map(([key, w]) => (
                <div className="row" key={key}>
                  <div className="row-text">
                    <div className="row-en">{w.en}</div>
                    <div className="row-ru">{w.ru}</div>
                  </div>
                  <button
                    className="row-btn to-know"
                    aria-label="Перенести в «Знаю»"
                    onClick={() => {
                      setStatus(key, w.en, w.ru, "know");
                      setToast(`«${w.en}» перенесено в «Знаю»`);
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <nav className="tabbar">
        <button className={"tab" + (tab === "read" ? " active" : "")} onClick={() => setTab("read")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
            <path d="M20 5.5C20 4.7 19.3 4 18.5 4H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5z" />
          </svg>
          <span>Читаю</span>
        </button>
        <button className={"tab" + (tab === "know" ? " active" : "")} onClick={() => setTab("know")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12.5l2.5 2.5L16 9.5" />
          </svg>
          <span>Знаю</span>
        </button>
        <button className={"tab" + (tab === "learn" ? " active" : "")} onClick={() => setTab("learn")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4v16" />
            <path d="M4 5h13l-2.5 3.5L17 12H4" />
          </svg>
          <span>Учу</span>
        </button>
      </nav>

      {popup && openToken && openToken.plain === null && (
        <div
          className="popup show"
          ref={popupRef}
          style={{ left: popup.left, top: popup.top }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pop-word">{openToken.en}</div>
          <div className="pop-ru">{openToken.ru}</div>
          <div className="pop-actions">
            <button className="pop-btn" onClick={() => setStatus(openToken.key, openToken.en, openToken.ru, "learn")}>
              <span className="btn btn-no">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </span>
              <span className="label">Учу</span>
            </button>
            <button className="pop-btn" onClick={() => setStatus(openToken.key, openToken.en, openToken.ru, "know")}>
              <span className="btn btn-yes">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12l5 5L20 6" />
                </svg>
              </span>
              <span className="label">Знаю</span>
            </button>
          </div>
          <div className="pop-arrow" style={{ left: popup.arrowLeft }} />
        </div>
      )}

      <div className={"toast" + (toast ? " show" : "")}>{toast}</div>

      {splashName && (
        <div
          className={"splash" + (splashHiding ? " hide" : "")}
          onClick={(e) => {
            e.stopPropagation();
            setSplashHiding(true);
          }}
        >
          <p className="splash-text">
            ты знаешь инглиш потому что ты <b>{splashName}</b>, или ты <b>{splashName}</b> потому что ты знаешь инглиш
          </p>
        </div>
      )}
    </div>
  );
}
