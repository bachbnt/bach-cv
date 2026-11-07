/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { commonCopy } from '@/content/copy/common';
import type { mobaCopy } from '@/content/copy/moba';
import type { PageKey } from '@/lib/content/schema';

type Common = (typeof commonCopy)['en'];
type Moba = (typeof mobaCopy)['en'];

/** The name of a page as the Standard menu says it; Home has no entry there, so the skin's own word is used. */
export const pageName = (page: PageKey, common: Common, moba: Moba): string =>
  page === 'home' ? moba.home : common.nav[page];
