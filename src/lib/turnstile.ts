/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// Cloudflare Turnstile for the contact notification: an invisible check that tells the Worker the sender is a browser being used by
// a person. It is optional and never in the way: with no site key, or when anything goes wrong, there is simply no token, and the
// message is saved in Firestore all the same (the Worker only decides whether it sends the email).

/** The public site key of an Invisible widget. Empty means Turnstile is off. */
export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

const SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
/** How long a visitor may wait for the token before the message goes without one. */
export const TURNSTILE_TIMEOUT_MS = 8_000;

/** The part of `window.turnstile` that is used. */
interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      'error-callback': () => void;
      'timeout-callback': () => void;
      'expired-callback': () => void;
    },
  ): string | undefined;
  remove(widgetId: string): void;
}

const api = (): TurnstileApi | undefined =>
  (window as unknown as { turnstile?: TurnstileApi }).turnstile;

let loading: Promise<TurnstileApi> | null = null;

/** Loads Cloudflare's script the first time a token is needed (never on page load). A failed load is tried again next time. */
const loadApi = (): Promise<TurnstileApi> => {
  const ready = api();
  if (ready) return Promise.resolve(ready);
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      const loaded = api();
      if (loaded) resolve(loaded);
      else reject(new Error('turnstile_missing'));
    };
    script.onerror = () => reject(new Error('turnstile_load_failed'));
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    loading = null;
    throw error;
  });
  return loading;
};

/** Renders one invisible widget off screen and resolves with its token (or rejects). The widget is removed afterwards. */
const solve = async (siteKey: string, signal: AbortSignal): Promise<string> => {
  const turnstile = await loadApi();
  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText =
    'position:fixed;left:-10000px;top:0;width:1px;height:1px;overflow:hidden';
  document.body.appendChild(container);
  let widgetId: string | undefined;
  try {
    return await new Promise<string>((resolve, reject) => {
      const fail = () => reject(new Error('turnstile_failed'));
      // the caller gave up waiting: take the widget away
      signal.addEventListener('abort', fail, { once: true });
      if (signal.aborted) return fail();
      widgetId = turnstile.render(container, {
        sitekey: siteKey,
        callback: resolve,
        'error-callback': fail,
        'timeout-callback': fail,
        'expired-callback': fail,
      });
    });
  } finally {
    if (widgetId) {
      try {
        turnstile.remove(widgetId);
      } catch {
        // the widget is gone anyway once its container is removed
      }
    }
    container.remove();
  }
};

/**
 * A Turnstile token for the message being sent, or `null`: no site key (nothing is touched, not even the DOM), no browser, the script
 * is blocked, the check fails or takes longer than `timeoutMs`. It never throws, so the caller can always go on.
 * A token is good for one use, so each message asks for its own.
 */
export const getTurnstileToken = async (
  siteKey: string = TURNSTILE_SITE_KEY,
  timeoutMs: number = TURNSTILE_TIMEOUT_MS,
): Promise<string | null> => {
  if (!siteKey || typeof document === 'undefined') return null;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      solve(siteKey, controller.signal),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
};
