/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLang } from './language';
import type { Localized } from './define-copy';

export {
  defineCopy,
  pickCopy,
  type Localized,
  type Widen,
} from './define-copy';

/** The copy in the visitor's language. */
export const useCopy = <T>(copy: Localized<T>): T => copy[useLang().lang];
