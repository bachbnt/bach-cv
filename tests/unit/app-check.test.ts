/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { FirebaseApp } from 'firebase/app';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const initializeAppCheck = vi.fn();
vi.mock('firebase/app-check', () => ({
  initializeAppCheck: (...args: unknown[]) => initializeAppCheck(...args),
  ReCaptchaV3Provider: class {
    constructor(public siteKey: string) {}
  },
}));

const app = {} as FirebaseApp;

/** A fresh copy of the module, because it remembers that it has started. */
const load = async () => {
  vi.resetModules();
  vi.stubGlobal('window', {});
  return (await import('@/lib/content/app-check')).enableAppCheck;
};

beforeEach(() => {
  initializeAppCheck.mockReset();
  vi.unstubAllGlobals();
});

describe('enableAppCheck', () => {
  it('stays off without a site key', async () => {
    const enable = await load();
    enable(app, undefined);
    enable(app, '');
    expect(initializeAppCheck).not.toHaveBeenCalled();
  });

  it('starts once with reCAPTCHA v3 and refreshes the token by itself', async () => {
    const enable = await load();
    enable(app, 'site-key');
    enable(app, 'site-key');
    expect(initializeAppCheck).toHaveBeenCalledTimes(1);
    const [calledApp, options] = initializeAppCheck.mock
      .calls[0] as unknown as [
      FirebaseApp,
      { provider: { siteKey: string }; isTokenAutoRefreshEnabled: boolean },
    ];
    expect(calledApp).toBe(app);
    expect(options.provider.siteKey).toBe('site-key');
    expect(options.isTokenAutoRefreshEnabled).toBe(true);
  });

  it('does not throw when App Check cannot start', async () => {
    initializeAppCheck.mockImplementation(() => {
      throw new Error('appCheck/already-initialized');
    });
    const enable = await load();
    expect(() => enable(app, 'site-key')).not.toThrow();
  });
});
