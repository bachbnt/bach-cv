/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { commonCopy } from '@/content/copy/common';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';

export function SiteFooter() {
  const copy = useCopy(commonCopy);
  return (
    <footer className='mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-x-8 gap-y-4 px-5 pt-8 pb-24 text-[15px] text-muted-foreground min-[721px]:px-12'>
      <p>
        &copy; {new Date().getFullYear()} {shell.name}. {copy.footer.rights}
      </p>
    </footer>
  );
}
