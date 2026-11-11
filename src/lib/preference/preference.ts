/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The three things a visitor can choose for the site (its skin, its colour theme, its language) are settled in one way, said once here: an
// owner's setting from `site/live` (`prefs`), the visitor's own choice, and the fallbacks. No React, no DOM: the head script (`prefs-script.ts`) says
// the same in ES5 and a unit test holds the two together.

import { THEMES, type Scheme, type Theme } from '@/lib/theme/themes';

/** What the owner can say about one thing, from `site/live`: what to use for a visitor who has not chosen, what to use for everyone, and what to leave out. */
export interface RemotePref<T extends string> {
  default?: T;
  force?: T;
  off: readonly T[];
}

export interface Resolved<T extends string> {
  /** what shows */
  value: T;
  /** what the menu offers, in the order of the site */
  options: T[];
  /** the owner forces it: the visitor's own choice (and `?name=`) counts for nothing and is not kept */
  forced: boolean;
  /** there is nothing for the visitor to choose: one value is forced, or only one is left */
  locked: boolean;
}

/**
 * The one that is never left out: `preferred` (the default of the site) unless the owner has left it out, and then the first of `all` that is
 * still on. Leaving out every one counts for nothing.
 */
export function keepOf<T extends string>(
  all: readonly T[],
  preferred: T,
  off: readonly T[],
): T {
  return off.includes(preferred)
    ? (all.find((value) => !off.includes(value)) ?? preferred)
    : preferred;
}

/** Nothing said: nothing forced, nothing left out. */
export const NO_REMOTE = { off: [] } as const;

/**
 * The value, by this order: what the owner forces, the visitor's own choice (`url` is `?name=value`, which a visitor can send to another;
 * `saved` is what they chose last time), what the owner set as the default, the `fallbacks` (the browser's language, the system's colours),
 * and `keep`, which is never left out. A value that the owner has left out is skipped wherever it comes from, and a force that has been
 * left out as well counts for nothing.
 */
export function resolvePreference<T extends string>({
  all,
  keep,
  remote = NO_REMOTE,
  url,
  saved,
  fallbacks = [],
}: {
  all: readonly T[];
  keep: T;
  remote?: RemotePref<T>;
  url?: string | null;
  saved?: string | null;
  fallbacks?: readonly (string | null | undefined)[];
}): Resolved<T> {
  const options = all.filter(
    (value) => value === keep || !remote.off.includes(value),
  );
  const allowed = (value: unknown): value is T =>
    typeof value === 'string' && options.includes(value as T);
  const forced = allowed(remote.force) ? remote.force : undefined;
  const chosen = [url, saved, remote.default, ...fallbacks].find(allowed);
  return {
    value: forced ?? chosen ?? keep,
    options,
    forced: forced !== undefined,
    locked: forced !== undefined || options.length < 2,
  };
}

export interface ResolvedTheme extends Resolved<Theme> {
  /** the colours that show */
  scheme: Scheme;
}

/**
 * The theme. Leaving `light` or `dark` out leaves that scheme out altogether, also for a visitor who follows the system (their system may say
 * dark: the site stays light); leaving out both is a mistake and counts for nothing. Leaving `system` out only takes it from the menu.
 */
export function resolveTheme({
  remote = NO_REMOTE,
  url,
  saved,
  systemDark,
}: {
  remote?: RemotePref<Theme>;
  url?: string | null;
  saved?: string | null;
  systemDark: boolean;
}): ResolvedTheme {
  const noLight = remote.off.includes('light');
  const noDark = remote.off.includes('dark');
  if (noLight !== noDark) {
    const only: Scheme = noLight ? 'dark' : 'light';
    return {
      value: only,
      options: [only],
      forced: true,
      locked: true,
      scheme: only,
    };
  }
  const resolved = resolvePreference<Theme>({
    all: THEMES,
    keep: 'light',
    remote: {
      ...remote,
      off: remote.off.filter((theme) => theme === 'system'),
    },
    url,
    saved,
    fallbacks: ['system'],
  });
  return {
    ...resolved,
    scheme:
      resolved.value === 'system'
        ? systemDark
          ? 'dark'
          : 'light'
        : resolved.value,
  };
}
