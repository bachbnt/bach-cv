/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { commonCopy } from '@/content/copy/common';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import { fill } from '@/lib/chat/fill';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { DownloadCvButton } from '@/skins/trade/shell/download-cv-button';
import { FullscreenButton } from '@/skins/trade/shell/fullscreen-button';
import { LanguageMenu } from '@/skins/trade/shell/language-menu';
import { LayoutMenu } from '@/skins/trade/shell/layout-menu';
import { SkinMenu } from '@/skins/trade/shell/skin-menu';
import { SymbolButton } from '@/skins/trade/shell/symbol-button';
import { ThemeMenu } from '@/skins/trade/shell/theme-menu';

/** The id of the empty strip of the toolbar the chart puts its own controls in (a portal target). */
export const CHART_CONTROLS_ID = 'tv-chart-controls';

/**
 * The top toolbar of the terminal, one row as in a chart terminal: my logo (a link home), the symbol button that opens the search, a strip
 * the chart fills with its own controls (interval, chart type, Indicators, bar replay, undo and redo), then Layout, full screen, the
 * language, skin and theme menus (in the order of the other skins) and the CV button. On a phone the chart's strip is a row of its own
 * under them that scrolls sideways. The menus stay on a
 * phone, so a visitor can always leave the skin. Chat and Connect are in the rail (or in the row under the watchlist on a phone).
 */
export function Toolbar() {
  const copy = useCopy(commonCopy);
  const words = useCopy(tradeShellCopy).toolbar;
  return (
    <header className='flex h-10 min-w-0 items-center gap-1 border-b border-tv-line bg-tv-bg px-1.5 max-[1100px]:sticky max-[1100px]:top-0 max-[1100px]:z-30 max-[1100px]:h-auto max-[1100px]:min-h-12 max-[1100px]:flex-wrap'>
      <Link
        href='/'
        data-slot='tv-logo'
        aria-label={fill(copy.homeLink, { name: shell.name })}
        className='flex h-8 flex-none items-center gap-2 rounded px-1.5 text-sm font-bold whitespace-nowrap transition-[background-color,transform] duration-100 hover:bg-tv-hover active:scale-[.97] pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:justify-center'
      >
        <Image
          src='/logo.png'
          alt=''
          width={24}
          height={23}
          priority
          className='h-auto w-6'
        />
      </Link>
      <SymbolButton />
      <div
        id={CHART_CONTROLS_ID}
        role='group'
        aria-label={words.chartControls}
        className='flex min-w-0 items-center gap-0.5 empty:hidden max-[1100px]:order-last max-[1100px]:min-h-11 max-[1100px]:basis-full max-[1100px]:overflow-x-auto max-[1100px]:border-t max-[1100px]:border-tv-line'
      />
      <span className='flex-1' />
      <LayoutMenu />
      <span className='max-[1100px]:hidden'>
        <FullscreenButton />
      </span>
      <LanguageMenu />
      <SkinMenu />
      <ThemeMenu />
      <DownloadCvButton label={copy.downloadCv} className='ml-1' />
    </header>
  );
}
