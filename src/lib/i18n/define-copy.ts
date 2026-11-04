/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Lang } from '@/lib/content/schema';

/**
 * The same structure with every string widened, so the Vietnamese must have exactly the English keys.
 * Functions are kept as they are (a copy entry may be a function of its arguments).
 */
export type Widen<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends string
    ? string
    : T extends readonly (infer U)[]
      ? readonly Widen<U>[]
      : T extends object
        ? { [K in keyof T]: Widen<T[K]> }
        : T;

export type Localized<T> = Record<Lang, T>;

/**
 * Interface copy for one page, in both languages. TypeScript checks that `vi` has the same shape as `en`:
 *
 *   export const homeCopy = defineCopy({ title: 'Hello' }, { title: 'Xin chào' });
 *
 * This file has no 'use client', so Server Components may import copy modules too.
 * Read the copy in a component with `useCopy` (from './copy').
 */
export const defineCopy = <E>(en: E, vi: Widen<E>): Localized<Widen<E>> => ({
  en: en as Widen<E>,
  vi,
});

/** Plain pick for code outside React (it must be given the language). */
export const pickCopy = <T>(copy: Localized<T>, lang: Lang): T => copy[lang];
