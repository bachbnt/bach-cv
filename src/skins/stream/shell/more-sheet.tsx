/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { DownloadCv } from '@/components/download-cv';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { commonCopy } from '@/content/copy/common';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { LanguageMenu } from '@/skins/stream/shell/language-menu';
import { NavRow } from '@/skins/stream/shell/nav-row';
import { CV_ROW } from '@/skins/stream/shell/side-nav';
import { SkinMenu } from '@/skins/stream/shell/skin-menu';
import { ThemeMenu } from '@/skins/stream/shell/theme-menu';
import type { NavItem } from '@/skins/stream/shell/use-nav-items';

/** The sheet of the phone's Menu tab: the pages that did not fit in the tabs, Download CV, and the language, theme and Skin menus. */
export function MoreSheet({
  open,
  onOpenChange,
  items,
  current,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: NavItem[];
  current: PageKey | null;
}) {
  const copy = useCopy(commonCopy);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='bottom'
        className='max-h-[85dvh] gap-0 overflow-y-auto rounded-t-2xl p-3 pb-6'
      >
        <SheetTitle className='px-3 py-2 text-base font-bold'>
          {copy.menu.label}
        </SheetTitle>
        <ul className='m-0 flex list-none flex-col gap-0.5 p-0'>
          {items.map((item) => (
            <li key={item.page}>
              <NavRow
                item={item}
                current={current}
                onNavigate={() => onOpenChange(false)}
              />
            </li>
          ))}
        </ul>
        <DownloadCv label={copy.downloadCv} className={CV_ROW} />
        <div className='mt-3 flex items-center justify-around border-t border-sm-line pt-3'>
          <LanguageMenu />
          <SkinMenu />
          <ThemeMenu />
        </div>
      </SheetContent>
    </Sheet>
  );
}
