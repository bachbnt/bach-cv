/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// Which languages the site is offered in, in the order of the language menu.

import { LANGS, type Lang } from '@/lib/content/schema';

/** The languages of the site that are on (`shell.languages`), in the order of `LANGS`; one that the shell does not list is not offered. */
export const offeredLanguages = (shellLanguages: readonly Lang[]): Lang[] =>
  LANGS.filter((code) => shellLanguages.includes(code));
