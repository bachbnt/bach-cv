/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Page } from '@playwright/test';

/** A 1 × 1 PNG. */
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

/**
 * Serves the pictures of the content (they live on `raw.githubusercontent.com`) from memory, so a test never waits for the network.
 * They answer a HEAD with their weight and a GET with the bytes, and allow other origins to read them, like the real host does.
 * The route is on the context, so a tab that the page opens gets the picture too.
 */
export async function mockImages(page: Page) {
  await page
    .context()
    .route('https://raw.githubusercontent.com/**', (route) => {
      const headers = {
        'access-control-allow-origin': '*',
        'content-type': 'image/png',
        'content-length': String(PIXEL.length),
      };
      return route.request().method() === 'HEAD'
        ? route.fulfill({ status: 200, headers })
        : route.fulfill({ status: 200, headers, body: PIXEL });
    });
}

/**
 * Makes the browser refuse every request to another origin, as the `connect-src` of `firebase.json` does for a `fetch` to the host
 * of a picture. Pictures in `<img>` are not affected (`img-src` lets https through). Call it before `page.goto`.
 */
export async function blockCrossOriginFetch(page: Page) {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content =
        "connect-src 'self' https://firestore.googleapis.com http://localhost:9999";
      document.head.append(meta);
    });
  });
}
