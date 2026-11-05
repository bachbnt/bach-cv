/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';
import { commonCopy } from '@/content/copy/common';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { localize, type PageKey } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';

/**
 * The tab title in the visitor's language. The static HTML carries the English title (for search engines and link
 * previews); this sets the translated one once the language is known, and again when it changes.
 */
export function DocumentTitle({ page }: { page: PageKey | 'neutral' }) {
  const nav = useCopy(commonCopy).nav;
  const { lang } = useLang();
  const title =
    page === 'neutral'
      ? undefined
      : page === 'home'
        ? localize(shell, lang).seoTitle
        : `${nav[page]} - ${shell.name}`;

  useEffect(() => {
    if (!title) return;
    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();
    // the framework sets the English metadata title again when a page finishes loading, so keep ours
    const observer = new MutationObserver(apply);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [title]);

  return null;
}
