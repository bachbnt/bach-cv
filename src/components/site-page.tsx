/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CSSProperties, ReactNode } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { DocumentTitle } from '@/components/document-title';
import { PageThemeVars } from '@/components/page-theme-vars';
import { SiteHeader } from '@/components/site-header';
import type { PageKey } from '@/lib/content/schema';
import { NEUTRAL_THEME, PAGE_META } from '@/lib/pages';

/**
 * Frame shared by every page: sets the page's colour pair, then header, content, footer.
 * The tinted band behind the header continues into the page head, so the page passes it in `children`.
 */
export function SitePage({
  page,
  children,
}: {
  page: PageKey | 'neutral';
  children: ReactNode;
}) {
  const theme = page === 'neutral' ? NEUTRAL_THEME : PAGE_META[page];
  return (
    <div
      style={
        {
          '--page-accent': theme.accent,
          '--page-tint-base': theme.tint,
        } as CSSProperties
      }
      className='page-theme flex flex-1 flex-col'
    >
      <DocumentTitle page={page} />
      <PageThemeVars accent={theme.accent} tint={theme.tint} />
      <div className='band-glow bg-page-tint'>
        <SiteHeader current={page} />
      </div>
      {children}
      <SiteFooter />
    </div>
  );
}
