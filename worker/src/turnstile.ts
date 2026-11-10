/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TIMEOUT_MS = 5_000;

/**
 * Asks Cloudflare whether a Turnstile token is a real, unused one. Any failure (no token, a network error, a bad answer) is `false`:
 * the caller sends nothing then. `ip` is the visitor's address (`CF-Connecting-IP`), which Cloudflare uses as an extra check.
 */
export const verifyTurnstile = async (
  secret: string,
  token: string | undefined,
  ip: string | null,
): Promise<boolean> => {
  if (!token) return false;
  const form = new URLSearchParams({ secret, response: token });
  if (ip && ip !== 'unknown') form.set('remoteip', ip);
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return false;
    const result: unknown = await response.json();
    return (
      typeof result === 'object' &&
      result !== null &&
      (result as { success?: unknown }).success === true
    );
  } catch {
    return false;
  }
};
