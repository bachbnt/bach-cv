/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { PageHead } from '@/components/page-head';
import { servicesCopy } from '@/content/copy/services';
import { useCopy } from '@/lib/i18n/copy';

/** The tinted page head, in the visitor's language. */
export function ServicesHead() {
  const copy = useCopy(servicesCopy);
  return <PageHead title={copy.title} intro={copy.intro} />;
}
