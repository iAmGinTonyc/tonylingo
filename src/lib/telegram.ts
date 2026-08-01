// Minimal surface of the Telegram Web App SDK we actually use.
// The full SDK is loaded globally via <script src="telegram-web-app.js">
// in the root layout — this just types and wraps the calls.
type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  disableVerticalSwipes?: () => void;
  isExpanded: boolean;
};

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

// True only when the app is actually running inside Telegram's WebView.
export function isInTelegram() {
  return typeof window !== "undefined" && !!window.Telegram?.WebApp;
}

export function initTelegramWebApp() {
  const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  if (!tg) return;

  tg.ready();
  tg.expand();
  tg.setHeaderColor("#05161a");
  tg.setBackgroundColor("#05161a");
  tg.disableVerticalSwipes?.();
}
