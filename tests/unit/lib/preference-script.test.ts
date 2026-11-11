/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { liveSchema } from '@/lib/content/schema';
import { resolvePreference, resolveTheme } from '@/lib/preference/preference';
import { PREFS_SCRIPT } from '@/lib/preference/prefs-script';
import { EMPTY_PREFS, PREFS_CACHE_KEY } from '@/lib/preference/remote';
import { SKIN_IDS, SKIN_STORAGE_KEY } from '@/lib/skin/skins';
import { THEME_STORAGE_KEY } from '@/lib/theme/theme-script';
import { THEMES } from '@/lib/theme/themes';

interface Scene {
  /** what the owner said, as the last read `site/live` `prefs` that this browser kept (the raw text) */
  cache: unknown;
  search: string;
  savedSkin: string | null;
  savedTheme: string | null;
  systemDark: boolean;
}

/** Runs the head script in an empty page and says what it did. */
function run(scene: Scene) {
  const store = new Map<string, string>();
  if (scene.cache !== undefined)
    store.set(PREFS_CACHE_KEY, JSON.stringify(scene.cache));
  if (scene.savedSkin !== null) store.set(SKIN_STORAGE_KEY, scene.savedSkin);
  if (scene.savedTheme !== null) store.set(THEME_STORAGE_KEY, scene.savedTheme);
  const attrs = new Map<string, string>();
  const classes = new Set<string>();
  const timers: unknown[] = [];
  runInNewContext(PREFS_SCRIPT, {
    document: {
      documentElement: {
        setAttribute: (k: string, v: string) => attrs.set(k, v),
        hasAttribute: (k: string) => attrs.has(k),
        removeAttribute: (k: string) => attrs.delete(k),
        classList: { add: (c: string) => classes.add(c) },
      },
    },
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    },
    location: { search: scene.search },
    URLSearchParams,
    window: { matchMedia: () => ({ matches: scene.systemDark }) },
    setTimeout: (fn: unknown) => timers.push(fn),
  });
  return {
    skin: attrs.get('data-skin') ?? 'standard',
    theme: attrs.get('data-theme'),
    dark: classes.has('dark'),
    savedSkin: store.get(SKIN_STORAGE_KEY) ?? null,
    savedTheme: store.get(THEME_STORAGE_KEY) ?? null,
    watchdog: timers.length,
  };
}

/** What `preference.ts` says for the same scene: the script and the code of the page must never disagree. */
function expected(scene: Scene) {
  // the kept copy is the `prefs` object itself; one that cannot be read counts as nothing said (`readCachedPrefs`)
  const read = liveSchema.shape.prefs.safeParse(scene.cache ?? {});
  const prefs = read.success ? read.data : EMPTY_PREFS;
  const params = new URLSearchParams(scene.search);
  const urlSkin = params.get('skin');
  const urlTheme = params.get('theme');
  const skin = resolvePreference({
    all: SKIN_IDS,
    keep: 'standard',
    remote: prefs.skin,
    url: urlSkin,
    saved: scene.savedSkin,
  });
  const theme = resolveTheme({
    remote: prefs.theme,
    url: urlTheme,
    saved: scene.savedTheme,
    systemDark: scene.systemDark,
  });
  return {
    skin: skin.value,
    theme: theme.value,
    dark: theme.scheme === 'dark',
    // the script keeps nothing (the providers keep `?skin=` and `?theme=` once the owner's word is known)
    savedSkin: scene.savedSkin,
    savedTheme: scene.savedTheme,
  };
}

const REMOTES: unknown[] = [
  undefined,
  {},
  { skin: { force: 'travel' } },
  { skin: { force: 'dev', default: 'trade' } },
  { skin: { default: 'academic' } },
  { skin: { off: ['dev', 'travel'] } },
  { skin: { off: ['travel'], force: 'travel' } },
  { skin: { off: ['standard', 'trade'], default: 'trade' } },
  { skin: { off: ['dev', 'trade', 'academic', 'travel'] } },
  { theme: { force: 'dark' } },
  { theme: { default: 'dark' } },
  { theme: { off: ['dark'] } },
  { theme: { off: ['light'], default: 'light' } },
  { theme: { off: ['system'] } },
  { theme: { off: ['light', 'dark'] } },
  {
    skin: { default: 'dev', off: ['trade'] },
    theme: { default: 'dark', off: ['system'] },
  },
  'not an object',
];
const SEARCHES = [
  '',
  '?skin=dev',
  '?skin=travel',
  '?skin=nonsense',
  '?theme=dark',
  '?theme=system',
  '?skin=trade&theme=light',
];

describe('the script in <head>', () => {
  it('does what preference.ts says, for every owner, URL, saved choice and system setting', () => {
    let scenes = 0;
    for (const cache of REMOTES)
      for (const search of SEARCHES)
        for (const savedSkin of [null, 'dev', 'travel', 'standard'])
          for (const savedTheme of [null, 'dark', 'light'])
            for (const systemDark of [false, true]) {
              const scene = {
                cache,
                search,
                savedSkin,
                savedTheme,
                systemDark,
              };
              const got = run(scene);
              const want = expected(scene);
              const label = JSON.stringify(scene);
              expect(got.skin, label).toBe(want.skin);
              expect(got.theme, label).toBe(want.theme);
              expect(got.dark, label).toBe(want.dark);
              expect(got.savedSkin, label).toBe(want.savedSkin);
              expect(got.savedTheme, label).toBe(want.savedTheme);
              scenes += 1;
            }
    expect(scenes).toBeGreaterThan(1500);
  });

  it('keeps the page hidden only for a skin that is not the default, and starts the watchdog then', () => {
    const base = {
      cache: undefined,
      search: '',
      savedSkin: null,
      savedTheme: null,
      systemDark: false,
    };
    expect(run(base).watchdog).toBe(0);
    expect(run({ ...base, savedSkin: 'dev' }).watchdog).toBe(1);
    expect(run({ ...base, cache: { skin: { force: 'travel' } } }).skin).toBe(
      'travel',
    );
  });

  it('does not fail on a copy that is not what it should be, nor without storage', () => {
    const base = {
      search: '',
      savedSkin: null,
      savedTheme: null,
      systemDark: true,
    };
    expect(() => run({ ...base, cache: 42 })).not.toThrow();
    expect(run({ ...base, cache: [1, 2] }).theme).toBe('system');
    expect(THEMES).toContain('system');
  });
});
