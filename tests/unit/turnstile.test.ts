/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { getTurnstileToken } from '@/lib/turnstile';

afterEach(() => vi.unstubAllGlobals());

describe('getTurnstileToken', () => {
  it('is null without a site key, and does not touch the DOM', async () => {
    // a `document` that fails the test if it is used
    const touched = vi.fn();
    vi.stubGlobal(
      'document',
      new Proxy(
        {},
        {
          get: (_target, key) => {
            touched(key);
            return undefined;
          },
        },
      ),
    );
    expect(await getTurnstileToken('')).toBeNull();
    expect(touched).not.toHaveBeenCalled();
  });

  it('is null, and does not throw, where there is no browser', async () => {
    expect(typeof document).toBe('undefined');
    expect(await getTurnstileToken('0x4AAAA')).toBeNull();
  });

  it('is null when the script cannot be loaded, so the form goes on', async () => {
    const script: { onerror?: () => void; src?: string } = {};
    vi.stubGlobal('window', {});
    vi.stubGlobal('document', {
      createElement: () => script,
      head: {
        appendChild: () => queueMicrotask(() => script.onerror?.()),
      },
    });
    expect(await getTurnstileToken('0x4AAAA', 1_000)).toBeNull();
    expect(script.src).toBe(
      'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',
    );
  });

  it('gives up after the timeout when the widget never answers', async () => {
    const removed = vi.fn();
    vi.stubGlobal('window', {
      turnstile: { render: () => 'w1', remove: removed },
    });
    const container = {
      setAttribute: () => undefined,
      style: {} as Record<string, string>,
      remove: vi.fn(),
    };
    vi.stubGlobal('document', {
      createElement: () => container,
      body: { appendChild: () => undefined },
    });
    expect(await getTurnstileToken('0x4AAAA', 20)).toBeNull();
    // the widget and its container are cleaned up after the give-up
    await vi.waitFor(() => expect(removed).toHaveBeenCalledWith('w1'));
    expect(container.remove).toHaveBeenCalled();
  });

  it('resolves the token the widget gives', async () => {
    vi.stubGlobal('window', {
      turnstile: {
        render: (
          _container: unknown,
          options: { callback: (token: string) => void },
        ) => {
          queueMicrotask(() => options.callback('tok-123'));
          return 'w2';
        },
        remove: () => undefined,
      },
    });
    vi.stubGlobal('document', {
      createElement: () => ({
        setAttribute: () => undefined,
        style: {},
        remove: () => undefined,
      }),
      body: { appendChild: () => undefined },
    });
    expect(await getTurnstileToken('0x4AAAA')).toBe('tok-123');
  });
});
