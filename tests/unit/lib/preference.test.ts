/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { liveSchema } from '@/lib/content/schema';
import {
  keepOf,
  resolvePreference,
  resolveTheme,
  type RemotePref,
} from '@/lib/preference/preference';
import { SKIN_IDS, type SkinId } from '@/lib/skin/skins';

const skin = (
  remote: Partial<RemotePref<SkinId>> = {},
  rest: { url?: string; saved?: string } = {},
) =>
  resolvePreference<SkinId>({
    all: SKIN_IDS,
    keep: 'standard',
    remote: { off: [], ...remote },
    ...rest,
  });

describe('a preference (the skin as the example)', () => {
  it('is the default of the site when nobody says anything', () => {
    expect(skin()).toEqual({
      value: 'standard',
      options: [...SKIN_IDS],
      forced: false,
      locked: false,
    });
  });

  it("is the visitor's saved choice, over the owner's default", () => {
    expect(skin({ default: 'travel' }, { saved: 'dev' }).value).toBe('dev');
    expect(skin({ default: 'travel' }).value).toBe('travel');
  });

  it('is `?skin=` over what the visitor saved', () => {
    expect(skin({}, { url: 'trade', saved: 'dev' }).value).toBe('trade');
  });

  it('is what the owner forces, over everything, and then there is nothing to choose', () => {
    const forced = skin(
      { force: 'academic', default: 'travel' },
      { url: 'dev', saved: 'trade' },
    );
    expect(forced.value).toBe('academic');
    expect(forced.forced).toBe(true);
    expect(forced.locked).toBe(true);
  });

  it('leaves out what the owner turned off, from the menu and from every source', () => {
    const r = skin(
      { off: ['travel', 'dev'], default: 'travel' },
      { url: 'dev', saved: 'travel' },
    );
    expect(r.options).toEqual(['standard', 'trade', 'academic']);
    expect(r.value).toBe('standard');
  });

  it('never leaves out the one that is kept, and a force that is left out counts for nothing', () => {
    expect(skin({ off: ['standard'] }).options).toContain('standard');
    const r = skin({ off: ['travel'], force: 'travel' }, { saved: 'dev' });
    expect(r.value).toBe('dev');
    expect(r.forced).toBe(false);
  });

  it('has nothing to choose when only one is left', () => {
    const r = skin({ off: ['dev', 'trade', 'academic', 'travel'] });
    expect(r.options).toEqual(['standard']);
    expect(r.locked).toBe(true);
    expect(r.forced).toBe(false);
  });

  it('ignores a value that is not an option, wherever it comes from', () => {
    const r = skin({ default: 'nonsense' as SkinId }, { url: 'x', saved: '' });
    expect(r.value).toBe('standard');
  });

  it("takes the fallbacks after the owner's default, in their order", () => {
    const r = resolvePreference({
      all: ['en', 'vi'] as const,
      keep: 'en',
      fallbacks: [null, 'vi', 'en'],
    });
    expect(r.value).toBe('vi');
  });
});

describe('the theme', () => {
  const theme = (
    remote: Partial<RemotePref<'system' | 'light' | 'dark'>> = {},
    rest: { url?: string; saved?: string; systemDark?: boolean } = {},
  ) =>
    resolveTheme({
      remote: { off: [], ...remote },
      systemDark: false,
      ...rest,
    });

  it('follows the system when nobody says anything', () => {
    expect(theme().value).toBe('system');
    expect(theme({}, { systemDark: true }).scheme).toBe('dark');
    expect(theme({}, { systemDark: false }).scheme).toBe('light');
  });

  it("is the visitor's choice, `?theme=` first, over the owner's default", () => {
    expect(theme({ default: 'dark' }, { saved: 'light' }).value).toBe('light');
    expect(
      theme({ default: 'dark' }, { url: 'light', saved: 'dark' }).value,
    ).toBe('light');
    expect(theme({ default: 'dark' }).value).toBe('dark');
  });

  it('is the one the owner forces, and the system cannot change it', () => {
    const r = theme({ force: 'light' }, { saved: 'dark', systemDark: true });
    expect(r).toMatchObject({
      value: 'light',
      scheme: 'light',
      locked: true,
      forced: true,
    });
  });

  it('leaves a scheme out altogether, also for a visitor who follows the system', () => {
    const noDark = theme(
      { off: ['dark'] },
      { saved: 'dark', systemDark: true },
    );
    expect(noDark).toMatchObject({
      value: 'light',
      scheme: 'light',
      options: ['light'],
      locked: true,
    });
    const noLight = theme({ off: ['light'] }, { systemDark: false });
    expect(noLight).toMatchObject({
      value: 'dark',
      scheme: 'dark',
      options: ['dark'],
      locked: true,
    });
  });

  it('counts leaving out both schemes for nothing, and leaving out `system` only takes it from the menu', () => {
    expect(theme({ off: ['light', 'dark'] }).options).toEqual([
      'system',
      'light',
      'dark',
    ]);
    const noSystem = theme({ off: ['system'] }, { systemDark: true });
    expect(noSystem.options).toEqual(['light', 'dark']);
    expect(noSystem.value).toBe('light');
    expect(noSystem.locked).toBe(false);
  });
});

describe('what the owner writes in site/live', () => {
  it('is nothing forced, nothing left out, when it is not there', () => {
    const { prefs } = liveSchema.parse({});
    expect(prefs.skin).toEqual({ off: [] });
    expect(prefs.theme).toEqual({ off: [] });
    expect(prefs.language).toEqual({ off: [] });
  });

  it('keeps what is right and drops what is not, so a slip in the console never breaks the site', () => {
    const { prefs } = liveSchema.parse({
      prefs: {
        skin: { default: 'travel', force: 'nonsense', off: ['dev', 'x', 3] },
        theme: { force: 'dark', off: 'light' },
        language: { default: 'vi', off: ['en'] },
      },
    });
    expect(prefs.skin).toEqual({ default: 'travel', off: ['dev'] });
    expect(prefs.theme).toEqual({ force: 'dark', off: [] });
    expect(prefs.language).toEqual({ default: 'vi', off: ['en'] });
  });

  it('counts an empty text as nothing said: that is how the fields wait in the console', () => {
    const { prefs } = liveSchema.parse({
      prefs: {
        skin: { default: '', force: '', off: [] },
        theme: { default: '', force: '', off: [] },
        language: { default: '', force: '', off: [] },
      },
    });
    expect(prefs.skin).toEqual({ off: [] });
    expect(prefs.theme).toEqual({ off: [] });
    expect(prefs.language).toEqual({ off: [] });
  });
});

describe('the one that is never left out', () => {
  it('is the default of the site while it is on, and the first that is still on when it is not', () => {
    expect(keepOf(['en', 'vi'], 'en', [])).toBe('en');
    expect(keepOf(['en', 'vi'], 'en', ['en'])).toBe('vi');
    expect(keepOf(['en', 'vi'], 'vi', ['en'])).toBe('vi');
    // everything left out counts for nothing
    expect(keepOf(['en', 'vi'], 'en', ['en', 'vi'])).toBe('en');
  });

  it('lets a language of the site be left out: a visitor has only the other one', () => {
    const keep = keepOf(['en', 'vi'] as const, 'en', ['en']);
    const r = resolvePreference({
      all: ['en', 'vi'] as const,
      keep,
      remote: { off: ['en'] },
      saved: 'en',
      fallbacks: ['en'],
    });
    expect(r.value).toBe('vi');
    expect(r.options).toEqual(['vi']);
    expect(r.locked).toBe(true);
  });
});
