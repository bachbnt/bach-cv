/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

let started = false;

/**
 * Turns on Firebase App Check with reCAPTCHA v3, so Firestore can tell requests from this site from scripts.
 * Off (and free of cost) until `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set. It never throws: if reCAPTCHA cannot load
 * (an ad blocker, for example) the requests simply go without a token. What happens then depends on whether App
 * Check is *enforced* for Firestore in the Firebase console; see the README before turning enforcement on.
 */
export function enableAppCheck(
  app: FirebaseApp,
  siteKey: string | undefined = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
): void {
  if (started || !siteKey || typeof window === 'undefined') return;
  started = true;
  try {
    if (process.env.NODE_ENV !== 'production') {
      // locally the real check fails on localhost: the console prints a debug token to register in the Firebase console
      (
        globalThis as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }
      ).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch {
    // already initialised, or the browser blocks it: carry on without App Check
  }
}
